import { MessageCommand } from "@lilybird/handlers";
import { searchTag } from "../loaders/tags.ts";

export default {
  name: "tag",
  run: async (message, args) => {
    const keyword = args[0] ?? "what-is-bun";

    const target = args[1]?.match(/([0-9]+)/)?.[0];
    const resolvedTarget = target
      ? await message.client.rest.getUser(target)
      : null;

    const tag = searchTag(await message.fetchChannel(), keyword, false);
    if (!keyword || !tag) {
      // @ts-expect-error allowed_mentions
      return message.reply({
        content: `\`❌\` Could not find a tag \`${keyword}\``,
        allowed_mentions: {
          parse: [],
        },
      });
    }

    // @ts-expect-error allowed_mentions
    message.reply({
      content: [
        resolvedTarget ? `*Suggestion for <@${resolvedTarget.id}>:*\n` : "",
        `**${tag.question}**`,
        tag.answer,
      ].join("\n"),
      allowed_mentions: {
        parse: resolvedTarget ? ["users"] : [],
      },
    });
  },
} satisfies MessageCommand;
