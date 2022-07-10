import { readdirSync } from 'fs';
import { basename, dirname, join } from 'path';
import { Logger } from './Logger';

const __dirname = new URL('.', import.meta.url).pathname;

export default async() => {
    const commandsDir = join(__dirname, '..', 'commands');
    for (
        const command of readdirSync(commandsDir)
    ) {
        const name = basename(command, '.ts');
        Logger.info(`Loading ${name} command`);
        await import(join(commandsDir, command));
        Logger.success(`Command ${name} has been loaded`);
    }
}