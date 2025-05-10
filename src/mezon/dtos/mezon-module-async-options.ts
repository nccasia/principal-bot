import { ModuleMetadata } from '@nestjs/common';
import { MezonClient } from 'mezon-sdk';

export type SetUpClientFactory = (client: MezonClient) => Promise<void> | void;

export interface MezonModuleAsyncOptions
  extends Pick<ModuleMetadata, 'imports'> {
  useFactory?: (...args: any[]) => Promise<any>;
  inject?: any[];
}
