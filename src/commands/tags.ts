import { APIApplicationCommandInteractionDataStringOption, ApplicationCommandOptionType, InteractionResponseType, MessageFlags } from 'discord-api-types/v10';
import { Command } from '../structures/Command';
import { findTags, getTag, Tag } from '../utils/tagsUtils';

new Command({
    name: 'tags',
    description: 'Send a tag by name or alias',
    options: [
        {
            name: 'query',
            description: 'Tag name or alias',
            type: ApplicationCommandOptionType.String,
            required: true,
            run: (ctx) => {
                return ctx.respond(findTags(ctx.value));
            }
        },
        {
            name: 'target',
            description: 'User to mention',
            type: ApplicationCommandOptionType.User,
            required: false
        }
    ],
    run: (ctx) => {
        const query: APIApplicationCommandInteractionDataStringOption = ctx.options[0] as APIApplicationCommandInteractionDataStringOption;
        const target = ctx?.resolved?.users ? Object.values(ctx?.resolved?.users)[0] : null;

        const tag = getTag(query.value, false);
        if (!tag)
            return ctx.respond({
                type: InteractionResponseType.ChannelMessageWithSource,
                data: {
                    content: `\`❌\` Could not find a tag \`${query.value}\``,
                    flags: MessageFlags.Ephemeral
                }
            });

        return ctx.respond([
            target ? `*Tag suggestion for <@${target.id}>:*` : '',
            tag.content
        ].join('\n'));
    }
})