import { Hono } from 'hono';
import { bodyParse } from 'hono/body-parse';
import { Logger } from './utils/Logger';

// @ts-expect-error Types :(
import config from '../files/config.toml';
import loadCommands from './utils/loadCommands';
import { verifyKey } from './utils/verify';
import { APIPingInteraction, APIApplicationCommandInteraction, APIMessageComponentInteraction, InteractionType, InteractionResponseType, ApplicationCommandType, APIApplicationCommandAutocompleteInteraction, ApplicationCommandOptionType } from 'discord-api-types/v10';
import { CommandContext } from './structures/contexts/CommandContext';
import { Commands } from './managers/CommandManager';
import registerCommands from './utils/registerCommands';
import { Option, OptionOptions } from './structures/Option';
import { AutocompleteContext } from './structures/contexts/AutocompleteContext';
import { deleteIssue, deletePullRequest, fetchIssues, fetchPullRequests, issues, setIssue, setPullRequest } from './utils/githubUtils';
import createHmac from 'create-hmac';

await fetchIssues();
await fetchPullRequests();
await loadCommands();
try {
  await registerCommands(config.client.token, config.client.id);
} catch(e) {
  console.log(e);
}

const app = new Hono();
app.get('*', (c) => c.redirect('https://www.youtube.com/watch?v=FMhScnY0dME')); // fireship :D

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
      focused.value,
      interaction.data.options as any
    ));
  }

  if (interaction.type === InteractionType.ApplicationCommand && interaction.data.type === ApplicationCommandType.ChatInput) {
    const commands = Commands.get(interaction.data.name);
    return await commands.run(new CommandContext(
      c,
      commands,
      interaction
    ));
  }

  return new CommandContext(c).respond({
    type: InteractionResponseType.ChannelMessageWithSource,
    data: {
      content: 'Beep boop. Boop beep?'
    }
  });
})

app.post('/github_webhook', bodyParse(), (c) => {
  if (
    !c.req.headers.get('User-Agent').startsWith('GitHub-Hookshot/') ||
    typeof c.req.parsedBody !== 'object'
  ) return c.redirect('https://www.youtube.com/watch?v=FMhScnY0dME'); // fireship :D

  const githubWebhooksSecret = new TextEncoder().encode(config.api.github_webhooks_secret);
  const sha256 = `sha256=${createHmac('sha256', githubWebhooksSecret).update(JSON.stringify(c.req.parsedBody)).digest('hex')}`;
  if (sha256 !== c.req.headers.get('X-Hub-Signature-256')) return c.redirect('https://www.youtube.com/watch?v=FMhScnY0dME'); // fireship :D

  const issueOrPr = c.req.parsedBody;
  if (issueOrPr.action !== 'deleted') {
    if (issueOrPr.issue) {
      console.log('issue');
      setIssue({
        id: issueOrPr.issue.number,
        repository: issueOrPr.issue.repository_url.replace('https://api.github.com/repos/', ''),
        title: issueOrPr.issue.title,
        number: issueOrPr.issue.number,
        state: issueOrPr.issue.state,
        created_at: new Date(issueOrPr.issue.created_at),
        closed_at: new Date(issueOrPr.issue.closed_at),
        html_url: issueOrPr.issue.html_url,
        user_login: issueOrPr.issue.user.login,
        user_html_url: issueOrPr.issue.user.html_url,
        type: '(ISSUE)',
      })
    }
    else {
      setPullRequest({
        id: issueOrPr.pull_request.number,
        repository: issueOrPr.pull_request.html_url.replace('https://github.com/', '').replace(`/pull/${issueOrPr.pull_request.number}`, ''),
        title: issueOrPr.pull_request.title,
        number: issueOrPr.pull_request.number,
        state: issueOrPr.pull_request.state,
        created_at: new Date(issueOrPr.pull_request.created_at),
        closed_at: new Date(issueOrPr.pull_request.closed_at),
        merged_at: new Date(issueOrPr.pull_request.merged_at),
        html_url: issueOrPr.pull_request.html_url,
        user_login: issueOrPr.pull_request.user.login,
        user_html_url: issueOrPr.pull_request.user.html_url,
        type: '(PR)',
      })
    }
  } else {
    if (issueOrPr.issue) deleteIssue(
      issueOrPr.issue.number, issueOrPr.issue.repository_url.replace('https://api.github.com/repos/', '')
    );
    else deletePullRequest(
      issueOrPr.pull_request.number,
      issueOrPr.pull_request.html_url
        .replace('https://github.com/', '')
        .replace(`/pull/${issueOrPr.pull_request.number}`, '')
    )
  }
  
  return c.json({
    message: 'OK'
  }, 200);
})

await Bun.serve({
  port: config.server.port,
  fetch: app.fetch,
});

Logger.info('🚀 Server started at', config.server.port.toString());
Logger.debug(`🌍 http://localhost:${config.server.port}`);