import { SlashCommandBooleanOption, SlashCommandStringOption, time } from "discord.js";
import { defineCommand } from "../loaders/commands.ts";
import { AutocompleteContext } from "../structs/context/AutocompleteContext.ts";
import { InteractionCommandContext } from "../structs/context/CommandContext.ts";
import { safeSlice, silently } from "../util.ts";

type State = "open" | "closed_as_completed" | "closed_as_not_planned" | "closed" | "merged" | "draft" | "all";
type StateEmoji = "🔴" | "🟠" | "🟢" | "⚫️" | "⚪️" | "🟣" | "📝";
type Type = "issues" | "pull_requests" | "both";

interface Item {
  html_url: string;
  number: number;
  title: string;
  user: {
    html_url: string;
    login: string;
  }
  emoji: {
    state: StateEmoji;
    type: string;
  };
  created_at: Date | null;
  closed_at: Date | null;
  pull_request?: {
    merged_at: Date | null;
  }
}

defineCommand({
  name: "github",
  description: "Query an issue, pull request or direct link to issue, pull request",
  options: [
    {
      ...new SlashCommandStringOption()
          .setName("query")
          .setDescription("Issue/Pull request number or name")
          .setRequired(true)
          .setAutocomplete(true)
          .setMaxLength(100),
      run: async(ctx: AutocompleteContext) => {
        const query = ctx.options.getString("query");
        const state: State = ctx.options.getString("state") as State || "all";
        const type: Type = ctx.options.getString("type") as Type || "both";

        const response = await search(query, state, type, 25);

        await silently(ctx.respond(response.map(r => ({
          name: safeSlice<string>(`${r.emoji.type} ${r.emoji.state} #${r.number} | ${r.title}`, 100),
          value: r.number.toString()
        }))));
      }
    },
    {
      ...new SlashCommandStringOption()
          .setName("state")
          .setDescription("Issue or Pull request state")
          .setRequired(false)
          .addChoices(
            {
              name: "🔴🟠 Open",
              value: "open"
            },
            {
              name: "🟢 Closed as completed",
              value: "closed_as_completed"
            },
            {
              name: "⚪️ Closed as not planned",
              value: "closed_as_not_planned"
            },
            {
              name: "⚫️ Closed",
              value: "closed"
            },
            {
              name: "🟣 Merged",
              value: "merged"
            },
            {
              name: "📝 Draft",
              value: "draft",
            },
            {
              name: "🌍 All",
              value: "all",
            }
          )
    },
    {
      ...new SlashCommandStringOption()
          .setName("type")
          .setDescription("Issue or Pull Requests")
          .setRequired(false)
          .addChoices(
            {
              name: "🐛 Issues",
              value: "issues"
            },
            {
              name: "🔨 Pull Requests",
              value: "pull_requests"
            },
            {
              name: "🌍 Both",
              value: "both"
            }
          )
    },
    {
      ...new SlashCommandBooleanOption()
          .setName("hide")
          .setDescription("Show this message only for you")
          .setRequired(false)
    }
  ],
  run: async(ctx: InteractionCommandContext) => {
    const hide = ctx.interaction.options.getBoolean("hide") ?? false;

    await ctx.interaction.deferReply({
      ephemeral: hide
    });

    const query = ctx.interaction.options.getString("query");
    const state: State = ctx.interaction.options.getString("state") as State || "all";
    const type: Type = ctx.interaction.options.getString("type") as Type || "both";

    const result = (await search(query, state, type))[0];
    if (!result) {
      ctx.interaction.editReply({
        content: `❌ Couldn't find issue or pull request \`${query}\``
      });
      return;
    }

    ctx.interaction.editReply({
      content: [
        `${result.emoji.type} ${result.emoji.state} [#${result.number} in oven-sh/bun](<${result.html_url}>) by [${result.user.login}](<${result.user.html_url}>) ${stateToText(result)} ${stateToTimestamp(result)}`,
        result.title
      ].join("\n")
    })
  }
});

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
      timestamp = item.created_at;
      break;
    }
    case "🟢":
    case "⚪️":
    case "⚫️": {
      timestamp = item.closed_at;
      break;
    }
    case "🟣": {
      timestamp = item.pull_request.merged_at;
      break;
    }
  }

  return `<t:${Math.round(timestamp.getTime() / 1000)}:R>`;
}

async function search(query: string, state: State, type: Type, length = 1): Promise<Item[]> {
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
      actualQuery += "state:closed reason:completed "
      break;
    }
    case "closed_as_not_planned": {
      actualQuery += "state:closed reason:\"not planned\" ";
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
      actualQuery += "type:issue "
      break;
    }
    case "pull_requests": {
      actualQuery += "type:pr "
      break;
    }
  }

  // append user query + remove all tags
  actualQuery += query.replace(/\S+:\S+/g, "").trim();

  const response = await fetch(`https://api.github.com/search/issues?q=${encodeURIComponent(actualQuery)}&per_page=${length}`, {
    headers: {
      "Authorization": `Bearer ${process.env.GITHUB_TOKEN}`,
      "Accept": "application/vnd.github+json"
    }
  });

  const body = await response.json();
  const items = body.items;

  return items.map(item => {
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
        type: item.pull_request ? "🔨" : "🐛"
      },
      created_at: new Date(item.created_at),
      closed_at: item.closed_at ? new Date(item.cloased_at) : null
    }

    if (item.pull_request) {
      base.pull_request = {};
      base.pull_request.merged_at = item.pull_request.merged_at ? new Date(item.pull_request.merged_at) : null;
    }

    return base;
  });
}
