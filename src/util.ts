import { GuildMember } from "@lilybird/transformers";
import { BUN_EMOJIS } from "./constants.ts";

export function safeSlice<T extends string | Array<any>>(
  input: T,
  length: number
): T {
  return <T>(input.length > length ? input.slice(0, length) : input);
}

export async function silently<T>(value: Promise<T>) {
  try {
    await value;
  } catch {}
}

export async function moderateNick(member: GuildMember) {
  let name = member.nick ?? member.user.username;
  const normalizedName = name.normalize("NFKC").replace(/^[!$#@%^`&*()]+/, "");

  if (name === normalizedName) return;

  silently(
    member.modify({
      nick: normalizedName,
      reason: "lame username",
    })
  );
}

export function isBunOnlyLikeMessage(content?: string) {
  if (!content) return false;
  if (content === "bun") return true;

  return BUN_EMOJIS.some((emoji) =>
    emoji.animated
      ? content.replace(/<a:|>/g, "") == `${emoji.name}:${emoji.id}`
      : content.replace(/<:|>/g, "") == `${emoji.name}:${emoji.id}`
  );
}

export function getRandomBunEmoji() {
  return BUN_EMOJIS[Math.floor(Math.random() * BUN_EMOJIS.length)];
}
