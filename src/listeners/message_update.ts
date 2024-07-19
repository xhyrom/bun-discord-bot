import { PartialMessage } from "@lilybird/transformers";
import { isBunOnlyLikeMessage } from "src/util.ts";
import { $listener } from "../handler.ts";

$listener({
  event: "messageUpdate",
  handle: (message) => {
    if (handleBunOnlyChannel(message)) return;
  },
});

function handleBunOnlyChannel(message: PartialMessage): boolean {
  if (message.channelId !== process.env.BUN_ONLY_CHANNEL_ID) return false;

  if (!isBunOnlyLikeMessage(message.content)) {
    message.delete();
    return true;
  }

  return true;
}
