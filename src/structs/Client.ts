import { Client, GatewayIntentBits, } from "discord.js";

export const Bubu = new Client({
  intents: GatewayIntentBits.Guilds | GatewayIntentBits.GuildMessages | GatewayIntentBits.MessageContent
  //intents: GatewayIntentBits.Guilds | GatewayIntentBits.GuildMessages | GatewayIntentBits.MessageContent | GatewayIntentBits.GuildMembers,
  //allowedMentions: {
  //  parse: [],
  //  repliedUser: false,
  //}
});

Bubu.on("error", console.log);
