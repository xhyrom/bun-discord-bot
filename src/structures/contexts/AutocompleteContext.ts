import { APIApplicationCommandOptionChoice, InteractionResponseType } from 'discord-api-types/v10';
import { Context } from 'hono';
import { Option, OptionOptions } from '../Option';

export class AutocompleteContext {
    public context: Context;
    public option?: Option | OptionOptions;
    public value?: string;
    
    public constructor(c: Context, option: Option | OptionOptions, value: string) {
        this.context = c;
        this.option = option;
        this.value = value;
    }

    public respond(response: APIApplicationCommandOptionChoice[]) {
        return this.context.json({
            type: InteractionResponseType.ApplicationCommandAutocompleteResult,
            data: {
                choices: response
            }
        });
    }
}