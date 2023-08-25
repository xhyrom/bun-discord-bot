import matter from "gray-matter";
import { readFileSync } from "node:fs"; 
import { globSync as glob } from "glob";
import { join } from "node:path"; 
import { Tag } from "../structs/Tag";
import { APIApplicationCommandOptionChoice, BaseGuildTextChannel, GuildTextBasedChannel, TextBasedChannel } from "discord.js";
import { safeSlice } from "../util";

const tags = glob(join(__dirname, "..", "..", "data", "tags", "*.md"));

export const TAGS: Tag[] = [];

for (const tag of tags) {
  const content = readFileSync(tag);
  const frontMatter = matter(content);

  TAGS.push({
    question: frontMatter.data.question,
    keywords: frontMatter.data.keywords,
    answer: frontMatter.content,
    category_ids: frontMatter.data.category_ids ?? null,
    channel_ids: frontMatter.data.channel_ids ?? null
  });
}

function getAvailableTags(channel: GuildTextBasedChannel) {
  return TAGS.filter(t => {
    const channelIds = t.channel_ids;
    const categoryIds = t.category_ids;

    if (!channelIds && !categoryIds) return true;
    if (channelIds && channelIds.includes(channel.id)) return true;
    if (categoryIds && categoryIds.includes(channel.parentId)) return true;

    return false;
  });

}

export function getTags(channel: GuildTextBasedChannel, length: number): APIApplicationCommandOptionChoice[] {
  const availableTags = getAvailableTags(channel);
  return safeSlice(
    availableTags.map((tag) => (
      {
        name: `🚀 ${tag.question}`,
        value: tag.question
      }
    )),
  length);
}

export function searchTag<T extends boolean>(channel: GuildTextBasedChannel, providedQuery: string, multiple?: T): T extends true ? APIApplicationCommandOptionChoice[] : Tag {
  const availableTags = getAvailableTags(channel);
  const query = providedQuery?.toLowerCase()?.replace(/-/g, " ");
  
  if (!multiple) {
    const exactKeyword = availableTags.find(tag => tag.keywords.find((k) => k.toLowerCase() === query));
    const keywordMatch = availableTags.find(tag => tag.keywords.find((k) => k.toLowerCase().includes(query)));
    const questionMatch = availableTags.find(tag => tag.question.toLowerCase().includes(query));
    const answerMatch = availableTags.find(tag => tag.answer.toLowerCase().includes(query));

    const tag = exactKeyword ?? questionMatch ?? keywordMatch ?? answerMatch;
    return tag as T extends true ? APIApplicationCommandOptionChoice[] : Tag;
  }

  const exactKeywords: APIApplicationCommandOptionChoice[] = [];
  const keywordMatches: APIApplicationCommandOptionChoice[] = [];
  const questionMatches: APIApplicationCommandOptionChoice[] = [];
  const answerMatches: APIApplicationCommandOptionChoice[] = [];

  for (const tag of availableTags) {
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
