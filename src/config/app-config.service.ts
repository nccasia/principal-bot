import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { CACHE_DURATION } from 'src/bot/utils/helper';
import { MezonClientConfig } from 'src/mezon/dtos/mezon-client-config';
import { redisStore } from 'cache-manager-ioredis-yet';

@Injectable()
export class AppConfigService {
  constructor(private configService: ConfigService) {}

  get isDevelopment(): boolean {
    return this.nodeEnv === 'development';
  }

  get isProduction(): boolean {
    return this.nodeEnv === 'production';
  }

  get isTest(): boolean {
    return this.nodeEnv === 'test';
  }

  get nodeEnv(): string {
    return this.getString('NODE_ENV') || 'development';
  }

  get databaseConfig(): TypeOrmModuleOptions {
    return {
      type: 'postgres',
      host: this.getString('DATABASE_HOST'),
      port: this.getNumber('DATABASE_PORT'),
      username: this.getString('DATABASE_USER'),
      password: this.getString('DATABASE_PASSWORD'),
      database: this.getString('DATABASE_NAME'),
      autoLoadEntities: true,
      synchronize: false,
    };
  }

  get mezonConfig(): MezonClientConfig {
    return {
      token: this.getString('MEZON_TOKEN'),
      channel_main_id: this.getString('CHANNEL_MAIN_ID'),
      channel_test_id: this.getString('CHANNEL_TEST_ID'),
      signature: this.getString('SIGNATURE'),
      talent_api_url_get: this.getString('TALENT_API_URL_GET'),
      talent_api_url_post: this.getString('TALENT_API_URL_POST'),
      bot_id: this.getString('BOT_ID'),
      bot_username: this.getString('BOT_USERNAME'),
    };
  }

  get redisConfig() {
    return {
      store: redisStore,
      host: this.getString('REDIS_HOST'),
      port: this.getNumber('REDIS_PORT'),
      password: this.getString('REDIS_PASSWORD'),
      db: this.getNumber('REDIS_DB'),
      ttl: CACHE_DURATION.FIVE_MINUTES_MS,
    };
  }

  private getString(key: string): string {
    const value = this.get(key);
    return value.replaceAll('\\n', '\n');
  }

  private getNumber(key: string): number {
    const value = this.get(key);
    try {
      return Number(value);
    } catch {
      throw new Error(`${key} environment variable is not a number`);
    }
  }

  private getBoolean(key: string): boolean {
    const value = this.get(key);
    try {
      return Boolean(JSON.parse(value));
    } catch {
      throw new Error(`${key} environment variable is not a boolean`);
    }
  }

  private get(key: string): string {
    const value = this.configService.get<string>(key);
    if (value === undefined) {
      throw new Error(`${key} environment variable does not exist`);
    }
    return value;
  }
}
