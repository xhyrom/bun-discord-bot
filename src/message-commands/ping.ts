import { MessageCommand } from "lilybird";
import { extractTimestampFromId } from "../util.ts";

export default {
    name: "ping",
    run: async (message) => {
        await message.reply({
            content: "🏓...",
        });

        const restPing = Date.now() - extractTimestampFromId(message.id);

        message.edit({
            content: `🏓 WebSocket: \`${message.client.ping}ms\` | Rest: \`${restPing}ms\``
        });
    },
} satisfies MessageCommand