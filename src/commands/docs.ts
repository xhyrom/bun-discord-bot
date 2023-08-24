import { SlashCommandStringOption } from "discord.js";
import { defineCommand } from "../loaders/commands";
import { AutocompleteContext } from "../structs/context/AutocompleteContext";
import { InteractionCommandContext } from "../structs/context/CommandContext";

defineCommand({
  name: "docs",
  description: "Search at docs",
  options: [
    {
      ...new SlashCommandStringOption()
          .setName("query")
          .setRequired(true)
          .setAutocomplete(true)
          .setDescription("Select query")
          .toJSON(),
      run: (context: AutocompleteContext) => {
        return context.respond([{ name: "heh", value: "heh" }]);
      }
    }
  ],
  run: (context: InteractionCommandContext) => {
    context.reply({
      content: "ccc"
    });
  }
})
