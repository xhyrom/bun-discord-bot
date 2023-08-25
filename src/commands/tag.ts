import { SlashCommandStringOption, SlashCommandUserOption, User } from "discord.js";
import { defineCommand } from "../loaders/commands.ts";
import { AutocompleteContext } from "../structs/context/AutocompleteContext.ts";
import { getTags, searchTag } from "../loaders/tags.ts";
import { InteractionCommandContext, MessageCommandContext } from "../structs/context/CommandContext.ts";
import { Bubu } from "../structs/Client.ts";

defineCommand({
  name: "tag",
  description: "Get tag",
  options: [
    {
      ...new SlashCommandStringOption()
          .setName("query")
          .setRequired(true)
          .setAutocomplete(true)
          .setDescription("Select query")
          .toJSON(),
      run: async(context: AutocompleteContext) => {
        const query = context.options.getString("query");
        if (!query) {
          return context.respond(getTags(25));
        }

        const tags = searchTag(query, true);
        if (tags.length > 0)
          return context.respond(tags);

        return context.respond(getTags(25));
      },
    },
    {
      ...new SlashCommandUserOption()
          .setName("target")
          .setRequired(false)
          .setDescription("User to mention")
          .toJSON()
    }
  ],
  run: (ctx: InteractionCommandContext) => {
    const query = ctx.interaction.options.getString("query");
    const target = ctx.interaction.options.getUser("target");

    const tag = searchTag(query, false);
    if (!tag) {
      return ctx.reply({
        content: `\`❌\` Could not find a tag \`${query}\``,
        ephemeral: true,
      });
    }

    ctx.reply({
      content: [
        target ? `*Suggestion for <@${target.id}>:*\n` : "",
        `**${tag.question}**`,
        tag.answer
      ].join("\n"),
      allowedMentions: {
        parse: [ "users" ]
      }
    });
  },
  runMessage: (ctx: MessageCommandContext) => {
    const keyword = ctx.options?.[0] ?? "what-is-bun";

    const target = ctx.options?.[1]?.match(/([0-9]+)/)?.[0];
    const resolvedTarget = target ? Bubu.users.cache.get(target) : null;

    const tag = searchTag(keyword, false);
    if (!keyword || !tag) {
      return ctx.reply({
        content: `\`❌\` Could not find a tag \`${keyword}\``,
      });
    }

    ctx.reply({
      content: [
        resolvedTarget ? `*Suggestion for <@${resolvedTarget.id}>:*\n` : "",
        `**${tag.question}**`,
        tag.answer
      ].join("\n"),
      allowedMentions: {
        parse: [ "users" ]
      }
    });
  }
})
