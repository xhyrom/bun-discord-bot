import { RouteBases, Routes } from 'discord-api-types/v10';
import { Commands } from '../managers/CommandManager';
import { Command } from '../structures/Command';
import { Logger } from './Logger';

const sync = async(
	clientToken: string,
    clientUserId: string,
	commands: Command[],
	guildId?: string,
) => {
    const res = await fetch(
		`${RouteBases.api}${guildId ? Routes.applicationGuildCommands(clientUserId, guildId) : Routes.applicationCommands(clientUserId)}`,
        {
            method: 'PUT',
            body: JSON.stringify(commands.flatMap(command => command.toJSON())),
            headers: {
                'Authorization': `Bot ${clientToken}`,
				'Content-Type': 'application/json'
            }
        }
    )
    
	if (res.ok) return Logger.success('🌍 All commands has been synchronized with discord api.');
	const data = await res.json() as any;

	if (res.status === 429) {
		setTimeout(
			() => sync(clientToken, clientUserId, commands, guildId),
			data.retry_after * 1000,
		);
	} else {
		Logger.error(
			typeof data.code !== 'undefined' ? data.code.toString() : '',
			data.message
		)

		console.log(data);
	}
}

export default async(clientToken: string, clientUserId: string) => {
	if (Commands.size === 0) return;

	const [guild, global] = Commands.partition(
		command => typeof command.guildId === 'string',
	);

	const guildIds = new Set(guild.map(c => c.guildId));
	for await (const guildId of guildIds) {
		const commands = guild.filter(item => item.guildId === guildId);
		await sync(clientToken, clientUserId, [...commands.values()], guildId);
	}

	if (global.size > 0) await sync(clientToken, clientUserId, [...global.values()]);
}