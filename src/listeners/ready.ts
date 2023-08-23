import { defineListener } from "../loaders/listeners.ts";
import { Client, Events } from "discord.js";

defineListener({
  event: Events.ClientReady,
  once: true,
  run: (client: Client) => {
    console.log("heeh");
  }
})
