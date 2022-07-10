import Collection from '@discordjs/collection';
import { Command } from '../structures/Command';

class CommandManager extends Collection<String, Command> {
    constructor() {
        super();
    }

    public register(command: Command): CommandManager {
        this.set(command.name, command);
        return this;
    }

    public unregister(command: Command): CommandManager {
        this.delete(command.name);
        return this;
    }
}

export const Commands = new CommandManager();