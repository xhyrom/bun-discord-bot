import { GuildMember } from "lilybird";

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

const BUN_ONLY_LIKE_MESSAGE_REGEX =
  /^<:(awesomebun:1136571782472683571|beno:1152544141323010049|bun:994093611065024512|bunUwU:1152543655035412602|bunana:1118962978088304741|bundough:1152673360224993383|bundows:1180836292657942598|bunlove:1001784944068145213|bunx:1151197324299739146|buxmas:1180860721672757308|grabbun:995824913418027118|lickbun:1118962491653898311|nomouth_bun:995824878227820687|nostalgiabun:995824933236129912|peekbun:995823659786711082|rainbowbun:995824310860128326|uwubun:995823895175233587|bupple:1190690285852839976)>$/i;
export function isBunOnlyLikeMessage(content?: string) {
  if (!content) return false;
  if (content === "bun") return true;

  return BUN_ONLY_LIKE_MESSAGE_REGEX.test(content);
}
