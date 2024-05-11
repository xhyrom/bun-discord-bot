import { ApplicationCommand as JSXApplicationCommand } from "@lilybird/jsx";
import { ApplicationCommand } from "@lilybird/handlers";
import { possibleClosedForm } from "../util.ts";

export default {
  post: "GLOBAL",
  data: <JSXApplicationCommand name="ping" description="pong" />,
  run: async (interaction) => {
    await interaction.deferReply();

    const { ws, rest } = await interaction.client.ping();

    const [wsClosedForm, restClosedForm] = await Promise.all([
      possibleClosedForm(ws),
      possibleClosedForm(rest),
    ]);

    await interaction.editReply({
      content: [
        `🏓`,
        `WebSocket: \`${wsClosedForm} ms\``,
        `Rest: \`${restClosedForm} ms\``,
      ].join("\n"),
    });
  },
} satisfies ApplicationCommand;
