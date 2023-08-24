import { APIApplicationCommandAttachmentOption, APIApplicationCommandBasicOption, APIApplicationCommandBooleanOption, APIApplicationCommandChannelOption, APIApplicationCommandIntegerOption, APIApplicationCommandMentionableOption, APIApplicationCommandNumberOption, APIApplicationCommandOptionChoice, APIApplicationCommandRoleOption, APIApplicationCommandStringOption, APIApplicationCommandSubcommandGroupOption, APIApplicationCommandSubcommandOption, APIApplicationCommandUserOption, ApplicationCommandOptionType, LocalizationMap, SharedNameAndDescription, SlashCommandAttachmentOption, SlashCommandBooleanOption, SlashCommandChannelOption, SlashCommandIntegerOption, SlashCommandMentionableOption, SlashCommandNumberOption, SlashCommandRoleOption, SlashCommandStringOption, SlashCommandUserOption } from "discord.js";
import { AutocompleteContext } from "./context/AutocompleteContext";
import { CommandContext } from "./context/CommandContext";

export type Option = APIApplicationCommandAttachmentOption |
  APIApplicationCommandBooleanOption |
  APIApplicationCommandChannelOption |
  APIApplicationCommandIntegerOption |
  APIApplicationCommandMentionableOption |
  APIApplicationCommandNumberOption |
  APIApplicationCommandRoleOption |
  APIApplicationCommandUserOption |
  APIApplicationCommandSubcommandOption |
  APIApplicationCommandSubcommandGroupOption |
  StringOption;

export interface StringOption {
  name: string;
  name_localizations?: LocalizationMap;
  description: string;
  description_localizations?: LocalizationMap;
  min_length?: number;
  max_length?: number;
  required?: boolean;
  type: ApplicationCommandOptionType.String;
  autocomplete?: boolean;
  choices?: APIApplicationCommandOptionChoice[];
  run: (interaction: AutocompleteContext) => any;
}

export interface Command {
  name: string;
  description: string;
  options: Option[];
  run?: (
    context: CommandContext<true>
  ) => any;
  runMessage?: (
    context: CommandContext<false>
  ) => any;
}
