import { ApplicationCommand, StringOption, UserOption } from "@lilybird/jsx";
import { getTags, searchTag } from "../loaders/tags.ts";
import { SlashCommand } from "@lilybird/handlers";

export default {
  post: "GLOBAL",
  data: (
    <ApplicationCommand name="tag" description="Get tag">
      <StringOption
        name="query"
        description="Select query"
        required
        autocomplete
      />
      <UserOption name="target" description="User to mention" />
    </ApplicationCommand>
  ),
  run: async (interaction) => {
    if (!interaction.inGuild()) return;
    const query = interaction.data.getString("query", true);
    const target = interaction.data.getUser("target");

    const tag = searchTag(interaction.channel, query, false);
    if (!tag) {
      return interaction.reply({
        content: `\`❌\` Could not find a tag \`${query}\``,
        ephemeral: true,
      });
    }

    await interaction.reply({
      content: [
        target ? `*Suggestion for <@${target}>:*\n` : "",
        `**${tag.question}**`,
        tag.answer,
      ].join("\n"),
      // allowedMentions: {
      //     parse: ["users"]
      // }
    });
  },
  autocomplete: async (interaction) => {
    if (!interaction.inGuild()) return;
    const query = interaction.data.getFocused<string>().value;
    if (!query) {
      return await interaction.respond(getTags(interaction.channel, 25));
    }

    const tags = searchTag(interaction.channel, query, true);
    if (tags.length > 0) return await interaction.respond(tags);

    return await interaction.respond(getTags(interaction.channel, 25));
  },
} satisfies SlashCommand;
