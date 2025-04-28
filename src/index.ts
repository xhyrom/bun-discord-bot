import "./loaders/tags.ts";

import { defaultTransformers, handler } from "./handler.ts";
import { Client, Intents, createClient } from "lilybird";
import { info } from "@paperdave/logger";
import { MergeTransformers } from "@lilybird/transformers";

// Make sure bubu will not crash
process.on("unhandledRejection", console.error);
process.on("uncaughtException", console.error);

handler.cachePath = `${import.meta.dir}/lily-cache/handler`;

await handler.scanDir(`${import.meta.dir}/commands`);
await handler.scanDir(`${import.meta.dir}/listeners`);

await createClient<MergeTransformers<Client, typeof defaultTransformers>>({
  token: process.env.DISCORD_BOT_TOKEN,
  intents: Intents.GUILDS | Intents.GUILD_MESSAGES | Intents.MESSAGE_CONTENT | Intents.GUILD_MEMBERS,
  listeners: {
    setup: async (client) => {
      info(`Logged in as ${client.user.username} (${client.user.id})`);
      await handler.loadGlobalCommands(client);
    },
    ...handler.getListenersObject(),
  },
  transformers: defaultTransformers,
});
