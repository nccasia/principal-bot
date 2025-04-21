import { CommandConstructor } from '../abstractions/types/command-storage.type';

export class CommandStorage {
  private static commands: Map<string, CommandConstructor> = new Map();
  private static commandDynamics: Map<string, CommandConstructor> = new Map();

  public static registerCommand(
    commandName: string,
    commandClass: CommandConstructor,
  ): void {
    if (
      this.commands.has(commandName) ||
      this.commandDynamics.has(commandName)
    ) {
      console.warn(
        `CommandStorage: Command name "${commandName}" already registered. Overwriting.`,
      );
    }
    this.commands.set(commandName, commandClass);
  }

  public static getCommand(
    commandName: string,
  ): CommandConstructor | undefined {
    return this.commands.get(commandName);
  }

  /**
   * Returns a shallow copy of the registered commands map.
   */
  public static getAllCommands(): Map<string, CommandConstructor> {
    return new Map(this.commands);
  }

  public static registerCommandDynamic(
    commandName: string,
    commandClass: CommandConstructor,
  ): void {
    if (
      this.commands.has(commandName) ||
      this.commandDynamics.has(commandName)
    ) {
      console.warn(
        `CommandStorage: Command name "${commandName}" already registered. Overwriting.`,
      );
    }
    this.commandDynamics.set(commandName, commandClass);
  }

  public static getCommandDynamic(
    commandName: string,
  ): CommandConstructor | undefined {
    return this.commandDynamics.get(commandName);
  }

  /**
   * Returns a shallow copy of the registered dynamic commands map.
   * (Fixed typo: Dymamic -> Dynamic)
   */
  public static getAllCommandsDynamic(): Map<string, CommandConstructor> {
    return new Map(this.commandDynamics);
  }

  /**
   * Checks if a command name is registered either as standard or dynamic.
   */
  public static hasCommand(commandName: string): boolean {
    return (
      this.commands.has(commandName) || this.commandDynamics.has(commandName)
    );
  }

  /**
   * Unregisters a command (useful for testing or dynamic scenarios).
   */
  public static unregisterCommand(commandName: string): boolean {
    if (this.commands.has(commandName)) {
      return this.commands.delete(commandName);
    }
    if (this.commandDynamics.has(commandName)) {
      return this.commandDynamics.delete(commandName);
    }
    return false; // Not found
  }

  /**
   * Clears all registered commands (useful for testing).
   */
  public static clearAllCommands(): void {
    this.commands.clear();
    this.commandDynamics.clear();
  }
}
