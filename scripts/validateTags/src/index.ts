interface Tag {
	keywords: string[];
	content: string;
}

const githubToken = process.env['github-token'];
const commitSha = process.env['commit-sha'];
const pullRequestNumber = process.env['pr-number'];

const codeBlockRegex = /(`{1,3}).+?\1/gs;
const urlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&\/\/=]*)/gi;
const files = await Bun.file('./files.json').text();
if (!files.includes('files/tags.toml')) process.exit(0);

const errors = [];

let tags;
try {
    // @ts-expect-error types
    tags = (await import('../../../files/tags.toml')).default;

    requestGithub(
        `issues/${pullRequestNumber}/labels`,
        {
            labels: ['tags']
        }
    );
} catch(e) {
    tags = [];
    errors.push(e.message);
}

for (const [key, value] of Object.entries(tags)) {
    const tag = value as Tag;

    if (!tag?.keywords || tag.keywords.length === 0) errors.push(`**[${key}]:** Tag must have keywords`);
    if (tag?.keywords?.[0] !== key) errors.push(`**[${key}]:** First keyword of tag is not the same as the tag name`);
    if (!tag.content) errors.push(`**[${key}]:** Tag must have content`);

    if (tag.content) {
        const cleanedContent = tag.content.replaceAll('+++', '```').replace(codeBlockRegex, '');
        for (const url of cleanedContent.match(urlRegex) || []) {
            const firstChar = tag.content.split(url)[0].slice(-1);
            const lastChar = tag.content.split(url)[1].slice(0, 1);
            if (
                firstChar !== '<' ||
                lastChar !== '>'
            ) errors.push(`**[${key}]:** Link must be wrapped in <>`);
        }
    }

    if (tag.keywords) {
        const keywords = [...new Set(tag.keywords)];
        if (keywords.length !== tag.keywords.length) errors.push(`**[${key}]:** Keywords must be unique`);
    }
}

if (errors.length === 0) {
    requestGithub(
        `pulls/${pullRequestNumber}/reviews`,
        {
            commit_id: commitSha,
            event: 'APPROVE',
        }
    );

    requestGithub(
        `pulls/${pullRequestNumber}/requested_reviewers`,
        {
            reviewers: ['xHyroM']
        }
    );

    requestGithub(
        `issues/${pullRequestNumber}/labels/waiting`,
        {},
        'DELETE'
    );

    requestGithub(
        `issues/${pullRequestNumber}/labels`,
        {
            labels: ['ready']
        }
    );
} else {
    requestGithub(
        `pulls/${pullRequestNumber}/reviews`,
        {
            commit_id: commitSha,
            body: '### Please fix the following problems:\n' + errors.join('\n'),
            event: 'REQUEST_CHANGES',
        }
    );

    requestGithub(
        `issues/${pullRequestNumber}/labels`,
        {
            labels: ['waiting']
        }
    );
}

function requestGithub(url: string, body: any, method?: 'POST' | 'DELETE') {
    fetch(`https://api.github.com/repos/xHyroM/bun-discord-bot/${url}`, {
        method: method || 'POST',
        headers: {
            'Accept': 'application/vnd.github+json',
            'Authorization': `token ${githubToken}`
        },
        body: JSON.stringify(body)
    })
}

export { };
