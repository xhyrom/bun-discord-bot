import type { Command } from "../structs/Command.ts";

export const COMMANDS: Map<string, Command> = new Map();

export function defineCommand<T extends Command>(command: T) {
  COMMANDS.set(command.name, command);
}
