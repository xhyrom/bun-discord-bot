import "./loaders/tags";
import "./commands";
import "./listeners";

import { createClient, createHandler, Intents } from "lilybird";

// Make sure bubu will not crash
process.on("unhandledRejection", console.error);
process.on("uncaughtException", console.error);

const listeners = await createHandler({
    dirs: {
        slashCommands: `${import.meta.dir}/commands`,
        listeners: `${import.meta.dir}/listeners`
    }
})

await createClient({
    token: process.env.DISCORD_BOT_TOKEN,
    intents: [
        Intents.GUILDS,
        Intents.GUILD_MESSAGES,
        Intents.MESSAGE_CONTENT,
        Intents.GUILD_MEMBERS
    ],
    ...listeners
})

// Bubu.login(process.env.DISCORD_BOT_TOKEN).catch(console.error);
