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

    const isValidFormat = validAttachmentTypes.includes(attachmentType);
    if (!isValidFormat) {
      return {
        msg: {
          content: 'Chỉ chấp nhận định dạng PDF hoặc DOCX.',
        },
      };
    }

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
