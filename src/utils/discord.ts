import { Logger } from "./Logger";

export const getDiscordGuildMembers = async(token: string) => {
    let oldId;
    const result: any[] = [];

    while (true) {
        const members: any[] = await (await fetch(
            `https://discord.com/api/v10/guilds/876711213126520882/members?limit=1000${oldId ? `&after=${oldId}` : ''}`,
            {
                headers: {
                    Authorization: `Bot ${token}`,
                },
            }
        )).json();

        if (members.length == 0) break;

        result.push(...members.map(m => ({ id: m.id, nickname: m.nick })));
        oldId = members[members.length - 1].id;

        Logger.debug(`Fetching guild members - ${result.length}, ${oldId}`);
    }

    Logger.debug(`All guild members has been fetched - ${result.length}`);

    return result;
}

export const removeExclamationFromNicknames = async(token: string) => {
    for (const member of await getDiscordGuildMembers(token)) {
        if (!member.nickname?.startsWith?.('!')) continue;
        
        await fetch(`https://discord.com/api/v8/guilds/876711213126520882/members/${member.id}`, {
            method: 'PATCH',
            headers: {
                Authorization: `Bot ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                nick: member.nickname.slice(1),
            }),
        });
    }
} 