type Level = 'INFO' | 'SUCCESS' | 'WARN' | 'ERROR' | 'DEBUG'

export class Logger extends null {
    public static info(...messages: any[]) {
        this.log('INFO', messages);
    }

    public static success(...messages: any[]) {
        this.log('SUCCESS', messages);
    }

    public static warn(...messages: any[]) {
        this.log('WARN', messages);
    }

    public static error(...messages: any[]) {
        this.log('ERROR', messages);
    }

    public static debug(...messages: any[]) {
        this.log('DEBUG', messages);
    }

    private static log(level: Level, messages: any[]) {
        const date = new Date();

        let color = '';
        switch (level) {
            case 'INFO': 
                color = '\x1b[36m';
                break;
            case 'SUCCESS':
                color = '\u001b[32m';
                break;
            case 'WARN': 
                color = '\x1b[93m';
                break;
            case 'ERROR': 
                color = '\x1b[91m';
                break;
            default: 
                color = '\x1b[2m';
        }

        console.log(`${color}[${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}/${level}]\x1b[0m`, ...messages);
    }
}