import { Module } from '@nestjs/common';
import { BotModule } from './bot/bot.module';
import { RestModule } from './rest/rest.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    BotModule,
    RestModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
