/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, Logger } from '@nestjs/common';
import { MezonClientConfig } from '../dtos/mezon-client-config';
import { ChannelMessage, MezonClient } from 'mezon-sdk';
import { Asterisk } from 'src/bot/commands/asterisk/asterisk';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { generateReplyMessage } from 'src/bot/utils/reply-message-generator';
import { TextChannel } from 'mezon-sdk/dist/cjs/mezon-client/structures/TextChannel';

@Injectable()
export class MezonClientService {
  private readonly logger = new Logger(MezonClientService.name);
  private client: MezonClient;

  constructor(
    clientConfig: MezonClientConfig,
    private readonly asterisk: Asterisk,
    private readonly eventEmitter: EventEmitter2,
  ) {
    this.client = new MezonClient(clientConfig.token);
  }

  async initializeClient() {
    try {
      await this.client.login();
      this.logger.log('Login successful');

      this.client.once('ready', () => {
        this.logger.log('Mezon client is ready!');
      });

      //Channel chính
      const channel = await this.client.channels.fetch('1840681402413092864');
      //Channel test
      const channel_test = await this.client.channels.fetch(
        '1840673714937532416',
      );

      // Khi người dùng mới vào kênh
      this.client.onUserChannelAdded((event) => {
        const user = event.users[0];
        const channelName = event.channel_desc.clan_name;
        channel_test.send({
          t: `Xin chào ${user.username}! Chào mừng bạn đến với kênh ${channelName}. Hãy sử dụng lệnh *guicv và đính kèm 01 file (.docx hoặc .pdf) để gửi CV của bạn.`,
        });
      });

      this.client.onChannelMessage(async (message: ChannelMessage) => {
        this.logger.log(
          `Received message from ${message.username}: ${message.content?.t}`,
        );
        console.log('Message received:', message);

        const messageDemand =
          'Vui lòng đính kèm DUY NHẤT 01 file CV (.docx hoặc .pdf) để gửi CV của bạn.';
        const reply = (content: string) => {
          generateReplyMessage(
            {
              t: content,
            },
            message,
            true,
          );
        };
        const getMessAndReply = async (
          channelRep: Promise<TextChannel>,
          content: string,
        ) => {
          const messageObj = (await channelRep).messages.fetch(
            message.message_id!,
          );
          await (
            await messageObj
          ).reply({
            t: content,
          });
        };

        //Tin nhắn phản hồi hiện tại
        const channelRep = this.client.channels.fetch(message.channel_id);

        try {
          // Trường hợp 1: gửi quá nhiều file đính kèm
          if (
            message.attachments?.length > 1 &&
            message.content.t?.startsWith('*')
          ) {
            console.log('This is REPLY: ', reply);
            getMessAndReply(channelRep, messageDemand);
          }

          // Trường hợp 2: Người dùng nhập *guicv VÀ đính kèm file
          else if (
            message.content?.t?.startsWith('*') &&
            message.attachments?.length > 0
          ) {
            this.logger.log('Processing guicv command with attachment');
            const attachmentType = message.attachments[0].filetype;
            if (attachmentType !== 'docx' && attachmentType !== 'pdf') {
              getMessAndReply(channelRep, messageDemand);
              return;
            }

            try {
              const result = this.asterisk.execute(message.content.t, message);
              this.logger.log(`Command result: ${JSON.stringify(result)}`);

              //Gửi form CV
              if (result && result.msg) {
                try {
                  const channel = await channelRep;
                  await channel.send(result.msg);
                  this.logger.log('Reply message sent successfully');
                } catch (sendError) {
                  this.logger.error('Error sending reply:', sendError);
                  getMessAndReply(
                    channelRep,
                    'Có lỗi xảy ra khi gửi tin nhắn.',
                  );
                }
              }
            } catch (error) {
              this.logger.error('Error executing command:', error);
              channel_test.send({
                t: 'Đã xảy ra lỗi khi thực hiện lệnh. Vui lòng thử lại.',
              });
            }
          }

          // Trường hợp 3: Người dùng chỉ đính kèm file mà không gõ lệnh
          else if (
            message.attachments?.length > 0 &&
            !message.content?.t?.startsWith('*')
          ) {
            this.logger.log('File attached without command - suggesting guicv');
            getMessAndReply(channelRep, messageDemand);
          } else if (
            message.content.t === '*guicv' &&
            message.attachments.length === 0
          ) {
            this.logger.log('Command received without attachment');
            getMessAndReply(channelRep, messageDemand);
          }
        } catch (error) {
          this.logger.error('Error processing message:', error);
          getMessAndReply(channelRep, 'Dã xảy ra lỗi khi xử lý tin nhắn.');
        }
      });

      if (channel) {
        this.logger.log(`Channel found: ${channel.name}`);
      } else {
        this.logger.warn('Channel not found');
      }
      this.logger.log('Event listeners registered successfully');

      return true;
    } catch (error) {
      this.logger.error('Error initializing Mezon client', error);
      throw error;
    }
  }
}
