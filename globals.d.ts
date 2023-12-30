declare module "bun" {
  interface Env {
    DISCORD_BOT_TOKEN: string;
    BUN_ONLY_CHANNEL_ID: string;
    MESSAGE_PREFIX: string;
  }
}
