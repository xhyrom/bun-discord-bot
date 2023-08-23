import { AutocompleteInteraction } from "discord.js";

export class AutocompleteContext {
  public option: Option;
  public interaction: AutocompleteInteraction;

  public constructor(option: Option, interaction: AutocompleteInteraction) {
    this.option = option;
    this.interaction = interaction;
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
}
