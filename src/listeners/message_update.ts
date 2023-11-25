import { Event, Message } from "lilybird";

export default {
    event: "messageUpdate",
    run: async (message) => {
        if (handleBunOnlyChannel(message)) return;
    }
} satisfies Event<"messageUpdate">;

function handleBunOnlyChannel(message: Message): boolean {
    if (message.channelId !== process.env.BUN_ONLY_CHANNEL_ID) return false;

    if (message.content !== "bun") {
        message.delete();
        return true;
    }

    message.react("🐰");
    return true;
}
