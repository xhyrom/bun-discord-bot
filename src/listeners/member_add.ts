import { moderateNick } from "../util.ts";
import { Event } from "@lilybird/handlers";

export default {
    event: "guildMemberAdd",
    run: (member) => {
        moderateNick(member);
    },
} satisfies Event<"guildMemberAdd">