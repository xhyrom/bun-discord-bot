import "./loaders/tags";
import "./commands";
import "./listeners";

import { createClient, createHandler, Intents } from "lilybird";

// Make sure bubu will not crash
process.on("unhandledRejection", console.error);
process.on("uncaughtException", console.error);

const listeners = await createHandler({
    prefix: process.env.MESSAGE_PREFIX,
    dirs: {
        messageCommands: `${import.meta.dir}/message-commands`,
        slashCommands: `${import.meta.dir}/commands`,
        listeners: `${import.meta.dir}/listeners`
    }
});

await createClient({
    token: process.env.DISCORD_BOT_TOKEN,
    intents: [
        Intents.GUILDS,
        Intents.GUILD_MESSAGES,
        Intents.MESSAGE_CONTENT,
        Intents.GUILD_MEMBERS
    ],
    ...listeners
});
