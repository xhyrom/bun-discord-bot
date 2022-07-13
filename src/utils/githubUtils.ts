// @ts-expect-error Types :(
import config from '../../files/config.toml';
// @ts-expect-error Types :(
import utilities from '../../files/utilities.toml';
import MiniSearch from 'minisearch';
import { Logger } from './Logger';
import { APIApplicationCommandOptionChoice } from 'discord-api-types/v10';

interface Issue {
    id: number;
    repository: string;
    title: string;
    number: number;
    state: 'open' | 'closed',
    created_at: Date;
    closed_at: Date | null;
    html_url: string;
    user_login: string;
    user_html_url: string;
    type: '(ISSUE)' | '(PR)';
}

interface PullRequest extends Issue {
    merged_at: Date | null;
}

export let issues: Issue[] = [];
export let pulls: PullRequest[] = [];

export const fetchIssues = async() => {
    for await (const repository of utilities.github.repositories) {
        let page = 1;
    
        while (true) {
            const res = await (await fetch(`https://api.github.com/repos/${repository}/issues?per_page=100&page=${page}&state=all`, {
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': 'bun-discord-bot',
                    'Authorization': `token ${config.api.github_personal_access_token}`
                }
            })).json() as any;
    
            for (const issue of res) {
                if ('pull_request' in issue) continue;

                issues.push({
                    id: issue.number,
                    repository: issue.repository_url.replace('https://api.github.com/repos/', ''),
                    title: issue.title,
                    number: issue.number,
                    state: issue.state,
                    created_at: new Date(issue.created_at),
                    closed_at: new Date(issue.closed_at),
                    html_url: issue.html_url,
                    user_login: issue.user.login,
                    user_html_url: issue.user.html_url,
                    type: '(ISSUE)'
                })
            }
    
            Logger.debug(`Fetching issues for ${repository} - ${issues.length} * ${page}`);
    
            page++;
            if (res.length === 0) {
                break;
            }
        }
    
        Logger.success(`Issues have been fetched for ${repository} - ${issues.length}`);
    }
}

export const fetchPullRequests = async() => {
    for await (const repository of utilities.github.repositories) {
        let page = 1;
        
        while (true) {
            const res = await (await fetch(`https://api.github.com/repos/${repository}/pulls?per_page=100&page=${page}&state=all`, {
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': 'bun-discord-bot',
                    'Authorization': `token ${config.api.github_personal_access_token}`
                }
            })).json() as any;

            for (const pull of res) {
                pulls.push({
                    id: pull.number,
                    repository: pull.html_url.replace('https://github.com/', '').replace(`/pull/${pull.number}`, ''),
                    title: pull.title,
                    number: pull.number,
                    state: pull.state,
                    created_at: new Date(pull.created_at),
                    closed_at: new Date(pull.closed_at),
                    merged_at: new Date(pull.merged_at),
                    html_url: pull.html_url,
                    user_login: pull.user.login,
                    user_html_url: pull.user.html_url,
                    type: '(PR)',
                })
            }

            Logger.debug(`Fetching pull requests for ${repository} - ${pulls.length} * ${page}`);

            page++;
            if (res.length === 0) {
                break;
            }
        }

        Logger.success(`Pull requests have been fetched for ${repository} - ${pulls.length}`);
    }
}

export const setIssue = (issue: Issue) => {
    const exists = issues.findIndex(i => i.number === issue.number && i.repository === issue.repository);
    if (exists >= 0) issues[exists] = issue;
    else issues.push(issue);
}

export const setPullRequest = (pull: PullRequest) => {
    const exists = pulls.findIndex(i => i.number === pull.number);
    if (exists >= 0) pulls[exists] = pull;
    else pulls.push(pull);
}

export const deleteIssue = (number: number, repository: string) => {
    issues = issues.filter(i => i.number === number && i.repository === repository);
}

export const deletePullRequest = (number: number, repository: string) => {
    pulls = pulls.filter(p => p.number === number && p.repository === repository);
}

export const search = (query: string, repository: string): APIApplicationCommandOptionChoice[] => {
    try {
        const pullsFiltered = pulls.filter(pull => pull.repository === repository);
        const issuesFiltered = issues.filter(issue => issue.repository === repository);
    
        if (!query) {
            const array = [].concat(pullsFiltered.slice(0, 13), issuesFiltered.slice(0, 12));
            return array.map((issueOrPr: Issue | PullRequest) => new Object({
                name: `${issueOrPr.type} ${issueOrPr.title.slice(0, 93)}`,
                value: issueOrPr.number.toString()
            })) as APIApplicationCommandOptionChoice[]
        }
    
        const array = [].concat(pullsFiltered, issuesFiltered);
    
        const searcher = new MiniSearch({
            fields: ['title', 'number', 'type'],
            storeFields: ['title', 'number', 'type'],
            searchOptions: {
                fuzzy: 3,
                processTerm: term => term.toLowerCase(),
            },
        });
    
        searcher.addAll(array);
    
        const result = searcher.search(query);
    
        return (result as unknown as Issue[] | PullRequest[]).slice(0, 25).map((issueOrPr: Issue | PullRequest) => new Object({
            name: `${issueOrPr.type} ${issueOrPr.title.slice(0, 93).replace(/[^a-z0-9 ]/gi, '')}`,
            value: issueOrPr.number.toString()
        })) as APIApplicationCommandOptionChoice[]
    } catch(e) {
        return [];
    }
}

export const getIssueOrPR = (number: number, repository: string): Issue | PullRequest => {
    return issues.find(issue => issue.number === number && issue.repository === repository) ||
        pulls.find(pull => pull.number === number && pull.repository === repository);
}