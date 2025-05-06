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
import { TextChannel } from 'mezon-sdk/dist/cjs/mezon-client/structures/TextChannel';
import { Event } from 'mezon-sdk/dist/cjs/api/api';

@Injectable()
export class MezonClientService {
  private readonly logger = new Logger(MezonClientService.name);
  private client: MezonClient;
  private readonly config: MezonClientConfig;
  // Thêm bộ nhớ đệm để theo dõi các sự kiện button đã xử lý
  private processedButtonEvents = new Map<string, number>();

  constructor(
    clientConfig: MezonClientConfig,
    private readonly asterisk: Asterisk,
    private readonly eventEmitter: EventEmitter2,
  ) {
    this.client = new MezonClient(clientConfig.token);
    this.config = clientConfig;
  }

  getClient() {
    return this.client;
  }

  async initializeClient() {
    try {
      await this.client.login();
      this.logger.log('Login successful');

      // Xử lý sự kiện khi có button được click
      this.client.on('message_button_clicked', (data) => {
        // Tạo ID duy nhất cho sự kiện này
        const eventId = `${data.message_id}_${data.button_id}_${data.user_id}`;
        const now = Date.now();

        // Kiểm tra xem sự kiện này đã được xử lý gần đây chưa
        if (this.processedButtonEvents.has(eventId)) {
          const lastProcessed = this.processedButtonEvents.get(eventId);
          // Nếu sự kiện đã được xử lý trong vòng 2 giây trước đó
          if (now - lastProcessed < 2000) {
            this.logger.log(`Bỏ qua sự kiện button trùng lặp: ${eventId}`);
            return; // Bỏ qua xử lý
          }
        }

        // Ghi nhận sự kiện này đã được xử lý
        this.processedButtonEvents.set(eventId, now);

        // Dọn dẹp bộ nhớ đệm theo định kỳ
        if (this.processedButtonEvents.size > 100) {
          const fiveMinutesAgo = now - 300000;
          for (const [key, timestamp] of this.processedButtonEvents.entries()) {
            if (timestamp < fiveMinutesAgo) {
              this.processedButtonEvents.delete(key);
            }
          }
        }

        this.logger.log('Button clicked:', data);
        this.eventEmitter.emit('message_button_clicked', data);
      });

      this.client.once('ready', () => {
        this.logger.log('Mezon client is ready!');
      });

      //Channel chính
      const channel = await this.client.channels.fetch(
        this.config.channel_main_id,
      );
      //Channel test
      const channel_test = await this.client.channels.fetch(
        this.config.channel_test_id,
      );

      // //Channel chính
      // // const channel = await this.client.channels.fetch('1840681402413092864');
      // //Channel test
      // const channel_test = await this.client.channels.fetch(
      //   '1840673714937532416',
      // );

      // Khi người dùng mới vào kênh
      this.client.onUserChannelAdded((event) => {
        const user = event.users[0];
        const channelName = event.channel_desc.clan_name;
        channel_test.send({
          t: `Xin chào ${user.username}! Chào mừng bạn đến với kênh ${channelName}. Hãy sử dụng lệnh *guicv và đính kèm 01 file (.docx hoặc .pdf) để gửi CV của bạn.`,
        });
      });

      this.client.onChannelMessage(async (message: ChannelMessage) => {
        // Channel được phép nhận tin nhắn
        const allowedChannel = [
          // this.config.channel_main_id,
          this.config.channel_test_id,
        ];

        if (!allowedChannel.includes(message.channel_id)) {
          this.logger.log(
            `Received message from ${message.username} in an unauthorized channel: ${message.channel_id}`,
          );
          return;
        }

        this.logger.log(
          `Received message from ${message.username}: ${message.content?.t}`,
        );
        console.log('Message received:', message);

        const messageDemand =
          'Vui lòng gửi lệnh *guicv và đính kèm DUY NHẤT 01 file CV (.docx hoặc .pdf) để gửi CV của bạn.';
        const getMessAndReply = async (
          channelRep: Promise<TextChannel>,
          content: string,
        ) => {
          try {
            const channel = await channelRep;
            const messageObj = await channel.messages.fetch(
              message.message_id!,
            );
            await messageObj.reply({
              t: content,
            });
          } catch (error) {
            this.logger.error('Error in getMessAndReply:', error);
          }
        };

        //Tin nhắn phản hồi hiện tại
        const channelRep = this.client.channels.fetch(message.channel_id);

        try {
          // Trường hợp 1: gửi quá nhiều file đính kèm
          if (
            message.attachments?.length > 1 &&
            message.content?.t?.startsWith('*')
          ) {
            this.logger.log('Receiving multiple attachments - rejecting');
            getMessAndReply(channelRep, messageDemand);
          }

          // Trường hợp 2: Người dùng nhập *guicv VÀ đính kèm file
          else if (
            message.content?.t?.startsWith('*') &&
            message.attachments?.length > 0
          ) {
            this.logger.log('Processing guicv command with attachment');

            // Kiểm tra tồn tại của file và metadata
            if (!message.attachments[0] || !message.attachments[0].filetype) {
              this.logger.warn('Missing attachment metadata');
              await getMessAndReply(
                channelRep,
                'Không thể xác định loại file. Vui lòng thử lại.',
              );
              return;
            }

            const attachmentType = message.attachments[0].filetype;
            this.logger.log(`Attachment type: ${attachmentType}`);

            const isDocx =
              attachmentType === 'docx' ||
              attachmentType ===
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

            const isPdf =
              attachmentType === 'pdf' || attachmentType === 'application/pdf';

            // Kiểm tra nếu là một trong hai định dạng hợp lệ
            if (!isDocx && !isPdf) {
              this.logger.warn(`Invalid file type: ${attachmentType}`);
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
          }
          // Trường hợp 4: Người dùng gõ lệnh nhưng không đính kèm file
          else if (
            message.content?.t === '*guicv' &&
            message.attachments?.length === 0
          ) {
            this.logger.log('Command received without attachment');
            getMessAndReply(channelRep, messageDemand);
          }
        } catch (error) {
          this.logger.error('Error processing message:', error);
          getMessAndReply(channelRep, 'Đã xảy ra lỗi khi xử lý tin nhắn.');
        }
      });

      if (channel_test) {
        this.logger.log(`Channel found: ${channel_test.name}`);
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
