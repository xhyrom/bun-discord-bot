import { SlashCommandStringOption } from "discord.js";
import { defineCommand } from "../loaders/commands";
import { AutocompleteContext } from "../structs/context/AutocompleteContext";
import { Option } from "../structs/Command";

defineCommand({
  name: "docs",
  options: [
    {
      ...new SlashCommandStringOption()
          .setName("query")
          .setRequired(true)
          .setAutocomplete(true)
          .setDescription("Select query")
          .toJSON(),
      run: (_: Option, context: AutocompleteContext) => {
        return context.interaction.respond([{ name: "heh", value: "heh" }]);
      }
    }
  ]
})
