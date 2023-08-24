import { REST, Routes, SlashCommandBuilder } from "discord.js";
import { Bubu } from "../structs/Client.ts";
import type { Command } from "../structs/Command.ts";

export const COMMANDS: Map<string, Command> = new Map();
export const REST_CLIENT = new REST().setToken(process.env.DISCORD_TOKEN);

export function defineCommand<T extends Command>(command: T) {
  COMMANDS.set(command.name, command);
}

export async function registerCommands() {
  const commands = [...COMMANDS.values()];

  await REST_CLIENT.put(
    Routes.applicationCommands("995690041793839124"),
    {
      body: commands.map(d => ({
        ...new SlashCommandBuilder()
            .setName(d.name)
            .setDescription(d.description)
            .toJSON(),
        options: d.options
      }))
    }
  )
}
