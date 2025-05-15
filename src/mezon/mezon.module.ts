import { DynamicModule, forwardRef, Global, Module } from '@nestjs/common';
import { MezonModuleAsyncOptions } from './dtos/mezon-module-async-options';
import { MezonClientService } from './services/client.service';
import { ConfigService } from '@nestjs/config';
import { MezonClientConfig } from './dtos/mezon-client-config';
import { Asterisk } from 'src/bot/commands/asterisk/asterisk';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { BotModule } from 'src/bot/bot.module';
// import { Asterisk } from 'src/bot/commands/asterisk/asterisk';

@Global()
@Module({})
export class MezonModule {
  static forRootAsync(options: MezonModuleAsyncOptions): DynamicModule {
    return {
      module: MezonModule,
      imports: [...options.imports, forwardRef(() => BotModule)],
      providers: [
        {
          provide: MezonClientService,
          useFactory: async (
            configService: ConfigService,
            asterisk: Asterisk,
            eventEmitter: EventEmitter2,
          ) => {
            const clientConfig: MezonClientConfig = {
              token: configService.get<string>('MEZON_TOKEN'),
              channel_main_id: configService.get<string>('CHANNEL_MAIN_ID'),
              channel_test_id: configService.get<string>('CHANNEL_TEST_ID'),
              signature: configService.get<string>('SIGNATURE'),
              talent_api_url: configService.get<string>('TALENT_API_URL'),
            };

            const client = new MezonClientService(
              clientConfig,
              asterisk,
              eventEmitter,
            );

            await client.initializeClient();

            return client;
          },
          inject: [ConfigService, Asterisk, EventEmitter2],
        },
      ],
      exports: [MezonClientService],
    };
  }
}
