import { CacheModule } from '@nestjs/cache-manager';
import { Global, Module } from '@nestjs/common';
import { CachingService } from './services/caching.service';
import { AppConfigService } from 'src/config/app-config.service';
import { ConfigModule } from 'src/config/config.module';

@Global()
@Module({
  imports: [
    CacheModule.registerAsync({
      imports: [ConfigModule],
      isGlobal: true,
      useFactory: (appConfigService: AppConfigService) => {
        return appConfigService.redisConfig;
      },
      inject: [AppConfigService],
    }),
  ],
  providers: [CachingService],
  exports: [CachingService],
})
export class CommonModule {}
