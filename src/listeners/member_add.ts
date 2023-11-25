import { Event } from "lilybird";
import { moderateNick } from "../util.ts";

export default {
    event: "guildMemberAdd",
    run: (member) => {
        moderateNick(member);
    },
} satisfies Event<"guildMemberAdd">