import { Events, GuildMember } from "discord.js";
import { defineListener } from "../loaders/listeners.ts";
import { silently } from "../util.ts";

defineListener({
  event: Events.GuildMemberAdd,
  run: (member: GuildMember) => moderateNick(member)
});

defineListener({
  event: Events.GuildMemberUpdate,
  run: (_: GuildMember, newMember: GuildMember) => moderateNick(newMember)
});

async function moderateNick(member: GuildMember) {
  const name = member.displayName;
  const normalizedName = name.normalize("NFKC").replace(/^[!$#@%^`&*()]+/, "");

  if (name !== normalizedName) {
    silently(member.edit({
      nick: normalizedName,
      reason: "lame username"
    }));
  }
}
