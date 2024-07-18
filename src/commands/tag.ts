import { $applicationCommand } from "@lilybird/handlers/advanced";
import { getTags, searchTag } from "../loaders/tags.ts";
import { ApplicationCommandOptionType } from "lilybird";

$applicationCommand({
  name: "tag",
  description: "Get tag",
  options: [
    {

      type: ApplicationCommandOptionType.STRING,
      name: "query",
      description: "Select query",
      required: true,
      autocomplete: true
    },
    {
      type: ApplicationCommandOptionType.USER,
      name: "target",
      description: "User to mention"
    }
  ],
  handle: async (interaction) => {
    if (!interaction.inGuild()) return;
    const query = interaction.data.getString("query", true);
    const target = interaction.data.getUser("target");

    const tag = searchTag(interaction.channel, query, false);
    if (!tag) {
      // @ts-expect-error allowed_mentions
      return interaction.reply({
        content: `\`❌\` Could not find a tag \`${query}\``,
        ephemeral: true,
        allowed_mentions: {
          parse: [],
        },
      });
    }

    // @ts-expect-error allowed_mentions
    await interaction.reply({
      content: [
        target ? `*Suggestion for <@${target}>:*\n` : "",
        `**${tag.question}**`,
        tag.answer,
      ].join("\n"),
      allowed_mentions: {
        parse: target ? ["users"] : [],
      },
    });
  },
  autocomplete: async (interaction) => {
    if (!interaction.inGuild()) return;
    const query = interaction.data.getFocused<string>().value;
    if (!query) {
      return await interaction.showChoices(getTags(interaction.channel, 25));
    }

    const tags = searchTag(interaction.channel, query, true);
    if (tags.length > 0) return await interaction.showChoices(tags);

    return await interaction.showChoices(getTags(interaction.channel, 25));
  },
});
