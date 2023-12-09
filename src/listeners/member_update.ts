import { moderateNick } from "../util.ts";
import { Event } from "@lilybird/handlers";

export default {
    event: "guildMemberUpdate",
    run: (member) => {
        moderateNick(member);
    },
} satisfies Event<"guildMemberUpdate">