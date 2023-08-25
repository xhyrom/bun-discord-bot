import { defineCommand } from "../loaders/commands.ts";
import { Bubu } from "../structs/Client.ts";
import { InteractionCommandContext, MessageCommandContext } from "../structs/context/CommandContext.ts";

defineCommand({
  name: "ping",
  description: "pong",
  run: async(ctx: InteractionCommandContext) => {
    const message = await ctx.interaction.deferReply({
      ephemeral: true,
    });

    const restPing = message.createdTimestamp - ctx.interaction.createdTimestamp;

    ctx.interaction.editReply({
      content: `🏓 WebSocket: \`${Bubu.ws.ping}ms\` | Rest: \`${restPing}ms\``
    });
  },
  runMessage: async(ctx: MessageCommandContext) => {
    const message = await ctx.reply({
      content: "🏓...",
    });

    const restPing = message.createdTimestamp - ctx.message.createdTimestamp;

    message.edit({
      content: `🏓 WebSocket: \`${Bubu.ws.ping}ms\` | Rest: \`${restPing}ms\`` 
    });
  }
})
