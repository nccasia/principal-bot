import { ChannelMessage } from 'mezon-sdk';
import { validAttachmentTypes } from './apply-cv.constant';
import { CommandMessage } from 'src/bot/abstractions/commands/asterisk.abstract';
import { MezonClientService } from 'src/mezon/services/client.service';
import { Logger } from '@nestjs/common';
import {
  BuildComponentsButton,
  BuildFormEmbed,
} from 'src/bot/utils/embed-props';
import { Command } from 'src/bot/decorators/command-storage.decorator';
import cache from 'src/bot/utils/shared-cache';
import { CACHE_DURATION } from 'src/bot/utils/helper';

@Command('guicv')
export class ApplyCVCommand extends CommandMessage {
  private readonly logger = new Logger(ApplyCVCommand.name);

  constructor(private readonly mezonClient: MezonClientService) {
    super();
  }

  execute(args: string | boolean | any[] | string[], message: ChannelMessage) {
    const { attachments, id: messageId, sender_id: userId, avatar } = message;

    if (!this.isValidAttachment(attachments[0]?.filetype)) {
      return this.replyWithError();
    }

    this.cacheUserData(messageId, userId, attachments[0]?.url, avatar);
    this.trackUserSubmissionAttempt(userId);
    this.logCacheData(messageId, userId);

    return this.generateResponseMessage(messageId, message);
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

  private cacheUserData(
    messageId: string,
    userId: string,
    attachmentUrl?: string,
    avatar?: string,
  ): void {
    const cacheKeyPrefix = this.getCacheKeyPrefix(messageId, userId);

    if (attachmentUrl) {
      cache.set(
        `cv-attachment-${cacheKeyPrefix}`,
        attachmentUrl,
        CACHE_DURATION.FIVE_MINUTES_SECONDS,
      );
    }

    if (avatar) {
      cache.set(
        `avatar-${cacheKeyPrefix}`,
        avatar,
        CACHE_DURATION.FIVE_MINUTES_SECONDS,
      );
    }

    cache.set(
      `valid-user-to-click-button-${cacheKeyPrefix}`,
      true,
      CACHE_DURATION.FIVE_MINUTES_SECONDS,
    );
  }

  private getCacheKeyPrefix(messageId: string, userId: string): string {
    return `${messageId}-${userId}`;
  }

  private trackUserSubmissionAttempt(userId: string): void {
    const attemptCacheKey = `attempt-submit-cv-${userId}`;

    if (!cache.has(attemptCacheKey)) {
      cache.set(attemptCacheKey, 0, CACHE_DURATION.ONE_DAY_SECONDS);
    }
  }

  private logCacheData(messageId: string, userId: string): void {
    const cacheKeyPrefix = this.getCacheKeyPrefix(messageId, userId);
    this.logger.log('URL CV:', `cv-attachment-${cacheKeyPrefix}`);
    this.logger.log('Avatar:', `avatar-${cacheKeyPrefix}`);
  }

  private generateResponseMessage(messageId: string, message: ChannelMessage) {
    const embed = BuildFormEmbed(messageId);
    const componentsButton = BuildComponentsButton(messageId);

    return this.generateReplyMessage(
      {
        embed,
        components: componentsButton,
      },
      message,
    );
  }
}
