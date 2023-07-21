import type { ClientEvents } from "discord.js";

export type ArgsOf<K extends keyof ClientEvents> = ClientEvents[K];

export const redactToken = (token: string): string => {
  return token
    .split(".")
    .map((part, index) => {
      if (index === 0) return part;
      return "*".repeat(part.length);
    })
    .join(".");
};
