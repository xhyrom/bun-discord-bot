import { info } from "@paperdave/logger";
import { Event } from "@lilybird/handlers";

export default {
  event: "ready",
  run: (client) => {
    info(`Logged in as ${client.user.username} (${client.user.id})`);
  },
} satisfies Event<"ready">;
