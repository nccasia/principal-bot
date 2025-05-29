import { ChannelMessage, MezonClient } from 'mezon-sdk';
import { TalentApiData, validAttachmentTypes } from './apply-cv.constant';
import { CommandMessage } from 'src/bot/abstractions/commands/asterisk.abstract';
import { MezonClientService } from 'src/mezon/services/client.service';
import { Logger } from '@nestjs/common';
import {
  BuildComponentsButton,
  BuildFormEmbed,
  TalentCvFormDataNotFoundEmbed,
} from 'src/bot/utils/embed-props';
import { Command } from 'src/bot/decorators/command-storage.decorator';
import { CACHE_DURATION } from 'src/bot/utils/helper';
import { FormExpirationHandler } from 'src/bot/utils/form-expiration-handler';
import { CachingService } from 'src/common/services/caching.service';

@Command('guicv')
export class ApplyCVCommand extends CommandMessage {
  private readonly logger = new Logger(ApplyCVCommand.name);
  private readonly client: MezonClient;
  constructor(
    private readonly mezonClient: MezonClientService,
    private readonly cachingService: CachingService,
    private readonly formExpirationHandler: FormExpirationHandler,
  ) {
    super();
    this.client = mezonClient.getClient();
    this.logger.log(
      `ApplyCVCommand using CachingService instance: ${this.cachingService.instanceId}`,
    );
  }

  async execute(
    args: string | boolean | any[] | string[],
    message: ChannelMessage,
  ) {
    const {
      attachments,
      id: messageId,
      sender_id: userId,
      avatar,
      channel_id: channelId,
    } = message;

    if (!this.isValidAttachment(attachments[0]?.filetype)) {
      return this.replyWithError();
    }

    let talentData;
    try {
      talentData = await this.mezonClient.getTalentCvFormData();
      this.logger.log(
        '[ApplyCVCommand] talentData received:',
        JSON.stringify(talentData),
      );
      if (!talentData) {
        this.logger.error(
          `Failed to fetch talent CV form data for message ${messageId}. Proceeding without dynamic options or sending error.`,
        );
        return this.generateReplyMessage(
          {
            embed: TalentCvFormDataNotFoundEmbed,
          },
          message,
        );
      }
    } catch (error) {
      this.logger.error('Error fetching Talent CV Form Data', error);
      return this.generateReplyMessage(
        {
          embed: TalentCvFormDataNotFoundEmbed,
        },
        message,
      );
    }

    await this.cacheUserData(messageId, userId, attachments[0]?.url, avatar);
    await this.trackUserSubmissionAttempt(userId);
    await this.logCacheData(messageId, userId);

    this.formExpirationHandler.startExpirationTimer(
      messageId,
      userId,
      this.client,
      channelId,
    );
    this.logger.log(
      `Started expiration timer for form ${messageId} for user ${userId}`,
    );

    return this.generateResponseMessage(messageId, message, talentData);
  }

  private isValidAttachment(filetype: string): boolean {
    return validAttachmentTypes.includes(filetype);
  }

  private replyWithError() {
    return {
      msg: {
        content: 'Chỉ chấp nhận định dạng PDF hoặc DOCX.',
      },
    };
  }

  private async cacheUserData(
    messageId: string,
    userId: string,
    attachmentUrl?: string,
    avatar?: string,
  ): Promise<void> {
    const cacheKeyPrefix = this.getCacheKeyPrefix(messageId, userId);

    if (attachmentUrl) {
      const cvCacheKey = `cv-attachment-${cacheKeyPrefix}`;
      await this.cachingService.set(
        cvCacheKey,
        attachmentUrl,
        CACHE_DURATION.FIVE_MINUTES_MS,
      );
      this.logger.log(`Cached CV URL for key ${cvCacheKey}: ${attachmentUrl}`);
    }

    if (avatar) {
      const avatarCacheKey = `avatar-${cacheKeyPrefix}`;
      await this.cachingService.set(
        avatarCacheKey,
        avatar,
        CACHE_DURATION.FIVE_MINUTES_MS,
      );
      this.logger.log(`Cached Avatar URL for key ${avatarCacheKey}: ${avatar}`);
    }
  }

  private getCacheKeyPrefix(messageId: string, userId: string): string {
    return `${messageId}-${userId}`;
  }

  private async trackUserSubmissionAttempt(userId: string): Promise<void> {
    const attemptCacheKey = `attempt-submit-cv-${userId}`;

    if (!(await this.cachingService.has(attemptCacheKey))) {
      await this.cachingService.set(
        attemptCacheKey,
        0,
        CACHE_DURATION.ONE_DAY_MS,
      );
    }
  }

  private async logCacheData(messageId: string, userId: string): Promise<void> {
    const cacheKeyPrefix = this.getCacheKeyPrefix(messageId, userId);
    const cvAttachmentKey = `cv-attachment-${cacheKeyPrefix}`;
    const avatarKey = `avatar-${cacheKeyPrefix}`;

    const cachedCvUrl = await this.cachingService.get(cvAttachmentKey);
    const cachedAvatarUrl = await this.cachingService.get(avatarKey);

    this.logger.log('Attempting to retrieve from cache for logging:');
    this.logger.log(
      `Key for CV URL: ${cvAttachmentKey}, Retrieved Value:`,
      cachedCvUrl,
    );
    this.logger.log(
      `Key for Avatar URL: ${avatarKey}, Retrieved Value:`,
      cachedAvatarUrl,
    );
  }

  private generateResponseMessage(
    messageId: string,
    message: ChannelMessage,
    talentApiFormData: TalentApiData,
  ) {
    const embed = BuildFormEmbed(messageId, talentApiFormData);
    const componentsButton = BuildComponentsButton(
      messageId,
      message.sender_id,
    );

    return this.generateReplyMessage(
      {
        embed,
        components: componentsButton,
      },
      message,
    );
  }
}
