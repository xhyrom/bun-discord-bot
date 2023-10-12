import { spawnSync } from "bun";

export const COMMIT_HASH = spawnSync({
  cmd: [ "git", "log", "--pretty=format:%h", "-n", "1" ]
}).stdout.toString();

export const PRODUCTION = process.env.NODE_ENV === "production";

export const MESSAGE_PREFIX = PRODUCTION ? "b" : "<>";

export const BUN_ONLY_CHANNEL_ID = "1161157663867027476"
