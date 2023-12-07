import { MessageCommand } from "@lilybird/handlers";

export default {
    name: "ping",
    run: async (message) => {
        await message.reply({
            content: "🏓...",
        });

        const { ws, rest } = await message.client.ping();

        await message.edit({
            content: `🏓 WebSocket: \`${ws}ms\` | Rest: \`${rest}ms\``
        });
    },
} satisfies MessageCommand