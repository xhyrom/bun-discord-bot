import {
  ActionRow,
  Button,
  ApplicationCommand as JSXApplicationCommand,
} from "@lilybird/jsx";
import { ApplicationCommand } from "@lilybird/handlers";
import { serializers as S } from "@purplet/serialize";
import { possibleClosedForm } from "../util.ts";
import { ButtonStyle } from "lilybird";

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

    const serialized = S.generic.encodeCustomId([
      ws,
      wsClosedForm,
      rest,
      restClosedForm,
    ]);

    await interaction.editReply({
      content: [
        `🏓`,
        `WebSocket: \`${wsClosedForm} ms\``,
        `Rest: \`${restClosedForm} ms\``,
      ].join("\n"),
      components: [
        <ActionRow>
          <Button
            label="I'm normal!"
            style={ButtonStyle.Danger}
            emoji={{ name: "🤦", id: null, animated: false }}
            id={`0-${serialized}`}
          />
        </ActionRow>,
      ],
    });
  },
} satisfies ApplicationCommand;
