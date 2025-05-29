import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cache } from 'cache-manager';

@Injectable()
export class CachingService {
  private readonly logger = new Logger(CachingService.name);
  public readonly instanceId = Math.random().toString(36).substring(2, 9);

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {
    this.logger.log(`CachingService instance ${this.instanceId} created`);
  }

  async get<T>(key: string): Promise<T | undefined> {
    try {
      const value = await this.cacheManager.get<T>(key);
      return value;
    } catch (error) {
      this.logger.error(`Error getting cache for key ${key}:`, error);
    }
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    try {
      await this.cacheManager.set(key, value, ttl);
    } catch (error) {
      this.logger.error(`Error setting cache for key ${key}:`, error);
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.cacheManager.del(key);
    } catch (error) {
      this.logger.error(`Error deleting cache for key ${key}:`, error);
    }
  }

  async has(key: string): Promise<boolean> {
    try {
      const value = await this.get(key);
      return value !== undefined;
    } catch (error) {
      this.logger.error(
        `Error checking existence for cache key ${key}:`,
        error,
      );
      return false;
    }
  }

  async clear(): Promise<void> {
    try {
      await this.cacheManager.clear();
    } catch (error) {
      this.logger.error(`Error clearing cache:`, error);
    }
  }
}
