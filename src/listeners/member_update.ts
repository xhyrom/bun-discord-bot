import { $listener } from "../handler.ts";
import { moderateNick } from "../util.ts";

$listener({
  event: "guildMemberUpdate",
  handle: (member) => {
    moderateNick(member);
  },
});
