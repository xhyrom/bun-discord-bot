import { info } from "@paperdave/logger";
import { Client, ClientOptions } from "discord.js";
import { redactToken } from "./utils";

export class Bient extends Client {
  public static instance: Bient;

  constructor(options: ClientOptions) {
    super(options);

    Bient.instance = this;
  }

  public async load(): Promise<void> {
    info("Loading listeners and commands...");

    const start = performance.now();

    await this.loadListeners();
    await this.loadCommands();

    const end = performance.now();

    info(`Loaded listeners and commands in ${end - start}ms`);
  }

  public async loadCommands(): Promise<void> {
    await import("./commands/Ping.ts");
  }

  public async loadListeners(): Promise<void> {
    await import("./listeners/Ready.ts");
  }

  public login(): Promise<string> {
    info(`Logging in using ${redactToken(process.env.BOT_TOKEN)}`);
    return super.login(process.env.BOT_TOKEN);
  }
}
