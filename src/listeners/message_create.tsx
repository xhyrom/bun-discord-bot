import { ActionRow, Button } from "@lilybird/jsx";
import { Message } from "@lilybird/transformers";
import { extname, basename } from "node:path";
import { $listener } from "../handler.ts";
import { ButtonStyle } from "lilybird";

import {
  getBunReportDetailsInMarkdown,
  getRandomBunEmoji,
  isBunOnlyLikeMessage,
  safeSlice,
} from "../util.ts";

const GITHUB_LINE_URL_REGEX =
  /(?:https?:\/\/)?(?:www\.)?(?:github)\.com\/(?<repo>[a-zA-Z0-9-_]+\/[A-Za-z0-9_.-]+)\/blob\/(?<path>.+?)#L(?<first_line_number>\d+)[-~]?L?(?<second_line_number>\d*)/i;
const BUN_REPORT_URL_REGEX = /(https:\/\/bun\.report\/\d+\.\d+(\.\d+)?\/\S+)/g;

$listener({
  event: "messageCreate",
  handle: (message) => {
    if (handleBunOnlyChannel(message)) return;
    if (!message.content?.toLowerCase().startsWith(process.env.MESSAGE_PREFIX))
      return handleOthers(message);
  },
});

function handleOthers(message: Message): void {
  handleGithubLink(message);
  handleBunReportLink(message);
  //handleTwitterLink(message); // discord finnaly has embeds
}

function handleBunOnlyChannel(message: Message): boolean {
  if (message.channelId !== process.env.BUN_ONLY_CHANNEL_ID) return false;

  if (!isBunOnlyLikeMessage(message)) {
    message.delete();
    return true;
  }

  // 10% chance to react with a random bun emoji
  if (Math.random() < 0.1) {
    const emoji = getRandomBunEmoji();
    message.react(`${emoji.name}:${emoji.id}`, true);
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
      2000 - 6 - extension.length,
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
    allowed_mentions: {
      parse: [],
    },
  });
}

async function handleBunReportLink(message: Message): Promise<void> {
  if (!message.content) return;

  const match = message.content.match(BUN_REPORT_URL_REGEX);
  if (!match?.[0]) return;

  const data = await getBunReportDetailsInMarkdown(match[0]);
  if (!data) return;

  message.reply({
    content: data,
    allowed_mentions: {
      parse: [],
    },
  });
}
