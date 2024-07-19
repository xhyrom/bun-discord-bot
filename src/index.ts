import "./loaders/tags.ts";

import { SimpleTransformers, transformers, handler } from "./handler.ts";
import { ClientListeners, Intents, createClient } from "lilybird";
import { createHandler } from "@lilybird/handlers/simple";
import { info } from "@paperdave/logger";

// Make sure bubu will not crash
process.on("unhandledRejection", console.error);
process.on("uncaughtException", console.error);

handler.cachePath = `${import.meta.dir}/lily-cache/handler`;

await handler.scanDir(`${import.meta.dir}/commands`);
await handler.scanDir(`${import.meta.dir}/listeners`);

const {
  listeners: { messageCreate },
} = await createHandler({
  prefix: process.env.MESSAGE_PREFIX,
  dirs: {
    messageCommands: `${import.meta.dir}/message-commands`,
  },
});

const listeners =
  handler.getListenersObject() as ClientListeners<SimpleTransformers>;

if (
  typeof listeners.messageCreate !== "undefined" &&
  typeof messageCreate !== "undefined"
)
  listeners.messageCreate = async (m) => {
    await listeners.messageCreate!(m);
    await messageCreate(m);
  };
else if (typeof messageCreate !== "undefined")
  listeners.messageCreate = messageCreate;

await createClient({
  token: process.env.DISCORD_BOT_TOKEN,
  intents: [
    Intents.GUILDS,
    Intents.GUILD_MESSAGES,
    Intents.MESSAGE_CONTENT,
    Intents.GUILD_MEMBERS,
  ],
  setup: async (client) => {
    info(`Logged in as ${client.user.username} (${client.user.id})`);
    await handler.loadGlobalCommands(client);
  },
  transformers,
  listeners,
});
