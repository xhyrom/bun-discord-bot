import { Message, ButtonStyle } from "lilybird";
import { ActionRow, Button } from "@lilybird/jsx";
import { extname, basename } from "node:path";
import { Event } from "@lilybird/handlers";
import { isBunOnlyLikeMessage, safeSlice } from "../util.ts";

const GITHUB_LINE_URL_REGEX =
  /(?:https?:\/\/)?(?:www\.)?(?:github)\.com\/(?<repo>[a-zA-Z0-9-_]+\/[A-Za-z0-9_.-]+)\/blob\/(?<path>.+?)#L(?<first_line_number>\d+)[-~]?L?(?<second_line_number>\d*)/i;

export default {
  event: "messageCreate",
  run: async (message) => {
    if (handleBunOnlyChannel(message)) return;
    if (!message.content?.toLowerCase().startsWith(process.env.MESSAGE_PREFIX))
      return handleOthers(message);
  },
} satisfies Event<"messageCreate">;

function handleOthers(message: Message): void {
  handleGithubLink(message);
}

function handleBunOnlyChannel(message: Message): boolean {
  if (message.channelId !== process.env.BUN_ONLY_CHANNEL_ID) return false;

  if (!isBunOnlyLikeMessage(message.content)) {
    message.delete();
    return true;
  }

  message.react("🐰");
  return true;
}

async function handleGithubLink(message: Message): Promise<void> {
  if (!message.content) return;

  const match = GITHUB_LINE_URL_REGEX.exec(message.content);
  const groups = match?.groups;
  if (!groups) return;

  const repo = groups.repo;
  const path = groups.path;
  let extension = extname(path).slice(1);
  const firstLineNumber = parseInt(groups.first_line_number) - 1;
  const secondLineNumber =
    parseInt(groups.second_line_number) || firstLineNumber + 1;

  const contentUrl = `https://raw.githubusercontent.com/${repo}/${path}`;
  const response = await fetch(contentUrl);
  const content = await response.text();
  const lines = content.split("\n");

  // limit, max 25 lines - possible flood
  if (
    secondLineNumber - firstLineNumber > 25 &&
    lines.length > secondLineNumber
  ) {
    message.react("❌");
    return;
  }

  let text = "";

  for (let i = 0; i < lines.length; i++) {
    if (i < firstLineNumber || i >= secondLineNumber) continue;

    const line = lines[i];
    text += `${line}\n`;
  }

  // delete the last \n
  text = text.slice(0, -1);

  if (extension === "zig") extension = "rs";

  message.reply({
    content: `***${basename(path)}*** — *(L${firstLineNumber + 1}${
      secondLineNumber ? `-L${secondLineNumber}` : ""
    })*\n\`\`\`${extension}\n${safeSlice(
      text,
      2000 - 6 - extension.length
    )}\n\`\`\``,
    components: [
      <ActionRow>
        <Button
          style={ButtonStyle.Link}
          url={`https://github.com/${repo}/blob/${path}#L${
            firstLineNumber + 1
          }${secondLineNumber ? `-L${secondLineNumber}` : ""}`}
          label={repo}
        />
      </ActionRow>,
    ],
  });
}
