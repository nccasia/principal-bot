/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { MezonClient } from 'mezon-sdk';
import { MezonClientService } from 'src/mezon/services/client.service';
import { EmbedProps } from 'src/bot/commands/asterisk/config/config.interface';
import { plainToClass } from 'class-transformer';
import { CvFormDto } from '../dtos/cv-form.dto';
import { validate } from 'class-validator';
import {
  BuildConfirmFormEmbed,
  CancelFormEmbed,
  LimitSubmitCVEmbed,
  ValidationErrorEmbed,
} from '../utils/embed-props';
import cache from '../utils/shared-cache';
import { CvFormRepository } from '../repositories/cv-form.repository';
import { TalentApiService } from '../services/talent-api.service';
import { ExternalCvPayloadDto } from '../dtos/external-cv-payload.dto';
import {
  getCVSourceIdFromCVSourceValue,
  getBranchIdFromBranchName,
  getSubPositionIdFromSubPositionName,
} from '../utils/helper';
import { UserLimitSubmitRepository } from '../repositories/user-limit-submit.repository';
import {
  CACHE_DURATION,
  SUBMISSION_LIMITS,
  FORM_TYPES,
  ACTIONS,
  FORM_FIELD_KEYS,
  ButtonClickEventData,
} from '../utils/helper';

@Injectable()
export class MessageButtonClickListener {
  protected client: MezonClient;
  protected readonly processedEvents = new Map<string, number>();
  private static processedSubmissions = new Map<string, number>();
  private readonly logger = new Logger(MessageButtonClickListener.name);

  constructor(
    clientService: MezonClientService,
    private readonly eventEmitter: EventEmitter2,
    private readonly cvRepository: CvFormRepository,
    private readonly talentApiService: TalentApiService,
    private readonly userLimitSubmitRepository: UserLimitSubmitRepository,
  ) {
    this.client = clientService.getClient();
  }

  @OnEvent('message_button_clicked')
  async handleButtonForm(data: ButtonClickEventData): Promise<void> {
    try {
      const eventId = this.createEventId(data);
      const now = Date.now();

      this.cleanupProcessedEvents(now);
      if (this.isEventRecentlyProcessed(eventId, now)) {
        return;
      }

      this.processedEvents.set(eventId, now);
      this.logger.log('Xử lý sự kiện button click:', data.button_id);

      const { formType, messageId, action } = this.parseButtonId(
        data.button_id,
      );
      if (!formType || !messageId || !action) {
        return;
      }

      if (formType === FORM_TYPES.CV) {
        await this.handleCVFormAction(data, messageId, action);
      }
    } catch (error) {
      this.logger.error('Lỗi xử lý sự kiện click button:', error);
    }
  }

  private createEventId(data: ButtonClickEventData): string {
    return `${data.message_id}_${data.button_id}_${data.user_id}`;
  }

  private cleanupProcessedEvents(now: number): void {
    if (this.processedEvents.size > 100) {
      const fiveMinutesAgo = now - CACHE_DURATION.FIVE_MINUTES_MS;
      for (const [key, timestamp] of this.processedEvents.entries()) {
        if (timestamp < fiveMinutesAgo) {
          this.processedEvents.delete(key);
        }
      }
    }
  }

  private isEventRecentlyProcessed(eventId: string, now: number): boolean {
    if (this.processedEvents.has(eventId)) {
      const lastProcessed = this.processedEvents.get(eventId);
      if (now - lastProcessed < CACHE_DURATION.TWO_SECONDS_MS) {
        this.logger.log(`Đã bỏ qua sự kiện trùng lặp: ${eventId}`);
        return true;
      }
    }
    return false;
  }

  private parseButtonId(buttonId: string): {
    formType: string;
    messageId: string;
    action: string;
  } {
    const splitButtonId = buttonId.split('_');
    if (splitButtonId.length !== 3) {
      this.logger.warn('Định dạng button ID không hợp lệ:', buttonId);
      return { formType: null, messageId: null, action: null };
    }

    return {
      formType: splitButtonId[0],
      messageId: splitButtonId[1],
      action: splitButtonId[2],
    };
  }

  private async handleCVFormAction(
    data: ButtonClickEventData,
    messageId: string,
    action: string,
  ): Promise<void> {
    if (action === ACTIONS.SUBMIT) {
      await this.handleSubmitCV(data, messageId);
    } else if (action === ACTIONS.CANCEL) {
      await this.handleCancelCV(data, messageId);
    }
  }

  private checkAndRegisterFormAction(actionId: string): boolean {
    if (MessageButtonClickListener.processedSubmissions.has(actionId)) {
      this.logger.log(`Action already processed: ${actionId}`);
      return true;
    }

    MessageButtonClickListener.processedSubmissions.set(actionId, Date.now());

    setTimeout(() => {
      MessageButtonClickListener.processedSubmissions.delete(actionId);
    }, CACHE_DURATION.FIVE_MINUTES_MS);

    return false;
  }

  private async serverSendMessage(
    channelId: string,
    messageEmbedProps: EmbedProps[],
  ): Promise<void> {
    try {
      const channel = await this.client.channels.fetch(channelId);
      await channel.send({
        embed: messageEmbedProps,
      });
    } catch (error) {
      this.logger.error('Lỗi trong serverSendMessage:', error);
    }
  }

  private async serverEditMessage(
    data: ButtonClickEventData,
    embedProps: EmbedProps[],
  ): Promise<void> {
    try {
      const channel = await this.client.channels.fetch(data.channel_id);
      const message = await channel.messages.fetch(data.message_id);

      await message.update({
        embed: embedProps,
        components: [],
      });

      this.logger.log('Form đã được cập nhật thành công');
    } catch (error) {
      this.logger.error('Lỗi khi cập nhật tin nhắn:', error);
    }
  }

  private async handleSubmitCV(
    data: ButtonClickEventData,
    messageId: string,
  ): Promise<void> {
    try {
      if (!this.isValidUserForAction(data.user_id, messageId)) {
        return;
      }

      const formSubmissionId = `form_${messageId}_${data.user_id}`;
      if (this.checkAndRegisterFormAction(formSubmissionId)) {
        return;
      }

      const formValues = this.parseFormValues(data);
      this.logger.log('Giá trị form đã parse:', formValues);

      const validationResult = await this.validateCVForm(formValues);
      if (!validationResult.isValid) {
        await this.handleValidationErrors(data, validationResult.errors);
        return;
      }

      const cvForm = validationResult.form;

      if (await this.hasReachedSubmissionLimit(data.user_id, data)) {
        return;
      }

      await this.processValidCVSubmission(data, messageId, cvForm, formValues);
    } catch (error) {
      this.logger.error('Lỗi trong handleSubmitCV:', error);
    }
  }

  private isValidUserForAction(userId: string, messageId: string): boolean {
    const validUserToClickButton = cache.get(
      `valid-user-to-click-button-${messageId}-${userId}`,
    );

    if (!validUserToClickButton) {
      this.logger.warn('User không hợp lệ đã click button Submit CV');
      return false;
    }

    return true;
  }

  private parseFormValues(data: ButtonClickEventData): Record<string, any> {
    const extraData = JSON.parse(data.extra_data);
    const formValues = {};

    const { messageId } = this.parseButtonId(data.button_id);

    for (const key of FORM_FIELD_KEYS) {
      const fieldKey = `applycv-${messageId}-${key}`;
      formValues[key] = Array.isArray(extraData[fieldKey])
        ? extraData[fieldKey][0]
        : extraData[fieldKey];
    }

    return formValues;
  }

  private async validateCVForm(formValues: Record<string, any>): Promise<{
    isValid: boolean;
    form?: CvFormDto;
    errors?: string[];
  }> {
    const cvForm = plainToClass(CvFormDto, formValues);
    this.logger.log('Dữ liệu form sau khi parse:', cvForm);

    const errors = await validate(cvForm);
    this.logger.log('Kết quả validate:', errors);

    if (errors.length > 0) {
      const errorMessages = errors.map((err) =>
        Object.values(err.constraints || {}).join(', '),
      );

      return {
        isValid: false,
        errors: errorMessages,
      };
    }

    return {
      isValid: true,
      form: cvForm,
    };
  }

  private async handleValidationErrors(
    data: ButtonClickEventData,
    errorMessages: string[],
  ): Promise<void> {
    const validationErrorEmbed = ValidationErrorEmbed(errorMessages);
    await this.serverEditMessage(data, validationErrorEmbed);
  }

  private async hasReachedSubmissionLimit(
    userId: string,
    data: ButtonClickEventData,
  ): Promise<boolean> {
    const cacheKeySubmitCV = `attempt-submit-cv-${userId}`;
    let currentAttemptCount = cache.get(cacheKeySubmitCV) as number | undefined;

    if (currentAttemptCount === undefined) {
      currentAttemptCount = 0;
    }

    if (currentAttemptCount >= SUBMISSION_LIMITS.CACHE_LIMIT) {
      this.logger.log(
        `User ${userId} has reached submission limit. Attempts: ${currentAttemptCount}`,
      );
      await this.serverEditMessage(data, LimitSubmitCVEmbed(1));
      return true;
    }

    const userAttemptSubmitCv =
      await this.userLimitSubmitRepository.getUserAttemptSubmitCV(userId);
    if (userAttemptSubmitCv >= SUBMISSION_LIMITS.DATABASE_LIMIT) {
      this.logger.log(
        `User ${userId} has reached submission limit. Attempts: ${userAttemptSubmitCv}`,
      );
      await this.serverEditMessage(data, LimitSubmitCVEmbed(2));
      return true;
    }

    return false;
  }

  private async processValidCVSubmission(
    data: ButtonClickEventData,
    messageId: string,
    cvForm: CvFormDto,
    formValues: Record<string, any>,
  ): Promise<void> {
    try {
      const avatarUrl: string = cache.get(
        `avatar-${messageId}-${data.user_id}`,
      );
      const confirmEmbed = BuildConfirmFormEmbed(formValues, avatarUrl);

      await this.serverEditMessage(data, confirmEmbed);

      const attachmentUrlFromCache = cache.get(
        `cv-attachment-${messageId}-${data.user_id}`,
      );

      this.logger.log('Avatar:', `avatar-${messageId}-${data.user_id}`);
      if (attachmentUrlFromCache) {
        this.logger.log('Đã tìm thấy URL CV:', attachmentUrlFromCache);
      } else {
        this.logger.log('Không tìm thấy URL CV');
      }

      this.submitCandidateToExternalSystem(cvForm, attachmentUrlFromCache);

      this.cleanupAfterSuccessfulSubmission(data.user_id, messageId);
      await this.updateSubmissionCounters(data.user_id);

      this.logger.log('Đã gửi xác nhận nộp CV thành công');
      this.logger.log('Thông tin form:', formValues);
    } catch (sendError) {
      this.logger.error('Lỗi khi gửi tin nhắn xác nhận CV:', sendError);
      const formSubmissionId = `form_${messageId}_${data.user_id}`;
      MessageButtonClickListener.processedSubmissions.delete(formSubmissionId);
    }
  }

  private submitCandidateToExternalSystem(
    cvForm: CvFormDto,
    attachmentUrl: unknown,
  ): void {
    const externalCvPayload = new ExternalCvPayloadDto();
    externalCvPayload.Name = cvForm.fullname;
    externalCvPayload.Email = cvForm.email;
    externalCvPayload.Phone = cvForm.phone;
    externalCvPayload.SubPositionId = getSubPositionIdFromSubPositionName(
      cvForm['position'],
    );
    externalCvPayload.BranchId = getBranchIdFromBranchName(cvForm.branch);
    externalCvPayload.CVSourceId = getCVSourceIdFromCVSourceValue(
      cvForm['cv-source'],
    );
    externalCvPayload.Birthday = cvForm.dob || null;
    externalCvPayload.IsFemale = cvForm.gender === 'female';
    externalCvPayload.Address = cvForm.address || null;
    externalCvPayload.Note = cvForm.note || null;
    externalCvPayload.LinkCV = attachmentUrl as string;

    this.talentApiService.submitCandidateCV(externalCvPayload);
    this.logger.log('Payload:', externalCvPayload);
  }

  private cleanupAfterSuccessfulSubmission(
    userId: string,
    messageId: string,
  ): void {
    cache.del(`valid-user-to-click-button-${messageId}-${userId}`);
  }

  private async updateSubmissionCounters(userId: string): Promise<void> {
    const cacheKeySubmitCV = `attempt-submit-cv-${userId}`;
    let currentAttemptCount = cache.get(cacheKeySubmitCV) as number | undefined;
    if (currentAttemptCount === undefined) {
      currentAttemptCount = 0;
    }

    const newAttemptCount = currentAttemptCount + 1;
    cache.set(cacheKeySubmitCV, newAttemptCount);
    this.logger.log(
      `User ${userId} CV submitted. Attempt count updated to: ${newAttemptCount}`,
    );

    await this.userLimitSubmitRepository.updateUserAttemptSubmitCV(userId);
  }

  private async handleCancelCV(
    data: ButtonClickEventData,
    messageId: string,
  ): Promise<void> {
    try {
      if (!this.isValidUserForAction(data.user_id, messageId)) {
        return;
      }

      const cancelActionId = `cancel_${messageId}_${data.user_id}`;
      if (this.checkAndRegisterFormAction(cancelActionId)) {
        return;
      }

      await this.serverEditMessage(data, CancelFormEmbed);
      this.logger.log('Đã gửi thông báo hủy form CV');

      cache.del(`valid-user-to-click-button-${messageId}-${data.user_id}`);
    } catch (error) {
      this.logger.error('Lỗi trong handleCancelCV:', error);
      const cancelActionId = `cancel_${messageId}_${data.user_id}`;
      MessageButtonClickListener.processedSubmissions.delete(cancelActionId);
    }
  }
}
