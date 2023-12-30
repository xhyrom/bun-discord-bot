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
  { name: "awesomebun", id: "1136571782472683571" },
  { name: "beno", id: "1152544141323010049" },
  { name: "bun", id: "994093611065024512" },
  { name: "bunUwU", id: "1152543655035412602" },
  { name: "bunana", id: "1118962978088304741" },
  { name: "bundough", id: "1152673360224993383" },
  { name: "bundows", id: "1180836292657942598" },
  { name: "bunlove", id: "1001784944068145213" },
  { name: "bunx", id: "1151197324299739146" },
  { name: "buxmas", id: "1180860721672757308" },
  { name: "grabbun", id: "995824913418027118" },
  { name: "lickbun", id: "1118962491653898311" },
  { name: "nomouth_bun", id: "995824878227820687" },
  { name: "nostalgiabun", id: "995824933236129912" },
  { name: "peekbun", id: "995823659786711082" },
  { name: "rainbowbun", id: "995824310860128326" },
  { name: "uwubun", id: "995823895175233587" },
  { name: "bupple", id: "1190690285852839976" },
];
