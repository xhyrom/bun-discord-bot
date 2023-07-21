import { GatewayIntentBits } from "discord.js";
import { Bient } from "./Bient.ts";

const client = new Bient({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

await client.load();

client.login();
