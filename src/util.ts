import { GuildMember } from "lilybird";

export function safeSlice<T extends string | Array<any>>(input: T, length: number): T {
    return <T>(input.length > length ? input.slice(0, length) : input);
}

export async function silently<T>(value: Promise<T>) {
    try {
        await value;
    } catch { }
}

export async function moderateNick(member: GuildMember) {
    let name = member.nick ?? member.user.username;
    const normalizedName = name.normalize("NFKC").replace(/^[!$#@%^`&*()]+/, "");

    if (name === normalizedName) return;

    silently(member.modify({
        nick: normalizedName,
        reason: "lame username"
    }));
}

const DiscordEpoch = 1420070400000n;

export function extractTimestampFromId(id: string): number {
    return Number((BigInt(id) >> 22n) + DiscordEpoch)
}