import { defineListener } from "../loaders/listeners.ts";
import { Events } from "discord.js";

defineListener({
  event: Events.ClientReady,
  run: (client) => {
    console.log("heeh");
  }
})
