import { spawnSync } from "bun";

export const COMMIT_HASH = spawnSync({
  cmd: [ "git", "log", "--pretty=format:%h", "-n", "1" ]
}).stdout.toString();
