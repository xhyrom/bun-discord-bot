import { ApplicationCommand as JSXApplicationCommand } from "@lilybird/jsx";
import { ApplicationCommand } from "@lilybird/handlers";
import { wolframApiClient } from "../constants.ts";

export default {
  post: "GLOBAL",
  data: <JSXApplicationCommand name="ping" description="pong" />,
  run: async (interaction) => {
    await interaction.deferReply();

    const { ws, rest } = await interaction.client.ping();

    const wsClosedForm = await possibleClosedForm(ws);
    const restClosedForm = await possibleClosedForm(rest);

    await interaction.editReply({
      content: [
        `🏓`,
        `WebSocket: \`${wsClosedForm} ms\``,
        `Rest: \`${restClosedForm} ms\``,
      ].join("\n"),
    });
  },
} satisfies ApplicationCommand;

async function possibleClosedForm(
  value: number | string
): Promise<string | number> {
  try {
    const res = await wolframApiClient.getFull(value.toString());
    const pod = res?.pods?.find((p) => p.id === "PossibleClosedForm");
    if (!pod) {
      return value;
    }

    pod.subpods.sort((a, b) => {
      if (
        a.plaintext.includes("log") ||
        a.plaintext.includes("e") ||
        a.plaintext.includes("π")
      ) {
        return -1;
      }

      if (
        b.plaintext.includes("log") ||
        b.plaintext.includes("e") ||
        b.plaintext.includes("π")
      ) {
        return 1;
      }

      return Math.random() - 0.5;
    });

    const randomSubpod = pod.subpods[0];

    const text = randomSubpod.plaintext;

    if (text.includes("=") && !text.includes("near") && !text.includes("≈")) {
      return text.split("=")[0].trim();
    }

    return randomSubpod.plaintext.split("≈")[0].trim();
  } catch {
    return value;
  }
}
