import { $listener } from "../handler.ts";
import { moderateNick } from "../util.ts";

$listener({
  event: "guildMemberAdd",
  handle: (member) => {
    moderateNick(member);
  },
});
