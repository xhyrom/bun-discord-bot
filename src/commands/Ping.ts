import { CommandInteraction } from "discord.js";
import { Command } from "../decorators/Command";

@Command("ping")
export class Ping {
  async run(context: CommandInteraction) {
    context.reply("Pong!");
  }
}
