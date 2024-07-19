import { AllowedMentionType, ApplicationCommandOptionType } from "lilybird";
import { $applicationCommand } from "@lilybird/handlers/advanced";
import algoliasearch from "algoliasearch";
import { safeSlice } from "src/util.ts";

// @ts-expect-error It is callable, but algolia for some reason has a namespace with the same name
const algoliaClient = algoliasearch(
  "2527C13E0N",
  "4efc87205e1fce4a1f267cadcab42cb2",
);
const algoliaIndex = algoliaClient.initIndex("bun");

$applicationCommand({
  name: "docs",
  description: "Search at docs",
  options: [
    {
      type: ApplicationCommandOptionType.STRING,
      name: "query",
      description: "Select query",
      required: true,
      autocomplete: true,
    },
    {
      type: ApplicationCommandOptionType.USER,
      name: "target",
      description: "User to mention",
    },
  ],
  autocomplete: async (interaction) => {
    const query = interaction.data.getFocused<string>().value;
    const result = await algoliaIndex.search(query, {
      hitsPerPage: 25,
    });

    return interaction.showChoices(
      result.hits.map((hit: any) => {
        const name = getHitName(hit);

        return {
          name: safeSlice(name.full, 100),
          value: safeSlice(name.name, 100),
        };
      }),
    );
  },
  handle: async (interaction) => {
    await interaction.deferReply();

    const query = interaction.data.getString("query");
    const target = interaction.data.getUser("target");

    const result = await algoliaIndex.search(query, {
      hitsPerPage: 1,
    });

    const hit = result.hits[0];
    const url = hit.url;
    const name = getHitName(hit);
    const snippetContent = hit._snippetResult?.content?.value?.replace(
      /<[^>]+>/g,
      "",
    );
    const notice = hit.content?.replace(/\r/g, "");

    const content = [
      target ? `*Suggestion for <@${target}>:*\n` : "",
      `[*${name.full}*](<${url}>)`,
      snippetContent ? snippetContent : "",
      notice
        ? notice
            .split("\n")
            .map((s: any) => `> ${s}`)
            .join("\n")
        : "",
    ].join("\n");

    await interaction.editReply({
      content,
      allowed_mentions: {
        parse: target ? [AllowedMentionType.UserMentions] : [],
      },
    });
  },
});

function getHitName(hit: any) {
  const type = hit.hierarchy.lvl0 === "Documentation" ? "📖" : "🗺️";
  const hierarchy = Object.values(hit.hierarchy).filter((v) => v);
  hierarchy.shift();

  const name = hierarchy.join(" > ");

  return {
    full: `${type} ${name}`,
    name: name,
    emoji: type,
  };
}
