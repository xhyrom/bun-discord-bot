import { APIApplicationCommandInteractionDataStringOption, ApplicationCommandOptionType, InteractionResponseType, MessageFlags } from 'discord-api-types/v10';
import { Command } from '../structures/Command';
// @ts-expect-error Types :(
import utilities from '../../files/utilities.toml';
// @ts-expect-error Types :(
import config from '../../files/config.toml';
import { githubIssuesAndPullRequests } from '../utils/regexes';
import isNumeric from '../utils/isNumeric';
import Collection from '@discordjs/collection';
import formatStatus from '../utils/formatStatus';
import { CommandContext } from '../structures/contexts/CommandContext';

const cooldowns: Collection<string, number> = new Collection();
const invalidIssue = (ctx: CommandContext, query: string) => {
    return ctx.editResponse(
        `\`❌\` Invalid issue or pull request \`${query}\`. You can check [github search syntax](https://docs.github.com/en/search-github/searching-on-github/searching-issues-and-pull-requests)`
    );
}

new Command({
    name: 'github',
    description: 'Query an issue, pull request or direct link to Github Issue or PR',
    options: [
        {
            name: 'query',
            description: 'Issue numer/name, PR number/name or direct link to Github Issue or PR',
            type: ApplicationCommandOptionType.String,
            required: true
        },
        {
            name: 'repository',
            description: 'Project repository (default oven-sh/bun)',
            type: ApplicationCommandOptionType.String,
            required: false,
            choices: [
                ...utilities.github.repositories.map(repository => new Object({
                    name: repository.split('/')[1],
                    value: repository
                }))
            ]
        }
    ],
    run: async(ctx) => {
        if (cooldowns?.has(ctx.user.id) && cooldowns.get(ctx.user.id) > Date.now()) {
            return ctx.respond({
                type: InteractionResponseType.ChannelMessageWithSource,
                data: {
                    content: `⚠️ You are in cooldown, please wait <t:${Math.floor(cooldowns.get(ctx.user.id) / 1000)}:R>.`,
                    flags: MessageFlags.Ephemeral,
                }
            });
        } else {
            ctx.command.runWithoutReturn(ctx)
            return ctx.respond({
                type: InteractionResponseType.DeferredChannelMessageWithSource
            })
        }
    },
    runWithoutReturn: async(ctx) => {
        let query: string = (ctx.options[0] as APIApplicationCommandInteractionDataStringOption).value;
        const repository: string = (ctx.options?.[1] as APIApplicationCommandInteractionDataStringOption)?.value || 'oven-sh/bun';

        const repositorySplit = repository.split('/');
        const repositoryOwner = repositorySplit[0];
        const repositoryName = repositorySplit[1];

        const isIssueOrPR = githubIssuesAndPullRequests(repositoryOwner, repositoryName).test(query);
        const isIssueOrPRNumber = isNumeric(query);

        cooldowns.set(ctx.user.id, Date.now() + 30000);
        if (!isIssueOrPR && !isIssueOrPRNumber) {
            const res = await fetch(`https://api.github.com/search/issues?q=${encodeURIComponent(query)}${encodeURIComponent(' repo:oven-sh/bun')}`);

            const data: any = await res.json();
            if (data.message || data?.items?.length === 0) return invalidIssue(ctx, query);
            
            query = data.items[0].number; 
        }

        const issueUrl = `https://api.github.com/repos/${repositoryOwner}/${repositoryName}/issues/${isIssueOrPR ? query.split('/issues/')[1] : query}`;
        
        const res = await fetch(issueUrl, {
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'bun-discord-bot',
                'Authorization': config.api.github_personal_access_token
            }
        });

        const data: any = await res.json();
        if (data.message) return invalidIssue(ctx, query);

        return ctx.editResponse([
            `[#${data.number} ${repositoryOwner}/${repositoryName}](<${data.html_url}>) by [${data.user.login}](<${data.user.html_url}>) ${formatStatus(data)}`,
            data.title
        ].join('\n'));
    }
})