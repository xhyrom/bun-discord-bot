import { Event } from "@lilybird/handlers";
import { PartialMessage } from "lilybird";
import { getRandomBunEmoji } from "src/util.ts";

export default {
  event: "messageUpdate",
  run: async (message) => {
    if (handleBunOnlyChannel(message)) return;
  },
} satisfies Event<"messageUpdate">;

function handleBunOnlyChannel(message: PartialMessage): boolean {
  if (message.channelId !== process.env.BUN_ONLY_CHANNEL_ID) return false;

  if (message.content !== "bun") {
    message.delete();
    return true;
  }

  // 1% chance to react with a random bun emoji
  if (Math.floor(Math.random() * 100) === 0) {
    message.react(getRandomBunEmoji().id, true);
    return true;
  }

  message.react("🐰");
  return true;
}
