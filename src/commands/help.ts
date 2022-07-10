import { InteractionResponseType } from 'discord-api-types/v10';
import { Command } from '../structures/Command';

new Command({
    name: 'help',
    description: 'Help command',
    guildId: '924395690451423332',
    run: (c) => {
        return c.respond({
            type: InteractionResponseType.ChannelMessageWithSource,
            data: {
                content: 'hello'
            }
        })
    }
})