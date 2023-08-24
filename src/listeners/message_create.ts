import { Events, Message } from "discord.js";
import { defineListener } from "../loaders/listeners.ts";
import { MESSAGE_PREFIX } from "../constants.ts";
import { COMMANDS } from "../loaders/commands.ts";
import { MessageCommandContext } from "../structs/context/CommandContext.ts";

defineListener({
  event: Events.MessageCreate,
  run: async(message: Message) => {
    if (!message.content.toLowerCase().startsWith(MESSAGE_PREFIX))
      return;

    const [commandName, ...args] = message.content
      .slice(MESSAGE_PREFIX.length)
      .trim()
      .split(/ +/g);

    if (commandName.length === 0) return;
    
    const command = COMMANDS.get(commandName);
    if (!command) return;

    const context = new MessageCommandContext(command, message, args);

    await Promise.resolve(command.run(context))
      .catch(async error => {
        context.reply({
          content: `Something went wrong... ${error.message} (${error.code})`
        });
      });
  }
});
