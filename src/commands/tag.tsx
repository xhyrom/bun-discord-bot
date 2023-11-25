import { getTags, searchTag } from "../loaders/tags.ts";
import {
    CommandStringOption,
    CommandUserOption,
    SlashCommand,
    Command
} from "lilybird";

export default {
    post: "GLOBAL",
    data: (
        <Command name="tag" description="Get tag">
            <CommandStringOption name="query" description="Select query" required autocomplete />
            <CommandUserOption name="target" description="User to mention" />
        </Command>
    ),
    run: async (interaction) => {
        if (!interaction.inGuild()) return;
        const query = interaction.data.options.getString("query", true);
        const target = interaction.data.options.getUser("target");

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
                tag.answer
            ].join("\n"),
            // allowedMentions: {
            //     parse: ["users"]
            // }
        });
    },
    autocomplete: async (interaction) => {
        if (!interaction.inGuild()) return;
        const query = interaction.data.options.getString("query");
        if (!query) {
            return await interaction.respond(getTags(interaction.channel, 25));
        }

        const tags = searchTag(interaction.channel, query, true);
        if (tags.length > 0)
            return await interaction.respond(tags);

        return await interaction.respond(getTags(interaction.channel, 25));
    }
} satisfies SlashCommand