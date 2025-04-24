import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DiscoveryModule } from '@nestjs/core';
import { MulterModule } from '@nestjs/platform-express';
import { MezonModule } from 'src/mezon/mezon.module';

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
  ],
  providers: [],
  controllers: [],
})
export class BotModule {}
