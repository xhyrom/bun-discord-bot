import type { Tag } from "../../src/structs/Tag.js";
import * as matter from "gray-matter";
import { join, dirname } from "node:path";
import { readFileSync } from "node:fs";
import { Glob } from "bun";

const githubToken = process.env["github-token"];
const commitSha = process.env["commit-sha"];
const pullRequestNumber = process.env["pr-number"];

const urlRegex =
  /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&\/\/=]*)/gi;

// Check if files/tags.toml was changed
const files = (await Bun.file(
  join(import.meta.dir, "files.json")
).json()) as string[];
if (!files.some((f) => f.includes("tags"))) process.exit(0);

const errors: string[] = [];

const tags: Tag[] = [];
const tagPaths = Array.from(
  new Glob(
    join(import.meta.dir, "..", "..", "..", "data", "tags", "*.md")
  ).scanSync()
);
for (const tagPath of tagPaths) {
  const content = readFileSync(tagPath);
  const frontMatter = matter(content);

  tags.push({
    name: dirname(tagPath),
    question: frontMatter.data.question,
    keywords: frontMatter.data.keywords,
    answer: frontMatter.content,
    category_ids: frontMatter.data.category_ids ?? null,
    channel_ids: frontMatter.data.channel_ids ?? null,
  });
}

try {
  await requestGithub(`issues/${pullRequestNumber}/labels`, {
    labels: ["tags"],
  });
} catch (e) {
  errors.push(e.message);
}

for (const tag of tags) {
  const key = tag.name;

  if (!tag?.keywords || tag.keywords.length === 0)
    errors.push(`**[${key}]:** Tag must have keywords`);
  if (tag?.keywords?.[0] !== key)
    errors.push(
      `**[${key}]:** First keyword of tag is not the same as the tag name`
    );
  if (!tag.answer) errors.push(`**[${key}]:** Tag must have content`);

  if (tag.answer) {
    for (const url of tag.answer.match(urlRegex) || []) {
      const firstChar = tag.answer.split(url)[0].slice(-1);
      const lastChar = tag.answer.split(url)[1].slice(0, 1);
      if (firstChar !== "<" || lastChar !== ">")
        errors.push(`**[${key}]:** Link must be wrapped in <>`);
    }
  }

  if (tag.keywords) {
    const keywords = [...new Set(tag.keywords)];
    if (keywords.length !== tag.keywords.length)
      errors.push(`**[${key}]:** Keywords must be unique`);
  }
}

if (errors.length === 0) {
  await requestGithub(`pulls/${pullRequestNumber}/reviews`, {
    commit_id: commitSha,
    event: "APPROVE",
  });

  await requestGithub(`pulls/${pullRequestNumber}/requested_reviewers`, {
    reviewers: ["xHyroM"],
  });

  await requestGithub(
    `issues/${pullRequestNumber}/labels/waiting`,
    {},
    "DELETE"
  );

  await requestGithub(`issues/${pullRequestNumber}/labels`, {
    labels: ["ready"],
  });
} else {
  await requestGithub(`pulls/${pullRequestNumber}/reviews`, {
    commit_id: commitSha,
    body: "### Please fix the following problems:\n" + errors.join("\n"),
    event: "REQUEST_CHANGES",
  });

  await requestGithub(`issues/${pullRequestNumber}/labels`, {
    labels: ["waiting"],
  });
}

async function requestGithub(
  url: string,
  body: any,
  method?: "POST" | "DELETE"
) {
  await fetch(`https://api.github.com/repos/xHyroM/bun-discord-bot/${url}`, {
    method: method || "POST",
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `token ${githubToken}`,
    },
    body: JSON.stringify(body),
  });
}

export {};
