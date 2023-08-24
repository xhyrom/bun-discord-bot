import { ChatInputCommandInteraction, InteractionReplyOptions, Message, MessageCreateOptions, MessagePayload, InteractionResponse, Channel, User, GuildMember, APIInteractionGuildMember } from "discord.js";
import type { Command } from "../Command.ts";

export interface CommandContext<T extends boolean> {
  command: Command;
  isInteraction: T;

  user: User;
  member: GuildMember | APIInteractionGuildMember;
  channel: Channel;

  reply(options: string | MessagePayload | (T extends true ? InteractionReplyOptions : MessageCreateOptions)): (T extends true ? Promise<Message | InteractionResponse> : Promise<Message>);
}

export class InteractionCommandContext implements CommandContext<true> {
  public command: Command;
  public interaction: ChatInputCommandInteraction;

  public constructor(command: Command, interaction: ChatInputCommandInteraction) {
    this.command = command;
    this.interaction = interaction;
  }

  get isInteraction(): true {
      return true;
  }

  get user() {
    return this.interaction.user;
  }

  get member() {
    return this.interaction.member;
  }

  get channel() {
    return this.interaction.channel;
  }

  get resolved() {
    return this.interaction.options.resolved;
  }

  public reply(options: string | MessagePayload | InteractionReplyOptions): Promise<Message | InteractionResponse> {
      return this.interaction.reply(options);
  }
}

export class MessageCommandContext implements CommandContext<false> {
  public command: Command;
  public message: Message;

  public constructor(command: Command, message: Message, args: string[]) {
    this.command = command;
    this.message = message;

    // change args structure to application commands like
  }

  get isInteraction(): false {
    return false;
  }

  get user() {
    return this.message.author;
  }

  get member() {
    return this.message.member;
  }

  get channel() {
    return this.message.channel;
  }

  public reply(options: string | MessagePayload | MessageCreateOptions): Promise<Message<boolean>> {
      return this.channel.send(options);
  }
}
