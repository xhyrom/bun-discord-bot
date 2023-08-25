import "./version.ts";
import "./docs.ts";
import "./tag.ts";

import { registerCommands } from "../loaders/commands.ts";
await registerCommands();
