declare module "bun" {
  interface Env {
    DISCORD_BOT_TOKEN: string;
    BUN_ONLY_CHANNEL_ID: string;
    MESSAGE_PREFIX: string;
    WOLFRAM_ALPHA: string;
  }
}

declare module "@wolfram-alpha/wolfram-alpha-api" {
  export default function WolframAlphaAPI(appId: string): WolframAPI;

  interface WolframAPI {
    getFull(input: string): Promise<WolframResponse>;
  }

  interface WolframResponse {
    pods: WolframPod[];
  }

  interface WolframPod {
    id: string;
    subpods: WolframSubpod[];
  }

  interface WolframSubpod {
    plaintext: string;
  }
}
