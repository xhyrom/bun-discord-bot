import { MessageCommand } from "@lilybird/handlers";

export default {
  name: "ping",
  run: async (message) => {
    const newMessage = await message.reply({
      content: "🏓...",
    });

    const { ws, rest } = await message.client.ping();

    await newMessage.edit({
      content: `🏓 WebSocket: \`${ws}ms\` | Rest: \`${rest}ms\``,
    });
  },
} satisfies MessageCommand;
