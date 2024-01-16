import { Event } from "@lilybird/handlers";
import { PartialMessage } from "lilybird";
import { isBunOnlyLikeMessage } from "src/util.ts";

export default {
  event: "messageUpdate",
  run: async (message) => {
    if (handleBunOnlyChannel(message)) return;
  },
} satisfies Event<"messageUpdate">;

function handleBunOnlyChannel(message: PartialMessage): boolean {
  if (message.channelId !== process.env.BUN_ONLY_CHANNEL_ID) return false;

  if (!isBunOnlyLikeMessage(message.content)) {
    message.delete();
    return true;
  }

  return true;
}
