import { COMMIT_HASH, PRODUCTION } from "../constants.ts";
import { ApplicationCommand } from "@lilybird/jsx";
import { SlashCommand } from "@lilybird/handlers";

export default {
    post: "GLOBAL",
    data: (
        <ApplicationCommand name="version" description="Show version" />
    ),
    run: (interaction) => {
        interaction.reply({
            content: [
                `[git-bun-discord-bot-${COMMIT_HASH}](<https://github.com/xHyroM/bun-discord-bot/tree/${COMMIT_HASH}>) ${!PRODUCTION ? "(dev)" : ""}`,
                `[v${Bun.version} (${Bun.revision})](<https://github.com/oven-sh/bun/releases/tag/bun-v${Bun.version}>)`
            ].join("\n"),
            ephemeral: true,
        });
    }
} satisfies SlashCommand
