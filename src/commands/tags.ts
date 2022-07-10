import { APIApplicationCommandInteractionDataStringOption, ApplicationCommandOptionType, InteractionResponseType, MessageFlags } from 'discord-api-types/v10';
import { Command } from '../structures/Command';
import { findTags, getTag } from '../utils/tagsUtils';

new Command({
    name: 'tags',
    description: 'Send a tag by name or alias',
    guildId: '924395690451423332',
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
    run: (c) => {
        const query: APIApplicationCommandInteractionDataStringOption = c.options[0] as APIApplicationCommandInteractionDataStringOption;
        const target = c?.resolved?.users?.[0];

        const tag = getTag(query.value);
        if (!tag)
            return c.respond({
                type: InteractionResponseType.ChannelMessageWithSource,
                data: {
                    content: `\`❌\` Could not find a tag \`${query.value}\``,
                    flags: MessageFlags.Ephemeral
                }
            });

        return c.respond([
            target ? `*Tag suggestion for <@${target.id}>:*` : '',
            tag.content
        ].join('\n'));
    }
})