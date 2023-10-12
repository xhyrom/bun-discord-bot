import { Events, Message } from "discord.js";
import { defineListener } from "../loaders/listeners.ts";
import { BUN_ONLY_CHANNEL_ID } from "../constants.ts";

defineListener({
  event: Events.MessageUpdate,
  run: async(_: Message, message: Message) => {
    if (handleBunOnlyChannel(message)) return;
  }
});

function handleBunOnlyChannel(message: Message) {
  if (message.channel.id !== BUN_ONLY_CHANNEL_ID) return false;

  if (message.content !== "bun") {
    message.delete();
    return true;
  }
  
  message.react("🐰");
  return true;
}
