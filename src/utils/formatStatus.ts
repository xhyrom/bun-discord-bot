export default (data: any) => {
    let operation = '';
    let timestamp = '';
    switch(data.state as 'open' | 'closed' | 'all') {
        case 'open':
            operation = 'opened';
            timestamp = `<t:${Math.floor(new Date(data.created_at).getTime() / 1000)}:R>`;
            break;
        case 'closed':
            operation = data?.pull_request?.merged_at ? 'merged' : 'closed';
            timestamp = data?.pull_request?.merged_at 
                ? `<t:${Math.floor(new Date(data.pull_request.merged_at).getTime() / 1000)}:R>`
                : `<t:${Math.floor(new Date(data.closed_at).getTime() / 1000)}:R>`;
            break;
    }

    return `${operation} ${timestamp}`;
}