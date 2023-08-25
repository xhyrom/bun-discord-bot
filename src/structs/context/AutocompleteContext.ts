import { ApplicationCommandOptionChoiceData, AutocompleteInteraction } from "discord.js";
import { Command, Option } from "../Command.ts";

export class AutocompleteContext {
  public option: Option;
  public command: Command;
  public interaction: AutocompleteInteraction;

  public constructor(option: Option, command: Command, interaction: AutocompleteInteraction) {
    this.option = option;
    this.command = command;
    this.interaction = interaction;
  }

  get channel() {
    return this.interaction.channel;
  }

  get user() {
    return this.interaction.user;
  }

  get member() {
    return this.interaction.member;
  }

  get options() {
    return this.interaction.options;
  }

  public respond(options: ApplicationCommandOptionChoiceData[]) {
    return this.interaction.respond(options);
  }
}
