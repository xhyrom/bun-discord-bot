import { MessageCommand } from "@lilybird/handlers";
import { possibleClosedForm } from "../util.ts";

export default {
  name: "ping",
  run: async (message) => {
    const newMessage = await message.reply({
      content: "🏓...",
    });

    const { ws, rest } = await message.client.ping();

    const [wsClosedForm, restClosedForm] = await Promise.all([
      possibleClosedForm(ws),
      possibleClosedForm(rest),
    ]);

    await newMessage.edit({
      content: [
        `🏓`,
        `WebSocket: \`${wsClosedForm} ms\``,
        `Rest: \`${restClosedForm} ms\``,
      ].join("\n"),
    });
  },
} satisfies MessageCommand;
