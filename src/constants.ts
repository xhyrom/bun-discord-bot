import { spawnSync } from "bun";
import { dependencies } from "../package.json";

export const COMMIT_HASH = spawnSync({
  cmd: ["git", "log", "--pretty=format:%h", "-n", "1"],
}).stdout.toString();

export const LILYBIRD_VERSION = dependencies.lilybird.slice(1);
export const LILYBIRD_JSX_VERSION = dependencies["@lilybird/jsx"].slice(1);
export const LILYBIRD_HANDLERS_VERSION =
  dependencies["@lilybird/handlers"].slice(1);

export const PRODUCTION = process.env.NODE_ENV === "production";
