import { ApiMessageRef, ChannelMessage } from 'mezon-sdk';
import { MezonReplyMessage } from 'src/bot/dtos/reply-message.dto';
import { generateReplyMessage } from 'src/bot/utils/reply-message-generator';

export abstract class CommandMessage {
  abstract execute(
    args: string | boolean | any[] | string[],
    message: ChannelMessage,
    commandName?: string,
  ): any;

  generateReplyMessage(
    replayConent: { [x: string]: any },
    message: ChannelMessage,
    hasRef: boolean = true,
    newRef?: ApiMessageRef[],
  ): MezonReplyMessage {
    return generateReplyMessage(replayConent, message, hasRef, newRef);
  }
}
