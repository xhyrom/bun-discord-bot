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

export const BUN_EMOJIS = [
  "awesomebun:1136571782472683571",
  "beno:1152544141323010049",
  "bun:994093611065024512",
  "bunUwU:1152543655035412602",
  "bunana:1118962978088304741",
  "bundough:1152673360224993383",
  "bundows:1180836292657942598",
  "bunlove:1001784944068145213",
  "bunx:1151197324299739146",
  "buxmas:1180860721672757308",
  "grabbun:995824913418027118",
  "lickbun:1118962491653898311",
  "nomouth_bun:995824878227820687",
  "nostalgiabun:995824933236129912",
  "peekbun:995823659786711082",
  "rainbowbun:995824310860128326",
  "uwubun:995823895175233587",
  "bupple:1190690285852839976",
];
