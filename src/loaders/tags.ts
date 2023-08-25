import matter from "gray-matter";
import { readFileSync } from "node:fs"; 
import { globSync as glob } from "glob";
import { join } from "node:path"; 
import { Tag } from "../structs/Tag";
import { APIApplicationCommandOptionChoice } from "discord.js";
import { safeSlice } from "../util";

const tags = glob(join(__dirname, "..", "..", "data", "tags", "*.md"));

export const TAGS: Tag[] = [];

for (const tag of tags) {
  const content = readFileSync(tag);
  const frontMatter = matter(content);

  TAGS.push({
    question: frontMatter.data.question,
    keywords: frontMatter.data.keywords,
    answer: frontMatter.content
  });
}

export function getTags(length: number): APIApplicationCommandOptionChoice[] {
  return safeSlice(
    TAGS.map((tag) => (
      {
        name: `🚀 ${tag.question}`,
        value: tag.question
      }
    )),
  length);
}

export function searchTag<T extends boolean>(providedQuery: string, multiple?: T): T extends true ? APIApplicationCommandOptionChoice[] : Tag {
  const query = providedQuery?.toLowerCase()?.replace(/-/g, " ");
  
  if (!multiple) {
    const exactKeyword = TAGS.find(tag => tag.keywords.find((k) => k.toLowerCase() === query));
    const keywordMatch = TAGS.find(tag => tag.keywords.find((k) => k.toLowerCase().includes(query)));
    const questionMatch = TAGS.find(tag => tag.question.toLowerCase().includes(query));
    const answerMatch = TAGS.find(tag => tag.answer.toLowerCase().includes(query));

    const tag = exactKeyword ?? questionMatch ?? keywordMatch ?? answerMatch;
    return tag as T extends true ? APIApplicationCommandOptionChoice[] : Tag;
  }

  const exactKeywords: APIApplicationCommandOptionChoice[] = [];
  const keywordMatches: APIApplicationCommandOptionChoice[] = [];
  const questionMatches: APIApplicationCommandOptionChoice[] = [];
  const answerMatches: APIApplicationCommandOptionChoice[] = [];

  for (const tag of TAGS) {
    const exactKeyword = tag.keywords.find((t) => t.toLowerCase() === query); 
    const includesKeyword = tag.keywords.find((t) => t.toLowerCase().includes(query));
    const questionMatch = tag.question.toLowerCase().includes(query);
    const answerMatch = tag.answer.toLowerCase().includes(query);

    if (exactKeyword) {
      exactKeywords.push({
        name: `✅ ${tag.question}`,
        value: tag.question
      });
    } else if (includesKeyword) {
      keywordMatches.push({
        name: `🔑 ${tag.question}`,
        value: tag.question,
      })
    } else if(questionMatch) {
      questionMatches.push({
        name: `❓ ${tag.question}`,
        value: tag.question
      })
    } else if (answerMatch) {
      answerMatches.push({
        name: `📄 ${tag.question}`,
        value: tag.question
      })
    }
  }

  const tags = [...exactKeywords, ...questionMatches, ...keywordMatches, ...answerMatches];
  return tags as T extends true ? APIApplicationCommandOptionChoice[] : Tag;
}
