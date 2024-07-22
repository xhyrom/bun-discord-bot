import { $applicationCommand } from "../handler.ts";

import {
  COMMIT_HASH,
  PRODUCTION,
  LILYBIRD_VERSION,
  LILYBIRD_HANDLERS_VERSION,
  LILYBIRD_JSX_VERSION,
  LILYBIRD_TRANSFORMERS_VERSION,
} from "../constants.ts";

$applicationCommand({
  name: "version",
  description: "Show version",
  handle: (interaction) => {
    interaction.reply({
      content: [
        `[git-bun-discord-bot-${COMMIT_HASH}](<https://github.com/xHyroM/bun-discord-bot/tree/${COMMIT_HASH}>) ${
          !PRODUCTION ? "(dev)" : ""
        }`,
        `[Bun v${Bun.version} (${Bun.revision})](<https://github.com/oven-sh/bun/releases/tag/bun-v${Bun.version}>)`,
        "",
        `[Lilybird v${LILYBIRD_VERSION}](<https://npmjs.org/lilybird>)`,
        `[Lilybird Handlers v${LILYBIRD_HANDLERS_VERSION}](<https://npmjs.org/@lilybird/handlers>)`,
        `[Lilybird JSX v${LILYBIRD_JSX_VERSION}](<https://npmjs.org/@lilybird/jsx>)`,
        `[Lilybird Transformers v${LILYBIRD_TRANSFORMERS_VERSION}](<https://npmjs.org/@lilybird/transformers>)`,
      ].join("\n"),
      ephemeral: true,
    });
  },
});
