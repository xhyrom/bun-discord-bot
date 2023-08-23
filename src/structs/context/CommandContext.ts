import { ChatInputCommandInteraction } from "discord.js";
import type { Command } from "../Command.ts";

export class CommandContext {
  public command: Command;
  public interaction: ChatInputCommandInteraction;

  public constructor(command: Command, interaction: ChatInputCommandInteraction) {
    this.command = command;
    this.interaction = interaction;
  }

  get user() {
    return this.interaction.user;
  }

  get member() {
    return this.interaction.member;
  }

  get resolved() {
    return this.interaction.options.resolved;
  }
}
