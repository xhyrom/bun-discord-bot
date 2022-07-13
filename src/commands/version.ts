import { InteractionResponseType, MessageFlags } from 'discord-api-types/v10';
import { Command } from '../structures/Command';
import { exec } from 'bun-utilities';

const commitHash = (await exec(['git', 'log', '--pretty=format:\'%h\'', '-n', '1'])).stdout.replaceAll('\'', '');

new Command({
    name: 'version',
    description: 'Check bot and bun version',
    run: (ctx) => {
        return ctx.respond({
            type: InteractionResponseType.ChannelMessageWithSource,
            data: {
                content: [
                    `Bot version: [git-bun-discord-bot-"${commitHash}"](<https://github.com/xHyroM/bun-discord-bot/commit/${commitHash}>)`,
                    `Bun version: [${process.version}](<https://github.com/oven-sh/bun/releases/tag/bun-${process.version}>)`,
                ].join('\n'),
                flags: MessageFlags.Ephemeral,
            }
        })
    }
})