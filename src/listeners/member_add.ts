import { moderateNick } from "../util.ts";
import { Event } from "lilybird";

export default {
    event: "guildMemberAdd",
    run: (member) => {
        moderateNick(member);
    },
} satisfies Event<"guildMemberAdd">