import { $applicationCommand } from "../handler.ts";
import { serializers as S } from "@purplet/serialize";
import { ActionRow, Button } from "@lilybird/jsx";
import { possibleClosedForm, silently } from "../util.ts";
import { ButtonStyle, ComponentType } from "lilybird";

$applicationCommand({
  name: "ping",
  description: "pong",
  components: [
    {
      type: ComponentType.Button,
      id: "ping",
      customMatcher: `custom_id[0] == "0" && custom_id[1] == "-"`,
      handle: (interaction) => {
        const combined = interaction.data.id.split("-")?.[1];
        if (!combined) return;

        const [ws, wsClosedForm, rest, restClosedForm] =
          S.generic.decodeCustomId(combined);

        silently(
          interaction.reply({
            content: [
              `🏓`,
              "**WebSocket:**",
              `\`${wsClosedForm}\``,
              `\`≈ ${ws} ms\``,
              "",
              "**Rest:**",
              `\`${restClosedForm}\``,
              `\`≈ ${rest} ms\``,
              "",
              "Mathematics is the language of the universe, it's truly fascinating! 😄",
            ].join("\n"),
            ephemeral: true,
          }),
        );
      },
    },
  ],
  handle: async (interaction) => {
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
});
