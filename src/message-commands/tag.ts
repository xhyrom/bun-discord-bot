import { getTags, searchTag } from "../loaders/tags.ts";
import { MessageCommand, channelFactory } from "lilybird";

export default {
    name: "tag",
    run: async (message, args) => {
        const keyword = args[0] ?? "what-is-bun";

        const target = args[1]?.match(/([0-9]+)/)?.[0];
        const resolvedTarget = target ? await message.client.rest.getUser(target) : null;

        // Lilybird still lacks `fetchx` methods
        const tag = searchTag(channelFactory(message.client, await message.client.rest.getChannel(message.channelId)), keyword, false);
        if (!keyword || !tag) {
            return message.reply({
                content: `\`❌\` Could not find a tag \`${keyword}\``,
            });
        }

        message.reply({
            content: [
                resolvedTarget ? `*Suggestion for <@${resolvedTarget.id}>:*\n` : "",
                `**${tag.question}**`,
                tag.answer
            ].join("\n"),
            // allowedMentions: {
            //     parse: ["users"]
            // }
        });
    },
} satisfies MessageCommand