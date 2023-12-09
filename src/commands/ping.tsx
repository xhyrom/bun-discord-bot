import { ApplicationCommand } from "@lilybird/jsx";
import { SlashCommand } from "@lilybird/handlers";

export default {
  post: "GLOBAL",
  data: <ApplicationCommand name="ping" description="pong" />,
  run: async (interaction) => {
    const { ws, rest } = await interaction.client.ping();

    await interaction.editReply({
      content: `🏓 WebSocket: \`${ws}ms\` | Rest: \`${rest}ms\``,
    });
  },
} satisfies SlashCommand;
