import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DiscoveryModule } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { MulterModule } from '@nestjs/platform-express';
import { MezonModule } from 'src/mezon/mezon.module';
import { Asterisk } from './commands/asterisk/asterisk';
import { ApplyCVCommand } from './commands/asterisk/apply-cv/apply-cv.command';
import { MessageButtonClickListener } from './listeners/message-button-click.listener';

@Module({
  imports: [
    MulterModule.register({
      dest: './files',
    }),
    DiscoveryModule,
    ConfigModule,
    MezonModule.forRootAsync({
      imports: [ConfigModule],
    }),
    EventEmitterModule.forRoot(),
  ],
  providers: [Asterisk, ApplyCVCommand, MessageButtonClickListener],
  exports: [Asterisk],
})
export class BotModule {}
