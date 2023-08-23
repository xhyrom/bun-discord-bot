interface Command {
  name: string;
  run: (
    context
  ) => any;
}

export const COMMANDS: Map<string, Command> = new Map();

export function defineCommand<T extends Command>(command: T) {
  COMMANDS.set(command.name, command);
}
