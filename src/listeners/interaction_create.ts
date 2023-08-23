import { Events } from "discord.js";
import { COMMANDS } from "../loaders/commands.ts";
import { defineListener } from "../loaders/listeners.ts";
import { CommandContext } from "../structs/context/CommandContext.ts";
import { BaseInteraction } from "discord.js";
import { ChatInputCommandInteraction } from "discord.js";

defineListener({
  event: Events.InteractionCreate,
  run: (interaction: BaseInteraction) => {
    if (interaction.isChatInputCommand()) return handleCommand(interaction);

    return;
  }
})

function handleCommand(interaction: ChatInputCommandInteraction) {
  const command = COMMANDS.get(interaction.commandName);

  if (!command) {
    interaction.reply({
      content: "Hmm.. Invalid command :P",
      ephemeral: true,
    })
    return;
  }

  command.run(new CommandContext(command, interaction));
}
