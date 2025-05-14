import { Injectable, Logger } from '@nestjs/common';
import { getFormData } from '../../bot-api-client/fetch';
import { submitCandidateCV } from '../../bot-api-client/submit';
import { ExternalCvPayloadDto } from '../dtos/external-cv-payload.dto';

@Injectable()
export class TalentApiService {
  private readonly logger = new Logger(TalentApiService.name);

  constructor() {}

  async getFormData(): Promise<any> {
    try {
      return await getFormData();
      this.logger.log('Successfully get form data from Talent API');
    } catch (error: any) {
      this.logger.error(
        'Failed to get form data from Talent API',
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }
  }

  async submitCandidateCV(candidateData: ExternalCvPayloadDto): Promise<any> {
    try {
      return await submitCandidateCV(candidateData);
      this.logger.log('Successfully submit CV to Talent API');
    } catch (error: any) {
      this.logger.error(
        'Failed to submit CV to Talent API',
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }
  }
}
