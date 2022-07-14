// @ts-expect-error Types :(
import config from '../../files/config.toml';
// @ts-expect-error Types :(
import utilities from '../../files/utilities.toml';
import MiniSearch from 'minisearch';
import { Logger } from './Logger';
import { APIApplicationCommandOptionChoice } from 'discord-api-types/v10';
import { Database } from 'bun:sqlite';
import { discordChoicesRegex } from './regexes';

interface Issue {
    id: number;
    repository: string;
    title: string;
    number: number;
    state: 'open' | 'closed',
    created_at: string;
    closed_at: string | null;
    html_url: string;
    user_login: string;
    user_html_url: string;
    type: '(IS)' | '(PR)';
}

interface PullRequest extends Issue {
    merged_at: string | null;
}

export const db = new Database('./files/database.sqlite');
await db.exec('DROP TABLE IF EXISTS issuesandprs');
await db.exec('CREATE TABLE issuesandprs (id INTEGER PRIMARY KEY, repository TEXT, title TEXT, number INTEGER, state TEXT, created_at TEXT, closed_at TEXT, merged_at TEXT, html_url TEXT, user_login TEXT, user_html_url TEXT, type TEXT)');

const addToDb = db.prepare(
    'INSERT INTO issuesandprs (repository, title, number, state, created_at, closed_at, merged_at, html_url, user_login, user_html_url, type) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
);

export let issues: number = 0;
export let pulls: number = 0;

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

                // @ts-expect-error it works
                await addToDb.run([
                    issue.repository_url.replace('https://api.github.com/repos/', ''),
                    issue.title,
                    issue.number,
                    issue.state,
                    issue.created_at,
                    issue.closed_at,
                    null,
                    issue.html_url,
                    issue.user.login,
                    issue.user.html_url,
                    '(IS)'
                ]);
                issues++;
            }
    
            Logger.debug(`Fetching issues for ${repository} - ${issues} * ${page}`);
    
            page++;
            if (res.length === 0) {
                break;
            }
        }
    
        Logger.success(`Issues have been fetched for ${repository} - ${issues}`);
    }

    issues = null;
    Object.freeze(issues);
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
                // @ts-expect-error it works
                await addToDb.run([
                    pull.html_url.replace('https://github.com/', '').replace(`/pull/${pull.number}`, ''),
                    pull.title,
                    pull.number,
                    pull.state,
                    pull.created_at,
                    pull.closed_at,
                    pull.merged_at,
                    pull.html_url,
                    pull.user.login,
                    pull.user.html_url,
                    '(PR)'
                ]);
                pulls++;
            }

            Logger.debug(`Fetching pull requests for ${repository} - ${pulls} * ${page}`);

            page++;
            if (res.length === 0) {
                break;
            }
        }

        Logger.success(`Pull requests have been fetched for ${repository} - ${pulls}`);
    }

    pulls = null;
    Object.freeze(pulls);
}

export const setIssue = async(issue: Issue) => {
    const exists = await db.prepare(`SELECT * FROM issuesandprs WHERE number = ${issue.number} AND repository = '${issue.repository}'`).get();
    if (typeof exists == 'object') {
        db.exec(`UPDATE issuesandprs SET state = '${issue.state}', closed_at = '${issue.closed_at}', title = '${issue.title}' WHERE number = ${issue.number} AND repository = '${issue.repository}'`);
    } else {
        // @ts-expect-error
        addToDb.run([
            issue.repository.replace('https://api.github.com/repos/', ''),
            issue.title,
            issue.number,
            issue.state,
            issue.created_at,
            issue.closed_at,
            null,
            issue.html_url,
            issue.user_login,
            issue.user_html_url,
            '(IS)'
        ]);
    }
}

export const setPullRequest = async(pull: PullRequest) => {
    const exists = await db.prepare(`SELECT * FROM issuesandprs WHERE number = ${pull.number} AND repository = '${pull.repository}'`).get();
    if (typeof exists == 'object') {
        db.exec(`UPDATE issuesandprs SET state = '${pull.state}', closed_at = '${pull.closed_at}', merged_at = '${pull.merged_at}', title = '${pull.title}' WHERE number = ${pull.number} AND repository = '${pull.repository}'`);
    } else {
        // @ts-expect-error
        addToDb.run([
            pull.repository.replace('https://api.github.com/repos/', ''),
            pull.title,
            pull.number,
            pull.state,
            pull.created_at,
            pull.closed_at,
            pull.merged_at,
            pull.html_url,
            pull.user_login,
            pull.user_html_url,
            '(IS)'
        ]);
    }
}

export const deleteIssueOrPR = (number: number, repository: string) => {
    db.exec(`DELETE FROM issuesandprs WHERE repository = '${repository}' AND number = ${number}`);
}

export const search = async(query: string, repository: string): Promise<APIApplicationCommandOptionChoice[]> => {
    try {
        const arrayFiltered = await db.prepare(`SELECT * FROM issuesandprs WHERE repository = '${repository}'`).all();
    
        if (!query) {
            const array = arrayFiltered.slice(0, 25);
            return array.map((issueOrPr: Issue | PullRequest) => new Object({
                name: `${issueOrPr.type} ${formatEmojiStatus(issueOrPr)} ${issueOrPr.title.slice(0, 93).replace(discordChoicesRegex, '')}`,
                value: issueOrPr.number.toString()
            })) as APIApplicationCommandOptionChoice[]
        }
    
        const searcher = new MiniSearch({
            fields: query.startsWith('#') ? ['number'] : ['title'],
            storeFields: ['title', 'number', 'type', 'state', 'merged_at'],
            searchOptions: {
                fuzzy: 3,
                processTerm: term => term.toLowerCase(),
            },
        });
    
        searcher.addAll(arrayFiltered);
    
        const result = searcher.search(query);
    
        return (result as unknown as Issue[] | PullRequest[]).slice(0, 25).map((issueOrPr: Issue | PullRequest) => new Object({
            name: `${issueOrPr.type} ${formatEmojiStatus(issueOrPr)} ${issueOrPr.title.slice(0, 93).replace(discordChoicesRegex, '')}`,
            value: issueOrPr.number.toString()
        })) as APIApplicationCommandOptionChoice[]
    } catch(e) {
        return [];
    }
}

export const getIssueOrPR = async(number: number, repository: string): Promise<Issue | PullRequest> => {
    const issueOrPR = await db.prepare(`SELECT * FROM issuesandprs WHERE repository = '${repository}' AND number = ${number}`).get();
    return issueOrPR;
}

export const formatStatus = (data: Issue | PullRequest) => {
    let operation = '';
    let timestamp = '';
    switch(data.state as 'open' | 'closed' | 'all') {
        case 'open':
            operation = 'opened';
            timestamp = `<t:${Math.floor(new Date(data.created_at).getTime() / 1000)}:R>`;
            break;
        case 'closed':
            operation = (data as PullRequest).merged_at ? 'merged' : 'closed';
            timestamp = (data as PullRequest).merged_at 
                ? `<t:${Math.floor(new Date((data as PullRequest).merged_at).getTime() / 1000)}:R>`
                : `<t:${Math.floor(new Date(data.closed_at).getTime() / 1000)}:R>`;
            break;
    }

    return `${operation} ${timestamp}`;
}

export const formatEmojiStatus = (data: Issue | PullRequest) => {
    let emoji = '';
    switch(data.state as 'open' | 'closed' | 'all') {
        case 'open':
            emoji = '🟢';
            break;
        case 'closed':
            emoji = '🔴';
            break;
    }

    if (data.type === '(PR)' && (data as PullRequest).merged_at) emoji = '🟣';

    return emoji;
}