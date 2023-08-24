import matter from "gray-matter";
import { readFileSync } from "node:fs"; 
import { globSync as glob } from "glob";
import { join } from "node:path"; 
import { Tag } from "../structs/Tag";

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

console.log(TAGS);
