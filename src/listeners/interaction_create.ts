import { Events, Interaction, ChatInputCommandInteraction, AutocompleteInteraction, APIApplicationCommandSubcommandOption, APIApplicationCommandSubcommandGroupOption } from "discord.js";
import { COMMANDS } from "../loaders/commands.ts";
import { defineListener } from "../loaders/listeners.ts";
import { InteractionCommandContext } from "../structs/context/CommandContext.ts";
import { AutocompleteContext } from "../structs/context/AutocompleteContext.ts";
import { Option, StringOption } from "../structs/Command.ts";

defineListener({
  event: Events.InteractionCreate,
  run: async(interaction: Interaction) => {
    if (interaction.isChatInputCommand()) return await handleCommand(interaction);
    if (interaction.isAutocomplete()) return await handleAutocomplete(interaction);

    return;
  }
})

async function handleCommand(interaction: ChatInputCommandInteraction) {
  const command = COMMANDS.get(interaction.commandName);

  if (!command || !command.run) {
    interaction.reply({
      content: "Hmm.. Invalid command :P",
      ephemeral: true,
    })
    return;
  }

  const context = new InteractionCommandContext(command, interaction);
  await Promise.resolve(command.run(context))
   .catch(async error => {
        context.reply({
          content: `Something went wrong... ${error.message} (${error.code})`
        });
    });
}

async function handleAutocomplete(interaction: AutocompleteInteraction) {
  const command = COMMANDS.get(interaction.commandName);
  if (!command) return;

  let options = command.options;

  if (interaction.options.getSubcommandGroup(false))
    options = (options.find(o => o.name === interaction.options.getSubcommandGroup()) as APIApplicationCommandSubcommandGroupOption)?.options as Option[];
  
  if (interaction.options.getSubcommand(false))
    options = (options.find(o => o.name === interaction.options.getSubcommand()) as APIApplicationCommandSubcommandOption)?.options as Option[];
  

  const focused = interaction.options.getFocused(true);
  const option = options.find(o => o.name === focused.name) as StringOption;
  if (!option) return;


  const context = new AutocompleteContext(option, command, interaction);
  await option.run(context);
}
