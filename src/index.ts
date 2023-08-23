import "./commands"
import "./listeners";

import { Bubu } from "./structs/Client.ts";

// Make sure bubu will not crash
process.on("unhandledRejection", console.error);
process.on("uncaughtException", console.error);

Bubu.login(process.env.DISCORD_BOT_TOKEN).catch(console.error);
