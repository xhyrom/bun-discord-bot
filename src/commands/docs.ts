import { SlashCommandStringOption } from "discord.js";
import { defineCommand } from "../loaders/commands";
import { AutocompleteContext } from "../structs/context/AutocompleteContext";
import { InteractionCommandContext } from "../structs/context/CommandContext";
import algoliasearch from "algoliasearch";

const algoliaClient = algoliasearch("2527C13E0N", "4efc87205e1fce4a1f267cadcab42cb2");

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
  run: async(context: InteractionCommandContext) => {
    await context.interaction.deferReply();
    console.log(await algoliaClient.search([
      {
        query: "qwe",
        indexName: "bun"
      }
    ]));

    await context.interaction.editReply({
      content: "asdsad"
    })
  }
})
