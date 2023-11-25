declare module "bun" {
    interface Env {
        DISCORD_BOT_TOKEN: string,
        MESSAGE_PREFIX: string,
        BUN_ONLY_CHANNEL_ID: string
    }
}