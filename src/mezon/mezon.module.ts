import { DynamicModule, Global, Module } from '@nestjs/common';
import { MezonModuleAsyncOptions } from './dtos/mezon-module-async-options';
import { MezonClientService } from './services/client.service';
import { ConfigService } from '@nestjs/config';
import { MezonClientConfig } from './dtos/mezon-client-config';

@Global()
@Module({})
export class MezonModule {
  static forRootAsync(options: MezonModuleAsyncOptions): DynamicModule {
    return {
      module: MezonModule,
      imports: options.imports,
      providers: [
        {
          provide: MezonClientService,
          useFactory: (configService: ConfigService) => {
            const clientConfig: MezonClientConfig = {
              token: configService.get<string>('MEZON_TOKEN'),
            };

            const client = new MezonClientService(clientConfig);

            client.initializeClient();

            return client;
          },
          inject: [ConfigService],
        },
      ],
      exports: [MezonClientService],
    };
  }
}
