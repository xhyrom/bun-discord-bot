import { spawnSync } from "bun";

export const COMMIT_HASH = spawnSync({
  cmd: [ "git", "log", "--pretty=format:%h", "-n", "1" ]
}).stdout.toString();

export const PRODUCTION = process.env.NODE_ENV === "production";

export const MESSAGE_PREFIX = PRODUCTION ? "b" : "<>";


