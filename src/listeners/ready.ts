import { info } from "@paperdave/logger";
import { defineListener } from "../loaders/listeners.ts";
import { Client, Events } from "discord.js";

defineListener({
  event: Events.ClientReady,
  once: true,
  run: (client: Client) => {
    info(`Logged in as ${client.user.tag} (${client.user.id})`);
  }
})
