import "./version.ts";
import "./docs.ts";

import { registerCommands } from "../loaders/commands.ts";
await registerCommands();
