import { ChannelMessage } from 'mezon-sdk';
import { Injectable } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { IAsteriskInterface } from 'src/bot/abstractions/commands/asterisk.interface';
import { extractMessage } from 'src/bot/utils/helper';
import { CommandMessage } from 'src/bot/abstractions/commands/asterisk.abstract';
import { CommandStorage } from 'src/bot/storages/command-storage';

@Injectable()
export class Asterisk implements IAsteriskInterface {
  public commandList: { [key: string]: CommandMessage };

  constructor(private readonly moduleRef: ModuleRef) {}

  execute(messageContent: string, message: ChannelMessage): any {
    const [commandName, args] = extractMessage(messageContent);

    const target = CommandStorage.getCommand(commandName as string);
    if (target) {
      const command = this.moduleRef.get<CommandMessage>(target);

      if (command) {
        return command.execute(args, message);
      }
    }
  }
}
