import type { ClientEvents } from "discord.js";

export interface Listener<E extends keyof ClientEvents> {
  event: E;
  once?: boolean;
  run: (
    ...args: ClientEvents[E]
  ) => any;
}

