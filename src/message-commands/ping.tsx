import { serializers as S } from "@purplet/serialize";
import { MessageCommand } from "@lilybird/handlers";
import { ActionRow, Button } from "@lilybird/jsx";
import { possibleClosedForm } from "../util.ts";
import { ButtonStyle } from "lilybird";

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

    const serialized = S.generic.encodeCustomId([
      ws,
      wsClosedForm,
      rest,
      restClosedForm,
    ]);

    await newMessage.edit({
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
} satisfies MessageCommand;
