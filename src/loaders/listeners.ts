import { ClientEvents, Events } from "discord.js";
import "../listeners/ready.ts";

interface Listener<E extends keyof ClientEvents> {
  event: E;
  run: (
    ...args: ClientEvents[E]
  ) => any;
}

export const LISTENERS: Listener<keyof ClientEvents>[] = [];

export function defineListener<T extends Listener<keyof ClientEvents>>(listener: T) {
  LISTENERS.push(listener);
}
