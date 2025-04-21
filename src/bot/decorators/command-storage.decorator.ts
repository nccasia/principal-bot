import { CommandStorage } from '../storages/command-storage';
import { CommandConstructor } from '../abstractions/types/command-storage.type';

/**
 * Class Decorator to register a standard command with the CommandStorage.
 * @param commandName The unique name for the command.
 */
export function Command(commandName: string) {
  return function (target: CommandConstructor) {
    if (typeof target !== 'function' || !target.prototype) {
      throw new Error(
        `@Command decorator can only be applied to classes. Applied to "${commandName}".`,
      );
    }
    CommandStorage.registerCommand(commandName, target);
  };
}

/**
 * Class Decorator to register a "dynamic" command with the CommandStorage.
 * (Consider if the distinction "dynamic" is clear enough or needed at storage level)
 * @param commandName The unique name for the command.
 */
export function CommandDynamic(commandName: string) {
  return function (target: CommandConstructor) {
    if (typeof target !== 'function' || !target.prototype) {
      throw new Error(
        `@CommandDynamic decorator can only be applied to classes. Applied to "${commandName}".`,
      );
    }
    CommandStorage.registerCommandDynamic(commandName, target);
  };
}
