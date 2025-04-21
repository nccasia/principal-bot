import {
  ApiMessageAttachment,
  ApiMessageMention,
  ApiMessageRef,
  ChannelMessageContent,
} from 'mezon-sdk';

export interface MezonReplyMessage {
  clan_id?: string;
  channel_id?: string;
  channelDmId?: string;
  is_public?: boolean;
  is_parent_public?: boolean;
  parent_id?: string;
  mode?: number;
  msg?: ChannelMessageContent;
  mentions?: Array<ApiMessageMention>;
  attachments?: Array<ApiMessageAttachment>;
  ref?: Array<ApiMessageRef>;
  userId?: string;
  textContent?: string;
  messOptions?: {
    [x: string]: any;
  };
  refs?: Array<ApiMessageRef>;
  sender_id?: string;
  anonymous_message?: boolean;
  mention_everyone?: boolean;
  avatar?: string;
  code?: number;
  topic_id?: string;
}

export interface MezonReactMessageChannel {
  id?: string;
  clan_id: string;
  parent_id?: string;
  channel_id: string;
  mode: number;
  is_public: boolean;
  is_parent_public: boolean;
  message_id: string;
  emoji_id: string;
  emoji: string;
  count: number;
  message_sender_id: string;
  action_delete?: boolean;
}
