import { DynamicModule, Global, Module } from '@nestjs/common';
import { MezonModuleAsyncOptions } from './dtos/mezon-module-async-options';
import { MezonClientService } from './services/client.service';
import { Asterisk } from 'src/bot/commands/asterisk/asterisk';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AppConfigService } from 'src/config/app-config.service';
import { ConfigModule } from 'src/config/config.module';
import { CachingService } from 'src/common/services/caching.service';
import { BotModule } from 'src/bot/bot.module';

let clientServiceInstance: MezonClientService = null;
let isModuleInitialized = false;

@Global()
@Module({})
export class MezonModule {
  static forRootAsync(options: MezonModuleAsyncOptions): DynamicModule {
    if (isModuleInitialized) {
      console.log(
        'MezonModule already initialized, returning singleton instance',
      );
      return {
        module: MezonModule,
        providers: [
          {
            provide: MezonClientService,
            useFactory: () => {
              console.log('Returning existing MezonClientService instance');
              return clientServiceInstance;
            },
          },
        ],
        exports: [MezonClientService],
      };
    }

    isModuleInitialized = true;

    return {
      module: MezonModule,
      imports: [...options.imports, BotModule, ConfigModule],
      providers: [
        {
          provide: MezonClientService,
          useFactory: async (
            appConfigService: AppConfigService,
            asterisk: Asterisk,
            eventEmitter: EventEmitter2,
            cachingService: CachingService,
          ) => {
            if (clientServiceInstance) {
              console.log('Reusing existing MezonClientService instance');
              return clientServiceInstance;
            }

            console.log('Creating new MezonClientService instance');
            clientServiceInstance = new MezonClientService(
              appConfigService,
              asterisk,
              eventEmitter,
              cachingService,
            );

            await clientServiceInstance.initializeClient();
            return clientServiceInstance;
          },
          inject: [AppConfigService, Asterisk, EventEmitter2, CachingService],
        },
      ],
      exports: [MezonClientService],
    };
  }
}
