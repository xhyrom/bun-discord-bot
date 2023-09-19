import type { ClientEvents } from "discord.js";
import { Bubu } from "../structs/Client.ts";
import { Listener } from "../structs/Listener.ts";

export const LISTENERS: Listener<keyof ClientEvents>[] = [];

export function defineListener<T extends Listener<keyof ClientEvents>>(listener: T) {
  LISTENERS.push(listener);

  Bubu[listener.once ? "once" : "on"](
    listener.event as keyof ClientEvents,
    listener.run.bind(this)
  );
}
