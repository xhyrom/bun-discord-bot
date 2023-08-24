import { SlashCommandStringOption, SlashCommandUserOption } from "discord.js";
import { defineCommand } from "../loaders/commands";
import { AutocompleteContext } from "../structs/context/AutocompleteContext";
import { InteractionCommandContext } from "../structs/context/CommandContext";
import algoliasearch from "algoliasearch";

const algoliaClient = algoliasearch("2527C13E0N", "4efc87205e1fce4a1f267cadcab42cb2");
const algoliaIndex = algoliaClient.initIndex("bun");

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
      run: async(context: AutocompleteContext) => {
        const query = context.options.getString("query");
        const result = await algoliaIndex.search(query, {
          hitsPerPage: 25,
        });

        return context.respond(
          result.hits.map(hit => {
            const name = getHitName(hit);

            return {
              name: name.full.length > 100 ? name.full.slice(0, 100) : name.full,
              value: name.name.length > 100 ? name.name.slice(0, 100) : name.name,
            }
          })
        );
      },
    },
    {
      ...new SlashCommandUserOption()
          .setName("target")
          .setRequired(false)
          .setDescription("User to mention")
          .toJSON()
    }
  ],
  run: async(context: InteractionCommandContext) => {
    await context.interaction.deferReply();
    
    const query = context.interaction.options.getString("query");
    const target = context.interaction.options.getUser("target");

    const result = await algoliaIndex.search(query, {
      hitsPerPage: 1,
    });

    const hit = result.hits[0];
    // @ts-expect-error exist
    const url = hit.url;
    const name = getHitName(hit);
    // @ts-expect-error can exist
    const snippetContent = hit._snippetResult?.content?.value?.replace(/<[^>]+>/g, "");
    // @ts-expect-error can exist
    const notice = hit.content?.replace(/\r/g, "");

    const content = [
      target ? `*Suggestion for <@${target.id}>:*\n` : "",
      `[*${name.full}*](<${url}>)`,
      snippetContent ? snippetContent : "",
      notice ? notice.split("\n").map(s => `> ${s}`).join("\n") : ""
    ].join("\n")

    await context.interaction.editReply({
      content,
      allowedMentions: {
        parse: [ "users" ],
        repliedUser: true,
      }
    });
  }
})

function getHitName(hit) {
  const type = hit.hierarchy.lvl0 === "Documentation" ? "📖" : "🗺️";
  const hierarchy = Object.values(hit.hierarchy).filter(v => v);
  hierarchy.shift();

  const name = hierarchy.join(" > ");

  return {
    full: `${type} ${name}`,
    name: name,
    emoji: type,
  }
}
