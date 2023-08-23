import type { ClientEvents } from "discord.js";

interface Listener<E extends keyof ClientEvents> {
  event: E;
  once?: boolean;
  run: (
    ...args: ClientEvents[E]
  ) => any;
}

export const LISTENERS: Listener<keyof ClientEvents>[] = [];

export function defineListener<T extends Listener<keyof ClientEvents>>(listener: T) {
  LISTENERS.push(listener);
}
