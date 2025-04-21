import { Module } from '@nestjs/common';
import { BotModule } from './bot/bot.module';
import { RestModule } from './rest/rest.module';

@Module({
  imports: [BotModule, RestModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
