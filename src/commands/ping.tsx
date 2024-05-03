import { ApplicationCommand as JSXApplicationCommand } from "@lilybird/jsx";
import { ApplicationCommand } from "@lilybird/handlers";

export default {
  post: "GLOBAL",
  data: <JSXApplicationCommand name="ping" description="pong" />,
  run: async (interaction) => {
    await interaction.deferReply();

    const { ws, rest } = await interaction.client.ping();

    await interaction.editReply({
      content: `🏓 WebSocket: \`${ws}ms\` | Rest: \`${rest}ms\``,
    });
  },
} satisfies ApplicationCommand;
