import { extractTimestampFromId } from "../util.ts";

import {
    SlashCommand,
    Command
} from "lilybird";

export default {
    post: "GLOBAL",
    data: (
        <Command name="ping" description="pong" />
    ),
    run: async (interaction) => {
        await interaction.deferReply(true);

        const restPing = Date.now() - extractTimestampFromId(interaction.id);

        await interaction.editReply({
            content: `🏓 WebSocket: \`${interaction.client.ping}ms\` | Rest: \`${restPing}ms\``
        });
    },
} satisfies SlashCommand