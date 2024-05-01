import { GuildMember } from "@lilybird/transformers";
import { BUN_EMOJIS } from "./constants.ts";
import { parse, formatMarkdown } from "bun-tracestrings";

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

export function sliceIfStartsWith(input: string, startsWith: string) {
  return input.startsWith(startsWith) ? input.slice(startsWith.length) : input;
}

export async function getBunReportDetailsInMarkdown(
  url: string
): Promise<string> {
  const parsed = await parse(url);

  const res = await fetch("https://bun.report/remap", {
    method: "POST",
    body: url,
  });

  if (!res.ok) {
    return `Failed to get details from bun.report: ${res.statusText}`;
  }

  const json = await res.json();
  console.log(json);

  return formatMarkdown({
    ...parsed,
    ...json,
  });
}
