/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable, Logger } from '@nestjs/common';
import { MezonClientConfig } from '../dtos/mezon-client-config';
import { ChannelMessage, MezonClient } from 'mezon-sdk';
import { Asterisk } from 'src/bot/commands/asterisk/asterisk';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TextChannel } from 'mezon-sdk/dist/cjs/mezon-client/structures/TextChannel';
import { validAttachmentTypes } from 'src/bot/commands/asterisk/apply-cv/apply-cv.constant';
import { AppConfigService } from 'src/config/app-config.service';
import cache from 'src/bot/utils/shared-cache';
import { CACHE_DURATION } from 'src/bot/utils/helper';

@Injectable()
export class MezonClientService {
  private readonly logger = new Logger(MezonClientService.name);
  private client: MezonClient;
  private readonly config: MezonClientConfig;
  private processedButtonEvents = new Map<string, number>();
  private channel_test: TextChannel;

  private static isInitialized = false;

  constructor(
    private appConfigService: AppConfigService,
    private readonly asterisk: Asterisk,
    private readonly eventEmitter: EventEmitter2,
  ) {
    this.logger.log(
      `MezonClientService constructor called, instance: ${Math.random().toString(36).substring(7)}`,
    );
    this.config = this.appConfigService.mezonConfig;
    if (!this.config.token) {
      this.logger.error('Mezon token is missing in configuration!');
      throw new Error(
        'Mezon token is undefined. Cannot initialize MezonClientService.',
      );
    }
    this.client = new MezonClient(this.config.token);
  }

  getClient(): MezonClient {
    return this.client;
  }

  async initializeClient() {
    if (MezonClientService.isInitialized) {
      this.logger.warn(
        'Mezon client already globally initialized, skipping duplicate initialization',
      );
      return true;
    }

    if ((this as any)._clientInitialized) {
      this.logger.warn(
        'Mezon client already initialized for this instance, skipping duplicate initialization',
      );
      return true;
    }

    try {
      this.logger.log('Starting Mezon client initialization...');
      await this.client.login();
      this.logger.log('Login successful');

      this.setupButtonEventHandlers();
      this.setupReadyEventHandler();
      this.setupUserChannelAddedHandler();
      this.setupChannelMessageHandler();

      (this as any)._clientInitialized = true;
      MezonClientService.isInitialized = true;
      this.logger.log('Mezon client fully initialized');

      return true;
    } catch (error) {
      this.logger.error('Error initializing Mezon client', error);
      throw error;
    }
  }

  private setupButtonEventHandlers() {
    if ((this.client as any)._buttonEventHandlerRegistered) {
      this.logger.warn(
        'Button event handler already registered, skipping duplicate registration',
      );
      return;
    }

    this.client.on('message_button_clicked', (data) => {
      const now = Date.now();

      const enrichedData = {
        ...data,
        _timestamp: now,
      };

      this.logger.log('Button clicked:', enrichedData);
      this.eventEmitter.emit('message_button_clicked', enrichedData);
    });

    (this.client as any)._buttonEventHandlerRegistered = true;
    this.logger.log('Button event handler registered successfully');
  }

  private createButtonEventId(data) {
    return `${data.message_id}_${data.button_id}_${data.user_id}`;
  }

  private isButtonEventDuplicate(eventId: string, now: number): boolean {
    if (this.processedButtonEvents.has(eventId)) {
      const lastProcessed = this.processedButtonEvents.get(eventId);
      if (now - lastProcessed < 2000) {
        this.logger.log(`Bỏ qua sự kiện button trùng lặp: ${eventId}`);
        return true;
      }
    }
    return false;
  }

  private recordButtonEvent(eventId: string, timestamp: number) {
    this.processedButtonEvents.set(eventId, timestamp);
  }

  private cleanupButtonEvents(now: number) {
    if (this.processedButtonEvents.size > 100) {
      const fiveMinutesAgo = now - 300000;
      for (const [key, timestamp] of this.processedButtonEvents.entries()) {
        if (timestamp < fiveMinutesAgo) {
          this.processedButtonEvents.delete(key);
        }
      }
    }
  }

  private setupReadyEventHandler() {
    if ((this.client as any)._readyEventHandlerRegistered) {
      this.logger.warn(
        'Ready event handler already registered, skipping duplicate registration',
      );
      return;
    }

    this.client.once('ready', async () => {
      this.logger.log('Mezon client is ready!');
      this.channel_test = await this.client.channels.fetch(
        this.config.channel_test_id,
      );

      if (this.channel_test) {
        this.logger.log(`Channel found: ${this.channel_test.name}`);
      } else {
        this.logger.warn('Channel not found');
      }

      this.logger.log('Event listeners registered successfully');
    });

    (this.client as any)._readyEventHandlerRegistered = true;
    this.logger.log('Ready event handler registered successfully');
  }

  private setupUserChannelAddedHandler() {
    if ((this.client as any)._userChannelAddedHandlerRegistered) {
      this.logger.warn(
        'User channel added handler already registered, skipping duplicate registration',
      );
      return;
    }

    this.client.onUserChannelAdded((event) => {
      const user = event.users[0];
      const channelName = event.channel_desc.clan_name;

      this.channel_test.send({
        t: `Xin chào ${user.username}! Chào mừng bạn đến với kênh ${channelName}. Hãy sử dụng lệnh *guicv và đính kèm 01 file (.docx hoặc .pdf) để gửi CV của bạn.`,
      });
    });

    (this.client as any)._userChannelAddedHandlerRegistered = true;
    this.logger.log('User channel added handler registered successfully');
  }

  private setupChannelMessageHandler() {
    if ((this.client as any)._channelMessageHandlerRegistered) {
      this.logger.warn(
        'Channel message handler already registered, skipping duplicate registration',
      );
      return;
    }

    this.client.onChannelMessage(async (message: ChannelMessage) => {
      if (
        message.sender_id === '1840677387214262272' ||
        message.username === 'Principal'
      ) {
        return;
      }

      if (!this.isMessageFromAllowedChannel(message)) {
        return;
      }

      this.logMessageReceived(message);

      const channelRep = this.client.channels.fetch(message.channel_id);
      const messageDemand = this.getDefaultMessageDemand();

      try {
        await this.processMessage(message, channelRep, messageDemand);
      } catch (error) {
        this.logger.error('Error processing message:', error);
        this.sendReply(
          channelRep,
          {
            t: 'Đã xảy ra lỗi khi xử lý tin nhắn.',
          },
          message,
        );
      }
    });

    (this.client as any)._channelMessageHandlerRegistered = true;
    this.logger.log('Channel message handler registered successfully');
  }

  private isMessageFromAllowedChannel(message: ChannelMessage): boolean {
    const allowedChannel = [this.config.channel_test_id];

    if (!allowedChannel.includes(message.channel_id)) {
      this.logger.log(
        `Received message from ${message.username} in an unauthorized channel: ${message.channel_id}`,
      );
      return false;
    }
    return true;
  }

  private logMessageReceived(message: ChannelMessage) {
    this.logger.log(
      `Received message from ${message.username}: ${message.content?.t}`,
    );
    console.log('Message received:', message);
  }

  private getDefaultMessageDemand(): string {
    return 'Vui lòng gửi lệnh *guicv và đính kèm DUY NHẤT 01 file CV (.docx hoặc .pdf) để gửi CV của bạn.';
  }

  private async processMessage(
    message: ChannelMessage,
    channelRep: Promise<TextChannel>,
    messageDemand: string,
  ) {
    if (this.hasMultipleAttachments(message)) {
      await this.handleMultipleAttachments(message, channelRep, messageDemand);
    } else if (this.hasCommandWithAttachment(message)) {
      await this.handleCommandWithAttachment(
        message,
        channelRep,
        messageDemand,
      );
    } else if (this.hasAttachmentWithoutCommand(message)) {
      await this.handleAttachmentWithoutCommand(
        message,
        channelRep,
        messageDemand,
      );
    } else if (this.hasCommandWithoutAttachment(message)) {
      await this.handleCommandWithoutAttachment(
        message,
        channelRep,
        messageDemand,
      );
    }
  }

  private hasMultipleAttachments(message: ChannelMessage): boolean {
    return (
      message.attachments?.length > 1 && message.content?.t?.startsWith('*')
    );
  }

  private async handleMultipleAttachments(
    message: ChannelMessage,
    channelRep: Promise<TextChannel>,
    messageDemand: string,
  ) {
    this.logger.log('Receiving multiple attachments - rejecting');
    await this.sendReply(channelRep, { t: messageDemand }, message);
  }

  private hasCommandWithAttachment(message: ChannelMessage): boolean {
    return (
      message.content?.t?.startsWith('*') && message.attachments?.length > 0
    );
  }

  private async handleCommandWithAttachment(
    message: ChannelMessage,
    channelRep: Promise<TextChannel>,
    messageDemand: string,
  ) {
    this.logger.log('Processing guicv command with attachment');

    if (!this.hasValidAttachment(message)) {
      this.logger.warn('Missing attachment metadata');
      await this.sendReply(
        channelRep,
        {
          t: 'Không thể xác định loại file. Vui lòng thử lại.',
        },
        message,
      );
      return;
    }

    const attachmentType = message.attachments[0].filetype;
    this.logger.log(`Attachment type: ${attachmentType}`);

    if (!this.isValidFileFormat(attachmentType)) {
      this.logger.warn(`Invalid file type: ${attachmentType}`);
      await this.sendReply(channelRep, { t: messageDemand }, message);
      return;
    }

    await this.executeCommand(message, channelRep);
  }

  private hasValidAttachment(message: ChannelMessage): boolean {
    return !!message.attachments[0] && !!message.attachments[0].filetype;
  }

  private isValidFileFormat(attachmentType: string): boolean {
    return validAttachmentTypes.includes(attachmentType);
  }

  private async executeCommand(
    message: ChannelMessage,
    channelRep: Promise<TextChannel>,
  ) {
    try {
      const result = this.asterisk.execute(message.content.t, message);
      this.logger.log(`Command result: ${JSON.stringify(result)}`);

      if (result && result.msg) {
        try {
          await this.sendReply(channelRep, result.msg, message);
          this.logger.log('Reply message sent successfully');
        } catch (sendError) {
          this.logger.error('Error sending reply:', sendError);
          await this.sendReply(
            channelRep,
            {
              t: 'Có lỗi xảy ra khi gửi tin nhắn.',
            },
            message,
          );
        }
      }
    } catch (error) {
      this.logger.error('Error executing command:', error);
      this.channel_test.send({
        t: 'Đã xảy ra lỗi khi thực hiện lệnh. Vui lòng thử lại.',
      });
    }
  }

  private hasAttachmentWithoutCommand(message: ChannelMessage): boolean {
    return (
      message.attachments?.length > 0 && !message.content?.t?.startsWith('*')
    );
  }

  private async handleAttachmentWithoutCommand(
    message: ChannelMessage,
    channelRep: Promise<TextChannel>,
    messageDemand: string,
  ) {
    this.logger.log('File attached without command - suggesting guicv');
    await this.sendReply(channelRep, { t: messageDemand }, message);
  }

  private hasCommandWithoutAttachment(message: ChannelMessage): boolean {
    return message.content?.t === '*guicv' && message.attachments?.length === 0;
  }

  private async handleCommandWithoutAttachment(
    message: ChannelMessage,
    channelRep: Promise<TextChannel>,
    messageDemand: string,
  ) {
    this.logger.log('Command received without attachment');
    await this.sendReply(channelRep, { t: messageDemand }, message);
  }

  private async sendReply(
    channelRep: Promise<TextChannel>,
    content: object,
    message: ChannelMessage,
  ) {
    try {
      const channel = await channelRep;
      const messageObj = await channel.messages.fetch(message.message_id);
      const responseMessage = await messageObj.reply(content);

      // Cache the response message ID for expiration handler
      if (responseMessage && responseMessage.message_id) {
        const cacheKey = `response-message-${message.id}-${message.sender_id}`;
        cache.set(
          cacheKey,
          responseMessage.message_id,
          CACHE_DURATION.FIVE_MINUTES_SECONDS,
        );
        this.logger.log(
          `Cached response message ID: ${responseMessage.message_id} for command ${message.id}`,
        );
      }
    } catch (error) {
      this.logger.error('Error in sendReply:', error);
    }
  }
}
