import { AllowedMentionType, ApplicationCommandOptionType } from "lilybird";
import { $applicationCommand } from "../handler.ts";
import { algoliasearch } from "algoliasearch";
import { safeSlice } from "../util.ts";

const algoliaClient = algoliasearch(
  "2527C13E0N",
  "4efc87205e1fce4a1f267cadcab42cb2",
);

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
    const { results } = await algoliaClient.search({
      requests: [
        {
          indexName: "bun",
          query: query,
          hitsPerPage: 25,
        },
      ],
    });

    return interaction.showChoices(
      results[0].hits.map((hit: any) => {
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

    const { results } = await algoliaClient.search({
      requests: [
        {
          indexName: "bun",
          query: query,
          hitsPerPage: 1,
        },
      ],
    });

    const hit = results[0].hits[0];
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
