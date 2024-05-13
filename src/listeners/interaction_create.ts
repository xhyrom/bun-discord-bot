import { Event } from "@lilybird/handlers";
import { serializers as S } from "@purplet/serialize";
import { silently } from "src/util.ts";

export default {
  event: "interactionCreate",
  run: (interaction) => {
    if (
      !interaction.isMessageComponentInteraction() ||
      !interaction.data.isButton()
    )
      return;

    const id = interaction.data.id;

    if (id?.[0] == "0" && id?.[1] == "-") {
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
            "Mathematics is the language of the universe, it's truly fascinating! And being a software engineer requires a deep understanding of this language. It's not an easy field, but it's incredibly rewarding. 😄",
          ].join("\n"),
          ephemeral: true,
        })
      );
    }
  },
} satisfies Event<"interactionCreate">;
