import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, LogLevel } from '@nestjs/common';

async function bootstrap() {
  const logLevels: LogLevel[] = ['debug', 'error', 'log', 'verbose', 'warn'];
  const app = await NestFactory.create(AppModule, {
    logger: logLevels,
    snapshot: true,
  });

  app.useLogger(
    new Logger('APP', {
      timestamp: true,
    }),
  );

  await app.listen(3000);
}
bootstrap();
