// https://github.com/discordjs/discord-utils-bot/blob/main/src/functions/autocomplete/mdnAutoComplete.ts#L23-L47 thanks
// https://github.com/discordjs/discord-utils-bot/blob/main/src/functions/mdn.ts#L59C1-L78C3 thanks
import { ApplicationCommandOptionType, AllowedMentionType } from "lilybird";
import { $applicationCommand } from "@lilybird/handlers/advanced";
import { MDN_API, MDN_DISCORD_EMOJI } from "src/constants.ts";
import { safeSlice, silently } from "src/util.ts";

type MDNIndexEntry = {
  title: string;
  url: string;
};

type APIResult = {
  doc: Document;
};

type Document = {
  archived: boolean;
  highlight: Highlight;
  locale: string;
  mdn_url: string;
  popularity: number;
  score: number;
  slug: string;
  summary: string;
  title: string;
};

type Highlight = {
  body: string[];
  title: string[];
};

const MDN_DATA = (await (
  await fetch(`${MDN_API}/en-US/search-index.json`)
).json()) as MDNIndexEntry[];

const cache = new Map<string, Document>();

$applicationCommand({

  name: "mdn",
  description: "Search the Mozilla Developer Network documentation",
  options: [
    {
      type: ApplicationCommandOptionType.STRING,
      name: "query",
      description: "Class or method to search for",
      required: true,
      autocomplete: true,
      max_length: 100
    }, {
      type: ApplicationCommandOptionType.USER,
      name: "target",
      description: "User to mention"
    }, {
      type: ApplicationCommandOptionType.BOOLEAN,
      name: "hide",
      description: "Show this message only for you"
    }
  ],
  handle: async (interaction) => {
    const hide = interaction.data.getBoolean("hide") ?? false;

    await interaction.deferReply(hide);

    const query = interaction.data.getString("query", true).trim();
    const target = interaction.data.getUser("target");

    const key = `${MDN_API}/${query}/index.json`;

    let hit = cache.get(key);
    if (!hit) {
      try {
        const result = (await fetch(key).then(async (response) =>
          response.json()
        )) as APIResult;
        hit = result.doc;
      } catch {
        interaction.editReply({
          content: `❌ Invalid result. Make sure to select an entry from the autocomplete.`,
        });
        return;
      }
    }

    const url = MDN_API + hit.mdn_url;

    const linkReplaceRegex = /\[(.+?)]\((.+?)\)/g;
    const boldCodeBlockRegex = /`\*\*(.*)\*\*`/g;

    const intro = escape(hit.summary)
      .replaceAll(/\s+/g, " ")
      .replaceAll(linkReplaceRegex, `[$1](<${MDN_API}$2>)`)
      .replaceAll(boldCodeBlockRegex, `**\`$1\``);

    const parts = [
      `<:${MDN_DISCORD_EMOJI}> __**[${escape(hit.title)}](<${url}>)**__`,
      intro,
    ];

    await interaction.editReply({
      content: [
        target ? `*Suggestion for <@${target}>:*\n` : "",
        parts.join("\n"),
      ].join("\n"),
      allowed_mentions: {
        parse: target ? [AllowedMentionType.UserMentions] : [],
      },
    });
  },
  autocomplete: async (interaction) => {
    const query = interaction.data.getFocused<string>().value;

    const parts = query.split(/\.|#/).map((part) => part.toLowerCase());
    const candidates = [];

    for (const entry of MDN_DATA) {
      const lowerTitle = entry.title.toLowerCase();
      const matches = parts.filter((phrase) => lowerTitle.includes(phrase));
      if (matches.length) {
        candidates.push({
          entry,
          matches,
        });
      }
    }

    const sortedCandidates = candidates.sort((one, other) => {
      if (one.matches.length !== other.matches.length) {
        return other.matches.length - one.matches.length;
      }

      const aMatches = one.matches.join("").length;
      const bMatches = other.matches.join("").length;
      return bMatches - aMatches;
    });

    await silently(
      interaction.showChoices(
        safeSlice(
          sortedCandidates.map((candidate) => ({
            name: candidate.entry.title,
            value: candidate.entry.url,
          })),
          25
        )
      )
    );
  },
});

function escape(text: string) {
  return text.replaceAll("||", "|\u200B|").replaceAll("*", "\\*");
}
