import { Injectable, Logger } from '@nestjs/common';
import { ExternalCvPayloadDto } from '../dtos/external-cv-payload.dto';
import { HttpService } from '@nestjs/axios';
import crypto from 'crypto';
import FormData from 'form-data';
import { map } from 'rxjs/operators';
import { lastValueFrom } from 'rxjs';
import { MezonClientConfig } from 'src/mezon/dtos/mezon-client-config';
import { AppConfigService } from 'src/config/app-config.service';

@Injectable()
export class TalentApiService {
  private readonly logger = new Logger(TalentApiService.name);
  private readonly config: MezonClientConfig;
  private readonly signature: string;
  private readonly talentApiUrl: {
    get: string;
    post: string;
  };
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: AppConfigService,
  ) {
    this.config = this.configService.mezonConfig;
    this.signature = this.config.signature;
    this.talentApiUrl = {
      get: this.config.talent_api_url_get,
      post: this.config.talent_api_url_post,
    };
  }

  private computeHash(input: string) {
    const hash = crypto.createHash('sha256');
    hash.update(input, 'utf8');
    return hash.digest('base64');
  }

  private computeHashForFormData(
    candidateData: ExternalCvPayloadDto,
    signature: string,
  ) {
    const formValues = [];
    const sortedKeys = Object.keys(candidateData).sort();

    for (const key of sortedKeys) {
      const value = candidateData[key];

      if (value === undefined) {
        continue;
      }

      let processedValue;
      if (value === null) {
        processedValue = '';
      } else if (typeof value === 'boolean' || typeof value === 'number') {
        processedValue = String(value);
      } else {
        processedValue = value;
      }
      formValues.push(`${key}=${processedValue}`);
    }

    const formString = formValues.join('&');

    const input = formString + signature;

    return this.computeHash(input);
  }

  private computeHashForGet(params = {}, signature: string) {
    const parts = [];

    const sortedKeys = Object.keys(params).sort();

    for (const key of sortedKeys) {
      const value = params[key];
      if (Array.isArray(value)) {
        value.sort().forEach((v) => parts.push(`${key}=${v}`));
      } else {
        parts.push(`${key}=${value}`);
      }
    }

    const queryString = parts.join('&');

    const input = queryString ? queryString + signature : signature;

    console.log('String being hashed:', input);
    return this.computeHash(input);
  }

  async submitCandidateCV(candidateData: ExternalCvPayloadDto) {
    try {
      const formData = new FormData();

      Object.entries(candidateData).forEach(([key, value]) => {
        if (value === undefined) {
          return;
        }

        let valueToAppend;
        if (value === null) {
          valueToAppend = '';
        } else if (typeof value === 'boolean' || typeof value === 'number') {
          valueToAppend = String(value);
        } else {
          valueToAppend = value;
        }
        formData.append(key, valueToAppend);
      });

      const hash = this.computeHashForFormData(candidateData, this.signature);

      console.log('Generated hash:', hash);

      const headers = {
        ...formData.getHeaders(),
        'X-Hash': hash,
      };

      const response = this.httpService.post(this.talentApiUrl.post, formData, {
        headers,
      });

      const data = await lastValueFrom(response.pipe(map((resp) => resp.data)));
      console.log('Success! CV submitted with data:', data);
      return data;
    } catch (error) {
      console.error('Error submitting CV:', error);
      throw error;
    }
  }

  async getFormData(params = {}) {
    try {
      const hash = this.computeHashForGet(params, this.signature);
      console.log('Generated hash:', hash);

      const headers = {
        'X-Hash': hash,
      };

      console.log('Sending request to:', this.talentApiUrl);

      const response = this.httpService.get(this.talentApiUrl.get, {
        params: params,
        headers: headers,
      });

      const data = await lastValueFrom(response.pipe(map((resp) => resp.data)));
      console.log('Request successful!');
      return data;
    } catch (error) {
      console.error('Error fetching form data:', error);
      throw error;
    }
  }
}
