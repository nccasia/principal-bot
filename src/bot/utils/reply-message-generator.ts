/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { ApiMessageRef, ChannelMessage } from 'mezon-sdk';
import { MezonReplyMessage } from '../dtos/reply-message.dto';

export function generateReplyMessage(
  replayConent: { [x: string]: any },
  message: ChannelMessage,
  hasRef: boolean = true,
  newRef?: ApiMessageRef[],
): MezonReplyMessage {
  const replyMessage: MezonReplyMessage = {} as MezonReplyMessage;
  const defaultValue = {
    mentions: [],
    attachments: [],
  };
  [
    'clan_id',
    'channel_id',
    'mode',
    'is_public',
    'topic_id',
    ...Object.keys(defaultValue),
  ].forEach((field: string) => {
    const contentFieldValue: any = generateContentField(
      field,
      replayConent,
      message,
      defaultValue,
    );
    replyMessage[field] = contentFieldValue;
  });

  const messageContent = {
    t: 'messageContent' in replayConent ? replayConent['messageContent'] : '',
  };

  // option for bot's message
  [
    'lk',
    'hg',
    'mk',
    'ej',
    'vk',
    'contentThread',
    'embed',
    'components',
  ].forEach((key) => {
    if (key in replayConent) {
      messageContent[key] = replayConent[key];
    }
  });

  replyMessage['msg'] = { ...messageContent };

  replyMessage['ref'] = hasRef
    ? newRef?.length
      ? newRef
      : refGenerate(message)
    : [];

  return replyMessage;
}

export function generateContentField(
  field: string,
  replayConent: { [x: string]: any },
  message: ChannelMessage,
  defaultValue: { [x: string]: any },
): any {
  return field in replayConent
    ? replayConent[field]
    : field in defaultValue
      ? defaultValue[field]
      : message[field];
}

export function refGenerate(msg: ChannelMessage): Array<ApiMessageRef> {
  return [
    {
      message_id: '',
      message_ref_id: msg.message_id,
      ref_type: 0,
      message_sender_id: msg.sender_id,
      message_sender_username: msg.username,
      mesages_sender_avatar: msg.avatar,
      message_sender_clan_nick: msg.clan_nick,
      message_sender_display_name: msg.display_name,
      content: JSON.stringify(msg.content),
      has_attachment: !!msg?.attachments?.length || false,
    },
  ];
}
