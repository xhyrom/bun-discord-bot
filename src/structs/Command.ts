import { SharedNameAndDescription, SlashCommandAttachmentOption, SlashCommandBooleanOption, SlashCommandChannelOption, SlashCommandIntegerOption, SlashCommandMentionableOption, SlashCommandNumberOption, SlashCommandRoleOption, SlashCommandStringOption, SlashCommandUserOption } from "discord.js";
import { AutocompleteContext } from "./context/AutocompleteContext";
import { CommandContext } from "./context/CommandContext";

export type Option = SlashCommandAttachmentOption | SlashCommandBooleanOption | SlashCommandChannelOption | SlashCommandIntegerOption | SlashCommandMentionableOption | SlashCommandNumberOption | SlashCommandRoleOption | SlashCommandUserOption | SharedNameAndDescription | StringOption;

interface StringOption extends SlashCommandStringOption {
  run: (option: Option, interaction: AutocompleteContext) => void;
}

export interface Command {
  name: string;
  options: Option[];
  run: (
    context: CommandContext<true>
  ) => any;
  runMessage: (
    context: CommandContext<false>
  ) => any;
}
