import { APIApplicationCommandInteractionDataStringOption, ApplicationCommandOptionType, InteractionResponseType, MessageFlags } from 'discord-api-types/v10';
import { Command } from '../structures/Command';
// @ts-expect-error Types :(
import utilities from '../../files/utilities.toml';
import { CommandContext } from '../structures/contexts/CommandContext';
import { getIssueOrPR, search, formatStatus, formatEmojiStatus, IssueState, IssueType } from '../utils/githubUtils';

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
            required: true,
            run: async(ctx) => {
                return ctx.respond(
                    await search(
                        ctx.value,
                        (ctx.options.find(o => o.name === 'repository'))?.value as string || 'oven-sh/bun',
                        (ctx.options.find(o => o.name === 'state')?.value as string || 'all') as IssueState,
                        (ctx.options.find(o => o.name === 'type')?.value as string || '(IS|PR)') as IssueType,
                    )
                );
            }
        },
        {
            name: 'state',
            description: 'Issue or PR state',
            type: ApplicationCommandOptionType.String,
            required: false,
            choices: [
                {
                    name: 'open',
                    value: 'open',
                },
                {
                    name: 'closed',
                    value: 'closed',
                },
                {
                    name: 'merged',
                    value: 'merged',
                },
                {
                    name: 'all (default)',
                    value: 'all',
                }
            ]
        },
        {
            name: 'type',
            description: 'Issues or PRs',
            type: ApplicationCommandOptionType.String,
            required: false,
            choices: [
                {
                    name: 'Issues',
                    value: '(IS)',
                },
                {
                    name: 'Pull Requests',
                    value: '(PR)',
                },
                {
                    name: 'Both',
                    value: '(IS|PR)',
                }
            ]
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
        },
    ],
    run: async(ctx) => {
        ctx.command.runEditResponse(ctx)
        return ctx.respond({
            type: InteractionResponseType.DeferredChannelMessageWithSource
        })
    },
    runEditResponse: async(ctx) => {
        let query: string = (ctx.options[0] as APIApplicationCommandInteractionDataStringOption).value;
        const repository: string = (ctx.options.find(o => o.name === 'repository') as APIApplicationCommandInteractionDataStringOption)?.value || 'oven-sh/bun';
        const state: IssueState = ((ctx.options.find(o => o.name === 'state') as APIApplicationCommandInteractionDataStringOption)?.value || 'all') as IssueState;
        const type: IssueType = ((ctx.options.find(o => o.name === 'type') as APIApplicationCommandInteractionDataStringOption)?.value || '(IS|PR)') as IssueType;

        const repositorySplit = repository.split('/');
        const repositoryOwner = repositorySplit[0];
        const repositoryName = repositorySplit[1];

        let issueOrPR = await getIssueOrPR(parseInt(query), repository, state, type);
        if (!issueOrPR) {
            const res = await fetch(`https://api.github.com/search/issues?q=${encodeURIComponent(query)}${encodeURIComponent(' repo:oven-sh/bun')}`);

            const data: any = await res.json();
            if (data.message || data?.items?.length === 0) return invalidIssue(ctx, query);
            
            const item = data.items[0];
            issueOrPR = {
                id: item.number,
                repository: item.repository_url.replace('https://api.github.com/repos/', ''),
                title: item.title,
                number: item.number,
                state: item.state,
                created_at: item.created_at,
                closed_at: item.closed_at,
                html_url: item.html_url,
                user_login: item.user.login,
                user_html_url: item.user.html_url,
                type: item.pull_request ? '(PR)' : '(IS)',
            };
        }

        return ctx.editResponse([
            `${formatEmojiStatus(issueOrPR)} [#${issueOrPR.number} ${issueOrPR.title.replace(/\[\]/g, '').slice(0, 1500)} ${repositoryOwner}/${repositoryName}](<${issueOrPR.html_url}>) by [${issueOrPR.user_login}](<${issueOrPR.user_html_url}>) ${formatStatus(issueOrPR)}`,
            issueOrPR.title
        ].join('\n'));
    }
})