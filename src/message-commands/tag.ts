import { MessageCommand } from "@lilybird/handlers/simple";
import { searchTag } from "../loaders/tags.ts";
import { AllowedMentionType } from "lilybird";

export default {
  name: "tag",
  run: async (message, args) => {
    const keyword = args[0];
    if (!keyword) return; // just ignore

    const target = args[1]?.match(/([0-9]+)/)?.[0];
    const resolvedTarget = target
      ? await message.client.rest.getUser(target)
      : null;

    const tag = searchTag(await message.fetchChannel(), keyword, false);
    if (!keyword || !tag) return; // just ignore

    message.reply({
      content: [
        resolvedTarget ? `*Suggestion for <@${resolvedTarget.id}>:*\n` : "",
        `**${tag.question}**`,
        tag.answer,
      ].join("\n"),
      allowed_mentions: {
        parse: resolvedTarget ? [AllowedMentionType.UserMentions] : [],
      },
    });
  },
} satisfies MessageCommand;
