import WolframAlphaAPI from "@wolfram-alpha/wolfram-alpha-api";
import { dependencies } from "../package.json";
import { sliceIfStartsWith } from "./util.ts";
import { main, spawnSync } from "bun";

export const COMMIT_HASH = spawnSync({
  cmd: ["git", "log", "--pretty=format:%h", "-n", "1"],
}).stdout.toString();

export const LILYBIRD_VERSION = sliceIfStartsWith(dependencies.lilybird, "^");
export const LILYBIRD_HANDLERS_VERSION = sliceIfStartsWith(
  dependencies["@lilybird/handlers"],
  "^",
);
export const LILYBIRD_JSX_VERSION = sliceIfStartsWith(
  dependencies["@lilybird/jsx"],
  "^",
);
export const LILYBIRD_TRANSFORMERS_VERSION = sliceIfStartsWith(
  dependencies["@lilybird/transformers"],
  "^",
);

export const PRODUCTION = process.env.NODE_ENV === "production";

export const BUN_EMOJIS = [
  { name: "awesomebun", id: "1136571782472683571" },
  { name: "beno", id: "1152544141323010049" },
  { name: "benode", id: "1210663269837316197" },
  { name: "bolice", id: "1274390797994688542" },
  { name: "bun", id: "994093611065024512" },
  { name: "bunana", id: "1118962978088304741" },
  { name: "buncat", id: "1274985769400012800" },
  { name: "bundough", id: "1152673360224993383" },
  { name: "bundows", id: "1180836292657942598" },
  { name: "bunlove", id: "1001784944068145213" },
  { name: "bunolice", id: "1274280067735748608" },
  { name: "bunparty", id: "1210663548963921960" },
  { name: "bunsob", id: "1254862523857895537" },
  { name: "bunsplode", id: "1210663666454634586" },
  { name: "bunUwU", id: "1152543655035412602" },
  { name: "bunx", id: "1151197324299739146" },
  { name: "buxmas", id: "1180860721672757308" },
  { name: "grabbun", id: "995824913418027118" },
  { name: "lickbun", id: "1118962491653898311" },
  { name: "nomouth_bun", id: "995824878227820687" },
  { name: "nostalgiabun", id: "995824933236129912" },
  { name: "octobun", id: "1210663393480941598" },
  { name: "peekbun", id: "995823659786711082" },
  { name: "rainbowbun", id: "995824310860128326" },
  { name: "uwubun", id: "995823895175233587" },
  { name: "ziggybun", id: "1274994335590518824" },
  { name: "gigabun", id: "1369049575834255521" },
  { name: "bupple", id: "1190690285852839976" },
  { name: "bunsalute", id: "1356099199313383586" },
  { name: "bundroid", id: "1196556081166565519" },
  { name: "bunerd", id: "1372332559790375043" },
  { name: "bunflush", id: "1379914605740167268" },
  { name: "bundowspet", id: "1222860633377341461", animated: true },
  { name: "bunpet", id: "1172808445737574591", animated: true },
  { name: "bunsegfault", id: "1175208306533486632", animated: true },
];
export const BUN_STICKER = "994093337080516698";

export const MDN_API = "https://developer.mozilla.org";
export const MDN_DISCORD_EMOJI = "mdn:1236028636826566758";

export const wolframApiClient = WolframAlphaAPI(process.env.WOLFRAM_ALPHA);
