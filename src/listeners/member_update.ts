import { Event } from "lilybird";
import { moderateNick } from "../util.ts";

export default {
    event: "guildMemberUpdate",
    run: (member) => {
        moderateNick(member);
    },
} satisfies Event<"guildMemberUpdate">