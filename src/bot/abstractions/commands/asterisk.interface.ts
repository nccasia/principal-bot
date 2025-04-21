import { ChannelMessage } from 'mezon-sdk';
import { MezonReplyMessage } from 'src/bot/dtos/reply-message.dto';

export interface IAsteriskInterface {
  execute: (
    messageContent: string,
    message: ChannelMessage,
    commandName?: string,
  ) => MezonReplyMessage | null | MezonReplyMessage[];
}
