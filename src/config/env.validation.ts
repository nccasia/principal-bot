import { plainToInstance } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  validateSync,
} from 'class-validator';

export class EnvironmentVariables {
  @IsString({ message: 'DATABASE_HOST must be a string' })
  @IsNotEmpty({ message: 'DATABASE_HOST is missing' })
  DATABASE_HOST: string;

  @IsNumber({}, { message: 'DATABASE_PORT must be a number' })
  @IsNotEmpty({ message: 'DATABASE_PORT is missing' })
  DATABASE_PORT: number;

  @IsString({ message: 'DATABASE_USER must be a string' })
  @IsNotEmpty({ message: 'DATABASE_USER is missing' })
  DATABASE_USER: string;

  @IsString({ message: 'DATABASE_PASSWORD must be a string' })
  @IsNotEmpty({ message: 'DATABASE_PASSWORD is missing' })
  DATABASE_PASSWORD: string;

  @IsString({ message: 'DATABASE_NAME must be a string' })
  @IsNotEmpty({ message: 'DATABASE_NAME is missing' })
  DATABASE_NAME: string;

  @IsString({ message: 'MEZON_TOKEN must be a string' })
  @IsNotEmpty({ message: 'MEZON_TOKEN is missing' })
  MEZON_TOKEN: string;

  @IsString({ message: 'CHANNEL_MAIN_ID must be a string' })
  @IsNotEmpty({ message: 'CHANNEL_MAIN_ID is missing' })
  CHANNEL_MAIN_ID: string;

  @IsString({ message: 'CHANNEL_TEST_ID must be a string' })
  @IsNotEmpty({ message: 'CHANNEL_TEST_ID is missing' })
  CHANNEL_TEST_ID: string;

  @IsString({ message: 'SIGNATURE must be a string' })
  @IsNotEmpty({ message: 'SIGNATURE is missing' })
  SIGNATURE: string;

  @IsString({ message: 'TALENT_API_URL_GET must be a string' })
  @IsNotEmpty({ message: 'TALENT_API_URL_GET is missing' })
  TALENT_API_URL_GET: string;

  @IsString({ message: 'TALENT_API_URL_POST must be a string' })
  @IsNotEmpty({ message: 'TALENT_API_URL_POST is missing' })
  TALENT_API_URL_POST: string;

  @IsString({ message: 'BOT_ID must be a string' })
  @IsNotEmpty({ message: 'BOT_ID is missing' })
  BOT_ID: string;

  @IsString({ message: 'BOT_USERNAME must be a string' })
  @IsNotEmpty({ message: 'BOT_USERNAME is missing' })
  BOT_USERNAME: string;

  @IsString({ message: 'REDIS_HOST must be a string' })
  @IsNotEmpty({ message: 'REDIS_HOST is missing' })
  REDIS_HOST: string;

  @IsNumber({}, { message: 'REDIS_PORT must be a number' })
  @IsNotEmpty({ message: 'REDIS_PORT is missing' })
  REDIS_PORT: number;

  @IsOptional({ message: 'REDIS_PASSWORD is optional' })
  REDIS_PASSWORD: string;

  @IsNumber({}, { message: 'REDIS_DB must be a number' })
  @IsNotEmpty({ message: 'REDIS_DB is missing' })
  REDIS_DB: number;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }

  return validatedConfig;
}
