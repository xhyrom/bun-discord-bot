import { Hono } from 'hono';
import { bodyParse } from 'hono/body-parse';
import { Logger } from './utils/Logger';

// @ts-expect-error Types :(
import config from '../files/config.toml';
import loadCommands from './utils/loadCommands';
import { verifyKey } from './utils/verify';
import { APIPingInteraction, APIApplicationCommandInteraction, APIMessageComponentInteraction, InteractionType, InteractionResponseType, ApplicationCommandType, APIApplicationCommandAutocompleteInteraction, ApplicationCommandOptionType, APIApplicationCommandOption } from 'discord-api-types/v10';
import { CommandContext } from './structures/contexts/CommandContext';
import { Commands } from './managers/CommandManager';
import registerCommands from './utils/registerCommands';
import { Option, OptionOptions } from './structures/Option';
import { AutocompleteContext } from './structures/contexts/AutocompleteContext';

await loadCommands();
try {
  await registerCommands(config.client.token, config.client.id);
} catch(e) {
  console.log(e);
}

const app = new Hono();

app.post('/interaction', bodyParse(), async(c) => {
  const signature = c.req.headers.get('X-Signature-Ed25519');
  const timestamp = c.req.headers.get('X-Signature-Timestamp');
  if (!signature || !timestamp) return c.redirect('https://www.youtube.com/watch?v=FMhScnY0dME'); // fireship :D
  if (!await verifyKey(JSON.stringify(c.req.parsedBody), signature, timestamp, config.client.public_key)) return c.redirect('https://www.youtube.com/watch?v=FMhScnY0dME'); // fireship :D

  const interaction = c.req.parsedBody as unknown as APIPingInteraction | APIApplicationCommandInteraction | APIMessageComponentInteraction | APIApplicationCommandAutocompleteInteraction;

  if (interaction.type === InteractionType.Ping) {
    return new CommandContext(c).respond({
      type: InteractionResponseType.Pong
    });
  }

  if (interaction.type === InteractionType.ApplicationCommandAutocomplete && interaction.data.type === ApplicationCommandType.ChatInput) {
    const command = Commands.get(interaction.data.name);
    let options = command.options;
    const subCommandGroup = interaction.data.options.find(option => option.type === ApplicationCommandOptionType.SubcommandGroup)
    const subCommand = interaction.data.options.find(option => option.type === ApplicationCommandOptionType.Subcommand);

    // @ts-expect-error ?? find
    if (subCommandGroup) options = options.find(option => option.name === subCommandGroup.name)?.options;
    // @ts-expect-error ?? find
    if (subCommand) options = options.find(option => option.name === subCommand.name)?.options;

    // @ts-expect-error i dont want waste time
    const focused: APIApplicationCommandBasicOption = interaction.data.options.find(option => option.focused === true);
    // @ts-expect-error ?? find
    const option: Option | OptionOptions = options.find(option => option.name === focused.name);

    return option.run(new AutocompleteContext(
      c,
      option,
      focused.value
    ));
  }

  if (interaction.type === InteractionType.ApplicationCommand && interaction.data.type === ApplicationCommandType.ChatInput) {
    return Commands.get(interaction.data.name).run(new CommandContext(
      c,
      interaction.data.options,
      interaction.data.resolved
    ));
  }

  return new CommandContext(c).respond({
    type: InteractionResponseType.ChannelMessageWithSource,
    data: {
      content: 'Beep boop. Boop beep?'
    }
  })
})

await Bun.serve({
  port: config.server.port,
  fetch: app.fetch,
});

Logger.info('🚀 Server started at', config.server.port.toString());
Logger.debug(`🌍 http://localhost:${config.server.port}`);