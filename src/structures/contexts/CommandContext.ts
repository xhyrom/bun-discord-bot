import { APIApplicationCommandInteractionDataOption, APIChatInputApplicationCommandInteractionDataResolved, APIInteractionGuildMember, APIInteractionResponse, APIUser, InteractionResponseType } from 'discord-api-types/v10';
import { Context } from 'hono';

export class CommandContext {
    public context: Context;
    public user?: APIUser;
    public member?: APIInteractionGuildMember;
    public options?: APIApplicationCommandInteractionDataOption[];
    public resolved?: APIChatInputApplicationCommandInteractionDataResolved;
    
    public constructor(c: Context, member?: APIInteractionGuildMember, options?: APIApplicationCommandInteractionDataOption[], resolved?: APIChatInputApplicationCommandInteractionDataResolved) {
        this.context = c;
        this.user = member.user;
        this.member = member;
        this.options = options;
        this.resolved = resolved;
    }

    public respond(response: APIInteractionResponse | string) {
        if (typeof response === 'string') {
            return this.context.json({
                type: InteractionResponseType.ChannelMessageWithSource,
                data: {
                  content: response
                }
            });
        }

        return this.context.json(response);
    }
}