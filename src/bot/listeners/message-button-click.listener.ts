/* eslint-disable @typescript-eslint/no-base-to-string */
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
  ValidationErrorEmbed,
} from '../utils/embed-props';
@Injectable()
export class MessageButtonClickListener {
  protected client: MezonClient;
  protected readonly processedEvents = new Map<string, number>();
  private static processedSubmissions = new Map<string, number>();

  private readonly formSubmissionCleanUp = (now: number) => {
    const isProcessedEventsSizeGreaterThan100 = this.processedEvents.size > 100;
    if (isProcessedEventsSizeGreaterThan100) {
      const fiveMinutesAgo = now - 300000;
      for (const [key, timestamp] of this.processedEvents.entries()) {
        if (timestamp < fiveMinutesAgo) {
          this.processedEvents.delete(key);
        }
      }
    }
  };
  private checkEventProcessed = (now: number, eventId: string) => {
    const isEventHasProcessed = this.processedEvents.has(eventId);
    if (isEventHasProcessed) {
      const lastProcessed = this.processedEvents.get(eventId);
      const isEventProcessedIn2Seconds = now - lastProcessed < 2000;
      if (isEventProcessedIn2Seconds) {
        this.logger.log(`Đã bỏ qua sự kiện trùng lặp: ${eventId}`);
        return;
      }
    }
  };
  private checkAndRegisterFormAction(actionId: string): boolean {
    if (MessageButtonClickListener.processedSubmissions.has(actionId)) {
      this.logger.log(`Action already processed: ${actionId}`);
      return true;
    }
    MessageButtonClickListener.processedSubmissions.set(actionId, Date.now());
    setTimeout(() => {
      MessageButtonClickListener.processedSubmissions.delete(actionId);
    }, 300000); // 5 minutes
    return false;
  }

  constructor(
    clientService: MezonClientService,
    private readonly eventEmitter: EventEmitter2,
  ) {
    this.client = clientService.getClient();
  }
  private readonly logger = new Logger(MessageButtonClickListener.name);

  @OnEvent('message_button_clicked')
  async handleButtonForm(data) {
    try {
      const eventId = `${data.message_id}_${data.button_id}_${data.user_id}`;
      const now = Date.now();

      this.formSubmissionCleanUp(now);
      this.checkEventProcessed(now, eventId);
      this.processedEvents.set(eventId, now);

      this.logger.log('Xử lý sự kiện button click:', data.button_id);

      const splitButtonId = data.button_id.split('_');
      if (splitButtonId.length !== 3) {
        this.logger.warn('Định dạng button ID không hợp lệ:', data.button_id);
        return;
      }

      const formType = splitButtonId[0]; // CV
      const messageId = splitButtonId[1]; // ID tin nhắn
      const action = splitButtonId[2]; // submit hoặc cancel

      // Xử lý form CV
      if (formType === 'CV') {
        if (action === 'submit') {
          await this.handleSubmitCV(data, messageId);
        } else if (action === 'cancel') {
          await this.handleCancelCV(data, messageId);
        }
      }
    } catch (error) {
      this.logger.error('Lỗi xử lý sự kiện click button:', error);
    }
  }

  async serverSendMessage(channelId, messageEmbedProps: EmbedProps[]) {
    try {
      const channel = await this.client.channels.fetch(channelId);
      await channel.send({
        embed: messageEmbedProps,
      });
    } catch (error) {
      this.logger.error('Lỗi trong serverSendMessage:', error);
    }
  }

  async serverEditMessage(data, embedProps: EmbedProps[]) {
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

  async handleSubmitCV(data, messageId) {
    try {
      const formSubmissionId = `form_${messageId}_${data.user_id}`;
      if (this.checkAndRegisterFormAction(formSubmissionId)) return;

      // Parse data từ form
      const extraData = JSON.parse(data.extra_data);
      const formValues = {};
      const fieldKeys = [
        'fullname',
        'email',
        'phone',
        'candidate-type',
        'position',
        'branch',
        'cv-source',
        'dob',
        'gender',
        'address',
        'note',
      ];

      // Extract values từ extraData đã parse
      for (const key of fieldKeys) {
        const fieldKey = `applycv-${messageId}-${key}`;
        formValues[key] = Array.isArray(extraData[fieldKey])
          ? extraData[fieldKey][0] // Lấy giá trị đầu tiên nếu là mảng
          : extraData[fieldKey]; // Sử dụng nguyên giá trị nếu không phải mảng
      }
      this.logger.log('Giá trị form đã parse:', formValues);

      // Validate dữ liệu
      const cvForm = plainToClass(CvFormDto, formValues);
      this.logger.log('Dữ liệu form sau khi parse:', cvForm);
      const errors = await validate(cvForm);
      this.logger.log('Kết quả validate:', errors);

      if (errors.length > 0) {
        const errorMessages = errors.map((err) =>
          Object.values(err.constraints || {}).join(', '),
        );

        const validationErrorEmbed = ValidationErrorEmbed(errorMessages);

        await this.serverEditMessage(data, validationErrorEmbed);
        return;
      }

      const confirmEmbed = BuildConfirmFormEmbed(formValues);

      try {
        await this.serverEditMessage(data, confirmEmbed);
        this.logger.log('Đã gửi xác nhận nộp CV thành công');
        this.logger.log('Thông tin form:', formValues);
      } catch (sendError) {
        this.logger.error('Lỗi khi gửi tin nhắn xác nhận CV:', sendError);
        MessageButtonClickListener.processedSubmissions.delete(
          formSubmissionId,
        );
      }
    } catch (error) {
      this.logger.error('Lỗi trong handleSubmitCV:', error);
    }
  }

  async handleCancelCV(data, messageId) {
    try {
      const cancelActionId = `cancel_${messageId}_${data.user_id}`;
      if (this.checkAndRegisterFormAction(cancelActionId)) return;

      const cancelEmbed = CancelFormEmbed;
      try {
        await this.serverEditMessage(data, cancelEmbed);
        this.logger.log('Đã gửi thông báo hủy form CV');
      } catch (sendError) {
        this.logger.error('Lỗi khi gửi thông báo hủy CV:', sendError);
        MessageButtonClickListener.processedSubmissions.delete(cancelActionId);
      }
    } catch (error) {
      this.logger.error('Lỗi trong handleCancelCV:', error);
    }
  }
}
