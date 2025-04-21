import { Module } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';
import { MulterModule } from '@nestjs/platform-express';
import { AppController } from './controller/app/app.controller';
import { AppService } from './services/app.service';

@Module({
  imports: [
    MulterModule.register({
      dest: './files',
    }),
    DiscoveryModule,
  ],
  providers: [AppService],
  controllers: [AppController],
})
export class RestModule {}
