import { Injectable, Logger } from '@nestjs/common';
import { MezonClientConfig } from '../dtos/mezon-client-config';
import { MezonClient } from 'mezon-sdk';

// TODO: Implement the MezonClientService to handle client operations
@Injectable()
export class MezonClientService {
  private readonly logger = new Logger(MezonClientService.name);
  private client: any;

  constructor(clientConfig: MezonClientConfig) {
    this.client = new MezonClient(clientConfig.token);
  }

  initializeClient() {
    try {
      // const result = await this.client.authenticate();
      return 'Client initialized successfully';
    } catch (error) {
      this.logger.error('Error initializing Mezon client', error);
      throw error;
    }
  }
}
