import {
  ApplicationCommand as JSXApplicationCommand,
  BooleanOption,
  CommandOptions,
  StringOption,
} from "@lilybird/jsx";
import { ApplicationCommand } from "@lilybird/handlers";
import { safeSlice, silently } from "../util.ts";

type State =
  | "open"
  | "closed_as_completed"
  | "closed_as_not_planned"
  | "closed"
  | "merged"
  | "draft"
  | "all";
type StateEmoji = "🔴" | "🟠" | "🟢" | "⚫️" | "⚪️" | "🟣" | "📝";
type Type = "issues" | "pull_requests" | "both";

interface Item {
  html_url: string;
  number: number;
  title: string;
  user: {
    html_url: string;
    login: string;
  };
  emoji: {
    state: StateEmoji;
    type: string;
  };
  created_at: Date | null;
  closed_at: Date | null;
  pull_request?: {
    merged_at: Date | null;
  };
}

export default {
  post: "GLOBAL",
  data: (
    <JSXApplicationCommand
      name="github"
      description="Query an issue, pull request or direct link to issue, pull request"
    >
      <StringOption
        name="query"
        description="Issue/Pull request number or name"
        autocomplete
        required
        max_length={100}
      />
      <StringOption name="state" description="Issue or Pull request state">
        <CommandOptions name="🔴🟠 Open" value="open" />
        <CommandOptions
          name="🟢 Closed as completed"
          value="closed_as_completed"
        />
        <CommandOptions
          name="⚪️ Closed as not planned"
          value="closed_as_not_planned"
        />
        <CommandOptions name="⚫️ Closed" value="closed" />
        <CommandOptions name="🟣 Merged" value="merged" />
        <CommandOptions name="📝 Draft" value="draft" />
        <CommandOptions name="🌍 All" value="all" />
      </StringOption>
      <StringOption name="type" description="Issue/Pull request number or name">
        <CommandOptions name="🐛 Issues" value="issues" />
        <CommandOptions name="🔨 Pull Requests" value="pull_requests" />
        <CommandOptions name="🌍 Both" value="both" />
      </StringOption>
      <BooleanOption name="hide" description="Show this message only for you" />
    </JSXApplicationCommand>
  ),
  run: async (interaction) => {
    const hide = interaction.data.getBoolean("hide") ?? false;

    await interaction.deferReply(hide);

    const query = interaction.data.getString("query", true);
    const state: State =
      (interaction.data.getString("state") as State) || "all";
    const type: Type = (interaction.data.getString("type") as Type) || "both";

    const result = (await search(query, state, type))[0];
    if (!result) {
      interaction.editReply({
        content: `❌ Couldn't find issue or pull request \`${query}\``,
      });
      return;
    }

    interaction.editReply({
      content: [
        `${result.emoji.type} ${result.emoji.state} [#${
          result.number
        } in oven-sh/bun](<${result.html_url}>) by [${result.user.login}](<${
          result.user.html_url
        }>) ${stateToText(result)} ${stateToTimestamp(result)}`,
        result.title,
      ].join("\n"),
    });
  },

  autocomplete: async (interaction) => {
    const query = interaction.data.getFocused<string>().value;
    const state: State =
      (interaction.data.getString("state") as State) || "all";
    const type: Type = (interaction.data.getString("type") as Type) || "both";

    const response = await search(query, state, type, 25);

    await silently(
      interaction.showChoices(
        response.map((r) => ({
          name: safeSlice<string>(
            `${r.emoji.type} ${r.emoji.state} #${r.number} | ${r.title}`,
            100
          ),
          value: r.number.toString(),
        }))
      )
    );
  },
} satisfies ApplicationCommand;

function stateToText(item: Item) {
  switch (item.emoji.state) {
    case "🔴":
    case "🟠":
    case "📝": {
      return "opened";
    }
    case "🟢": {
      return "closed as completed";
    }
    case "⚪️": {
      return "closed as not planned";
    }
    case "⚫️": {
      return "closed";
    }
    case "🟣": {
      return "merged";
    }
  }
}

function stateToTimestamp(item: Item) {
  let timestamp: Date;

  switch (item.emoji.state) {
    case "🔴":
    case "🟠":
    case "📝": {
      timestamp = item.created_at as Date;
      break;
    }
    case "🟢":
    case "⚪️":
    case "⚫️": {
      timestamp = item.closed_at as Date;
      break;
    }
    case "🟣": {
      timestamp = item.pull_request?.merged_at as Date;
      break;
    }
  }

  return `<t:${Math.round(timestamp.getTime() / 1000)}:R>`;
}

async function search(
  query: string,
  state: State,
  type: Type,
  length = 1
): Promise<Item[]> {
  let actualQuery = "repo:oven-sh/bun ";

  switch (state) {
    case "open": {
      actualQuery += "state:open ";
      break;
    }
    case "closed": {
      actualQuery += "state:closed ";
      break;
    }
    case "closed_as_completed": {
      actualQuery += "state:closed reason:completed ";
      break;
    }
    case "closed_as_not_planned": {
      actualQuery += 'state:closed reason:"not planned" ';
      break;
    }
    case "merged": {
      actualQuery += "is:merged ";
      break;
    }
    case "draft": {
      actualQuery += "draft:true ";
      break;
    }
  }

  switch (type) {
    case "issues": {
      actualQuery += "type:issue ";
      break;
    }
    case "pull_requests": {
      actualQuery += "type:pr ";
      break;
    }
  }

  // append user query + remove all tags
  actualQuery += query.replace(/\S+:\S+/g, "").trim();

  const response = await fetch(
    `https://api.github.com/search/issues?q=${encodeURIComponent(
      actualQuery
    )}&per_page=${length}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        Accept: "application/vnd.github+json",
      },
    }
  );

  const body = await response.json();
  const items = body.items;

  return items.map((item: any) => {
    let state = "";
    if (item.state === "closed") {
      if (item.pull_request) {
        state = item.pull_request.merged_at ? "🟣" : "⚫️";
      } else {
        state = item.state_reason === "completed" ? "🟢" : "⚪️";
      }
    } else {
      if (item.pull_request) {
        state = item.draft ? "📝" : "🟠";
      } else {
        state = "🔴";
      }
    }

    const base = {
      ...item,
      emoji: {
        state: state,
        type: item.pull_request ? "🔨" : "🐛",
      },
      created_at: new Date(item.created_at),
      closed_at: item.closed_at ? new Date(item.cloased_at) : null,
    };

    if (item.pull_request) {
      base.pull_request = {};
      base.pull_request.merged_at = item.pull_request.merged_at
        ? new Date(item.pull_request.merged_at)
        : null;
    }

    return base;
  });
}
