import { Module } from '@nestjs/common';
import { BotModule } from './bot/bot.module';
import { RestModule } from './rest/rest.module';
import { ConfigModule } from '@nestjs/config';
import { MezonModule } from './mezon/mezon.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    BotModule,
    MezonModule,
    RestModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
