export const getDiscordGuildMembers = async() => {
    let oldId;
    const result: any[] = [];

    while (true) {
        const members: any[] = await (await fetch(
            `https://discord.com/api/v8/guilds/${process.env.DISCORD_GUILD_ID}/members?limit=1000${oldId ? `&after=${oldId}` : ''}`,
            {
                headers: {
                    Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
                },
            }
        )).json();

        if (!members.length) break;

        result.push(...members.map(m => ({ id: m.id, nickname: m.nick })));
        oldId = members[members.length - 1].id;
    }

    return result;
}

export const removeExclamationFromNicknames = async() => {
    for (const member of await getDiscordGuildMembers()) {
        if (!member.nickname?.startsWith?.('!')) continue;
        
        await fetch(`https://discord.com/api/v8/guilds/${process.env.DISCORD_GUILD_ID}/members/${member.id}`, {
            method: 'PATCH',
            headers: {
                Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                nick: member.nickname.slice(1),
            }),
        });
    }
} 