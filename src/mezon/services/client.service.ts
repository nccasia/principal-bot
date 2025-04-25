/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, Logger } from '@nestjs/common';
import { MezonClientConfig } from '../dtos/mezon-client-config';
import { ChannelMessage, MezonClient } from 'mezon-sdk';
import { Asterisk } from 'src/bot/commands/asterisk/asterisk';
import { EventEmitter2 } from '@nestjs/event-emitter';

// TODO: Implement the MezonClientService to handle client operations
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

      const channel = await this.client.channels.fetch('1840681402413092864');
      const channel_test = await this.client.channels.fetch(
        '1840673714937532416',
      );

      // Khi người dùng mới vào kênh
      this.client.onUserChannelAdded((event) => {
        const user = event.users[0];
        const channelName = event.channel_desc.clan_name;
        channel_test.send({
          t: `Xin chào ${user.username}! Chào mừng bạn đến với kênh ${channelName}. Hãy sử dụng lệnh *apply-cv và đính kèm 01 file (.docx hoặc .pdf) để gửi CV của bạn.`,
        });
      });
      this.client.onChannelMessage((message: ChannelMessage) => {
        this.logger.log(
          `Received message from ${message.username}: ${message.content?.t}`,
        );
        console.log('Message received:', message);

        try {
          // Trường hợp 1: Người dùng nhập *apply-cv VÀ đính kèm file
          if (
            message.content?.t?.startsWith('*apply-cv') &&
            message.attachments?.length > 0
          ) {
            this.logger.log('Processing apply-cv command with attachment');
            try {
              const result = this.asterisk.execute(message.content.t, message);
              this.logger.log(`Command result: ${JSON.stringify(result)}`);

              if (result && result.msg) {
                try {
                  channel_test.send(result.msg);
                  this.logger.log('Reply message sent successfully');
                } catch (sendError) {
                  this.logger.error('Error sending reply:', sendError);
                  channel_test.send({
                    t: 'Đã xảy ra lỗi khi gửi form. Vui lòng thử lại.',
                  });
                }
              }
            } catch (error) {
              this.logger.error('Error executing command:', error);
              channel_test.send({
                t: 'Đã xảy ra lỗi khi thực hiện lệnh. Vui lòng thử lại.',
              });
            }
          }

          // Trường hợp 2: Người dùng chỉ đính kèm file mà không gõ lệnh
          else if (
            message.attachments?.length > 0 &&
            !message.content?.t?.startsWith('*')
          ) {
            this.logger.log(
              'File attached without command - suggesting apply-cv',
            );
            channel_test.send({
              t: `Vui lòng sử dụng lệnh *apply-cv và đính kèm 1 file CV (.docx hoặc .pdf) để gửi CV của bạn.`,
            });
          }
        } catch (error) {
          this.logger.error('Error processing message:', error);
          channel_test.send({
            t: 'Đã xảy ra lỗi khi xử lý lệnh. Vui lòng thử lại.',
          });
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
