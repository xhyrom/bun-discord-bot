export const githubIssuesAndPullRequests = (owner: string, repository: string) =>
    new RegExp(`https?:\\\/\\\/github\\\.com\\\/${owner}\\\/${repository}\\\/(?:issues\\\/\\\d+|pull\\\/\d+)`, 'gm');