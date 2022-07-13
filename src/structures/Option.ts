// Taken from https://github.com/Garlic-Team/gcommands/blob/next/src/lib/structures/Argument.ts

import { ApplicationCommandOptionType, ChannelType, LocaleString } from 'discord-api-types/v10';
import { AutocompleteContext } from './contexts/AutocompleteContext';

export interface OptionChoice {
	name: string;
	nameLocalizations?: Record<LocaleString, string>;
	value: string | number;
}

export interface OptionOptions {
	name: string;
	nameLocalizations?: Record<LocaleString, string>;
	description: string;
	descriptionLocalizations?: Record<LocaleString, string>;
	type: ApplicationCommandOptionType
	required?: boolean;
	choices?: OptionChoice[];
	options?: Array<Option | OptionOptions>;
	channelTypes?: ChannelType[];
	minValue?: number;
	maxValue?: number;
	minLength?: number;
	maxLength?: number;
	run?: (ctx: AutocompleteContext) => Response | Promise<Response>;
}

export class Option {
	public name: string;
	public nameLocalizations?: Record<LocaleString, string>;
	public description: string;
	public descriptionLocalizations?: Record<LocaleString, string>;
	public type: ApplicationCommandOptionType;
	public required?: boolean;
	public choices?: Array<OptionChoice>;
	public options?: Array<Option>;
	public channelTypes?: Array<ChannelType | keyof typeof ChannelType>;
	public minValue?: number;
	public maxValue?: number;
	public minLength?: number;
	public maxLength?: number;
	public run?: (ctx: AutocompleteContext) => Response | Promise<Response>;

    public constructor(options: OptionOptions) {
        this.name = options.name;
        this.nameLocalizations = options.nameLocalizations;
        this.description = options.description;
        this.descriptionLocalizations = options.descriptionLocalizations;
        this.type = options.type;
        this.required = options.required;
        this.choices = options.choices;
        this.options = options.options?.map(argument => {
            if (argument instanceof Option) return argument;
            else return new Option(argument);
        });
        this.channelTypes = options.channelTypes;
        this.minValue = options.minValue;
        this.maxValue = options.maxValue;
        this.minLength = options.minLength;
        this.maxLength = options.maxLength;
        this.run = options.run;
    }

	public toJSON(): Record<string, any> {
		if (
			this.type === ApplicationCommandOptionType.Subcommand ||
			this.type === ApplicationCommandOptionType.SubcommandGroup
		) {
			return {
				name: this.name,
				name_localizations: this.nameLocalizations,
				description: this.description,
				description_localizations: this.descriptionLocalizations,
				type: this.type,
				options: this.options?.map(option => option.toJSON()),
			};
		}

		return {
			name: this.name,
			name_localizations: this.nameLocalizations,
			description: this.description,
			description_localizations: this.descriptionLocalizations,
			type: this.type,
			required: this.required,
			choices: this.choices,
			channel_types: this.channelTypes,
			min_value: this.minValue,
			max_value: this.maxValue,
			min_length: this.minLength,
			max_length: this.maxLength,
			autocomplete: typeof this.run === 'function',
		};
	}
}