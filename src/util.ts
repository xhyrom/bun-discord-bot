import { GuildMember } from "@lilybird/transformers";
import { BUN_EMOJIS, wolframApiClient } from "./constants.ts";
import { parseAndRemap, formatMarkdown } from "bun-tracestrings";

const URL_REGEX = /\(\s*(https?:\/\/[^\s\[\]]+)\s*\)/gi;

export function safeSlice<T extends string | Array<any>>(
  input: T,
  length: number,
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
    }),
  );
}

export function isBunOnlyLikeMessage(content?: string) {
  if (!content) return false;
  if (content === "bun") return true;

  return BUN_EMOJIS.some((emoji) =>
    emoji.animated
      ? content.replace(/<a:|>/g, "") == `${emoji.name}:${emoji.id}`
      : content.replace(/<:|>/g, "") == `${emoji.name}:${emoji.id}`,
  );
}

export function getRandomBunEmoji() {
  return BUN_EMOJIS[Math.floor(Math.random() * BUN_EMOJIS.length)];
}

export function sliceIfStartsWith(input: string, startsWith: string) {
  return input.startsWith(startsWith) ? input.slice(startsWith.length) : input;
}

export async function getBunReportDetailsInMarkdown(
  url: string,
): Promise<string | undefined> {
  const remap = await parseAndRemap(url);
  if (!remap) return;
  if (!Array.isArray(remap.features)) remap.features = []; // temporary fix

  let content = formatMarkdown(remap, {
    source: url,
  });

  for (const match of content.matchAll(URL_REGEX)) {
    let url = match[1];
    if (url.endsWith(")")) {
      url = url.slice(0, -1);
    }

    if (!url.startsWith("<")) {
      content = content.replace(url, `<${url}>`);
    }
  }

  return content;
}

export async function possibleClosedForm(
  value: number | string,
): Promise<string | number> {
  try {
    const res = await wolframApiClient.getFull(value.toString());
    const pod = res?.pods?.find((p) => p.id === "PossibleClosedForm");
    if (!pod) {
      return value;
    }

    pod.subpods.sort((a, b) => {
      const aContainsSpecial =
        a.plaintext.includes("log") ||
        a.plaintext.includes("e") ||
        a.plaintext.includes("π");
      const bContainsSpecial =
        b.plaintext.includes("log") ||
        b.plaintext.includes("e") ||
        b.plaintext.includes("π");
      const aContainsNear = a.plaintext.includes("near");
      const bContainsNear = b.plaintext.includes("near");

      if (aContainsSpecial && !aContainsNear) {
        return -1;
      }

      if (bContainsSpecial && !bContainsNear) {
        return 1;
      }

      if (aContainsSpecial && aContainsNear) {
        return -1;
      }

      if (bContainsSpecial && bContainsNear) {
        return 1;
      }

      return Math.random() - 0.5;
    });

    const randomSubpod = pod.subpods[0];

    const text = randomSubpod.plaintext;

    if (text.includes("=") && !text.includes("near") && !text.includes("≈")) {
      return text.split("=")[0].trim();
    }

    return randomSubpod.plaintext.split("≈")[0].trim();
  } catch {
    return value;
  }
}
