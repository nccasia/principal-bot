import { Injectable, Logger } from '@nestjs/common';
import { MezonClientConfig } from '../dtos/mezon-client-config';
import { MezonClient } from 'mezon-sdk';

@Injectable()
export class MezonClientService {
  private readonly logger = new Logger(MezonClientService.name);
  private client: any;

  constructor(clientConfig: MezonClientConfig) {
    this.client = new MezonClient(clientConfig.token);
  }

  initializeClient() {
    try {
      // const result = await this.client.authenticate(); // Not yet implemented
      return 'Client initialized successfully';
    } catch (error) {
      this.logger.error('Error initializing Mezon client', error);
      throw error;
    }
  }
}
