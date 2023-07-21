import { success } from "@paperdave/logger";
import { Listener } from "../decorators/Listener";
import { ArgsOf } from "../utils";

export class Ready {
  @Listener("ready")
  onReady([client]: ArgsOf<"ready">) {
    success(`Logged in as ${client.user?.tag}`);
  }
}
