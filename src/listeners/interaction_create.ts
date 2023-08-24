import { Events, Interaction, ChatInputCommandInteraction } from "discord.js";
import { COMMANDS } from "../loaders/commands.ts";
import { defineListener } from "../loaders/listeners.ts";
import { InteractionCommandContext } from "../structs/context/CommandContext.ts";

defineListener({
  event: Events.InteractionCreate,
  run: (interaction: Interaction) => {
    if (interaction.isChatInputCommand()) return handleCommand(interaction);

    return;
  }
})

function handleCommand(interaction: ChatInputCommandInteraction) {
  const command = COMMANDS.get(interaction.commandName);

  if (!command || !command.run) {
    interaction.reply({
      content: "Hmm.. Invalid command :P",
      ephemeral: true,
    })
    return;
  }

  command.run(new InteractionCommandContext(command, interaction));
}
