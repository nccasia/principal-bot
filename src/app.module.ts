import { Module } from '@nestjs/common';
import { BotModule } from './bot/bot.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from './config/config.module';
import { AppConfigService } from './config/app-config.service';
import { MezonModule } from './mezon/mezon.module';
import { CommonModule } from './common/common.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    CommonModule,
    ConfigModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (appConfigService: AppConfigService) =>
        appConfigService.databaseConfig,
      inject: [AppConfigService],
    }),
    MezonModule.forRootAsync({
      imports: [ConfigModule],
    }),
    BotModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
