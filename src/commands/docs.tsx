import {
  ApplicationCommand as JSXApplicationCommand,
  StringOption,
  UserOption,
} from "@lilybird/jsx";
import { ApplicationCommand } from "@lilybird/handlers";
import algoliasearch from "algoliasearch";
import { safeSlice } from "src/util.ts";

// @ts-expect-error It is callable, but algolia for some reason has a namespace with the same name
const algoliaClient = algoliasearch(
  "2527C13E0N",
  "4efc87205e1fce4a1f267cadcab42cb2"
);
const algoliaIndex = algoliaClient.initIndex("bun");

export default {
  post: "GLOBAL",
  data: (
    <JSXApplicationCommand name="docs" description="Search at docs">
      <StringOption
        name="query"
        description="Select query"
        required
        autocomplete
      />
      <UserOption name="target" description="User to mention" />
    </JSXApplicationCommand>
  ),
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
      })
    );
  },
  run: async (interaction) => {
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
      ""
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

    // @ts-expect-error allowed_mentions
    await interaction.editReply({
      content,
      allowed_mentions: {
        parse: target ? ["users"] : [],
      },
    });
  },
} satisfies ApplicationCommand;

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
