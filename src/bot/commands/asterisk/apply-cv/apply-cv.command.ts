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
@Command('guicv')
export class ApplyCVCommand extends CommandMessage {
  private readonly logger = new Logger(ApplyCVCommand.name);
  private formEmbed = BuildFormEmbed;
  private componentsButton = BuildComponentsButton;

  constructor(
    // private readonly clientConfigService: MezonClientConfig,
    private readonly mezonClient: MezonClientService,
  ) {
    super();
  }

  execute(args: string | boolean | any[] | string[], message: ChannelMessage) {
    const attachmentType = message.attachments[0].filetype;
    const messageid = message.id;
    const userId = message.sender_id;

    const isValidFormat = validAttachmentTypes.includes(attachmentType);
    if (!isValidFormat) {
      return {
        msg: {
          content: 'Chỉ chấp nhận định dạng PDF hoặc DOCX.',
        },
      };
    }

    // Cache URL + avatar CV
    if (message.attachments[0]?.url) {
      cache.set(
        `cv-attachment-${messageid}-${userId}`,
        message.attachments[0].url,
        600,
      ); // 10 min
    }
    if (message.avatar) {
      cache.set(`avatar-${messageid}-${userId}`, message.avatar, 600); // 10 min
    }
    // Cache user đã click button
    cache.set(`valid-user-to-click-button-${messageid}-${userId}`, true, 600); // 10 min

    // Limit user submit CV
    const isUserAttemptSubmit = cache.has(`attempt-submit-cv-${userId}`);
    if (!isUserAttemptSubmit) {
      cache.set(`attempt-submit-cv-${userId}`, 0, 24 * 60 * 60); // 1 day
    }

    this.logger.log('URL CV:', `cv-attachment-${messageid}-${userId}`);
    this.logger.log('Avatar:', `avatar-${messageid}-${userId}`);
    const embed = BuildFormEmbed(messageid);
    const componentsButton = BuildComponentsButton(messageid);

    return this.generateReplyMessage(
      {
        embed,
        components: componentsButton,
      },
      message,
    );
  }
}
