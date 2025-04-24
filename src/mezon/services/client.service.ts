import { Injectable, Logger } from '@nestjs/common';
import { MezonClientConfig } from '../dtos/mezon-client-config';
import { ChannelMessage, MezonClient } from 'mezon-sdk';
// import { Asterisk } from 'src/bot/commands/asterisk/asterisk';

// TODO: Implement the MezonClientService to handle client operations
@Injectable()
export class MezonClientService {
  private readonly logger = new Logger(MezonClientService.name);
  private client: MezonClient;

  constructor(
    clientConfig: MezonClientConfig,
    // private readonly asterisk: Asterisk,
  ) {
    this.client = new MezonClient(clientConfig.token);
  }

  // private handleChannelMessage(message: ChannelMessage) {
  //   try {
  //     if (message.content?.t && message.content.t.startsWith('*')) {
  //       const result = this.asterisk.execute(message.content.t, message);
  //       return result;
  //     }
  //   } catch (error) {
  //     this.logger.error('Lỗi khi xử lý tin nhắn!', error);
  //   }
  // }

  async initializeClient() {
    try {
      await this.client.login();
      this.logger.log('Login successful');

      this.client.once('ready', () => {
        this.logger.log('Mezon client is ready!');
      });

      const channel = await this.client.channels.fetch('1840681402413092864');

      this.client.onChannelMessage((message: ChannelMessage) => {
        this.logger.log(
          `Received message from ${message.username}: ${message.content?.t}`,
        );
        console.log('Message received:', message);
        // this.handleChannelMessage(message);
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
