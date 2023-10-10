import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Events, Message } from "discord.js";
import { defineListener } from "../loaders/listeners.ts";
import { MESSAGE_PREFIX } from "../constants.ts";
import { COMMANDS } from "../loaders/commands.ts";
import { MessageCommandContext } from "../structs/context/CommandContext.ts";
import { extname } from "node:path"; 
import { safeSlice } from "../util.ts";

const GITHUB_LINE_URL_REGEX = /(?:https?:\/\/)?(?:www\.)?(?:github)\.com\/(?<repo>[a-zA-Z0-9-_]+\/[A-Za-z0-9_.-]+)\/blob\/(?<path>.+?)#L(?<first_line_number>\d+)[-~]?L?(?<second_line_number>\d*)/i;
const BUN_ONLY_CHANNEL_ID = "1161157663867027476";

defineListener({
  event: Events.MessageCreate,
  run: async(message: Message) => {
    if (message.system || message.author.bot) return;

    if (!message.content.toLowerCase().startsWith(MESSAGE_PREFIX)) return handleOthers(message);

    const [commandName, ...args] = message.content
      .slice(MESSAGE_PREFIX.length)
      .trim()
      .split(/ +/g);

    if (commandName.length === 0) return;
    
    const command = COMMANDS.get(commandName);
    if (!command || !command.runMessage) return;

    const context = new MessageCommandContext(command, message, args);

    await Promise.resolve(command.runMessage(context))
      .catch(async error => {
        context.reply({
          content: `Something went wrong... ${error.message} (${error.code})`
        });
      });
  }
});

function handleOthers(message: Message) {
  if (handleBunOnlyChannel(message)) return;

  handleGithubLink(message);
}

function handleBunOnlyChannel(message: Message) {
  if (message.channel.id !== BUN_ONLY_CHANNEL_ID) return false;

  if (message.content !== "bun") {
    message.delete();
    return true;
  }
  
  message.react("🐰");
  return true;
}

async function handleGithubLink(message: Message) {
  const match = GITHUB_LINE_URL_REGEX.exec(message.content);
  const groups = match?.groups;
  if (!groups) return;

  const repo = groups.repo;
  const path = groups.path;
  let extension = extname(path).slice(1);
  const firstLineNumber = parseInt(groups.first_line_number) - 1;
  const secondLineNumber = parseInt(groups.second_line_number) || firstLineNumber + 1;

  const contentUrl = `https://raw.githubusercontent.com/${repo}/${path}`;
  const response = await fetch(contentUrl);
  const content = await response.text();
  const lines = content.split("\n");

  // limit, max 25 lines - possible flood
  if (secondLineNumber - firstLineNumber > 25 && lines.length > secondLineNumber) {
    message.react("❌");
    return;
  }

  let text = "";

  for (let i = 0; i < lines.length; i++) {
    if (i < firstLineNumber || i >= secondLineNumber) continue;

    const line = lines[i];
    text += `${line}\n`;
  }

  // delete the last \n
  text = text.slice(0, -1);

  if (extension === "zig") extension = "rs";

  message.reply({
    content: `\`\`\`${extension}\n${safeSlice(text, 2000 - 6 - extension.length)}\n\`\`\``,
    components: [
      new ActionRowBuilder<ButtonBuilder>()
        .setComponents(
          new ButtonBuilder()
            .setLabel(repo)
            .setStyle(ButtonStyle.Link)
            .setURL(`https://github.com/${repo}/blob/${path}#L${firstLineNumber + 1}${secondLineNumber ? `-L${secondLineNumber}` : ""}`)
        )
        .toJSON()
    ]
  })
}
