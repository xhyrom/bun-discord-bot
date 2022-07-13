import { InteractionResponseType, MessageFlags } from 'discord-api-types/v10';
import { Command } from '../structures/Command';

new Command({
    name: 'ping',
    description: 'pong',
    run: (ctx) => {
        return ctx.respond({
            type: InteractionResponseType.ChannelMessageWithSource,
            data: {
                content: 'Pong 🏓',
                flags: MessageFlags.Ephemeral,
            }
        })
    }
})