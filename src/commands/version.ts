import { defineCommand } from "../loaders/commands.ts";
import { COMMIT_HASH } from "../constants.ts"; 
import { CommandContext } from "../structs/context/CommandContext.ts";

export default defineCommand({
  name: "version",
  options: [],
  run: (context: CommandContext) => {
    context.interaction.reply({
      content: [
        `[git-bun-discord-bot-${COMMIT_HASH}](<https://github.com/xHyroM/bun-discord-bot/tree/${COMMIT_HASH}>)`,
        `[v${Bun.version}](https://github.com/oven-sh/bun/releases/tag/bun-v${Bun.version})`
      ].join("\n"),
      ephemeral: true,
    });
  }
});
