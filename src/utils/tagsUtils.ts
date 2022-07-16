import Collection from '@discordjs/collection';
import { APIApplicationCommandOptionChoice } from 'discord-api-types/v10';
// @ts-expect-error Types :(
import tags from '../../files/tags.toml';

export interface Tag {
	keywords: string[];
	content: string;
}

const tagCache: Collection<string, Tag> = new Collection();

for (const [key, value] of Object.entries(tags)) {
    (value as Tag).content = (value as Tag).content.replaceAll('+', '`');
    tagCache.set(key, value as unknown as Tag);
}

export const getTag = <T extends boolean>(name: string, more?: T): T extends true ? APIApplicationCommandOptionChoice[] : Tag => {
    if (more) {
        const exactKeywords: APIApplicationCommandOptionChoice[] = [];
		const keywordMatches: APIApplicationCommandOptionChoice[] = [];
		const contentMatches: APIApplicationCommandOptionChoice[] = [];
        const query = name.toLowerCase();

        for (const [tagName, tag] of tagCache.entries()) {
            const exactKeyword = tag.keywords.find((t) => t.toLowerCase() === query);
			const includesKeyword = tag.keywords.find((t) => t.toLowerCase().includes(query));
			const contentMatch = tag.content.toLowerCase().includes(query);

            if (exactKeyword) {
                exactKeywords.push({
                    name: `✅ ${tagName.replaceAll('-', ' ')}`,
                    value: tagName
                });
            } else if (includesKeyword) {
                keywordMatches.push({
                    name: `🔑 ${tagName.replaceAll('-', ' ')}`,
                    value: tagName
                });
            } else if (contentMatch) {
                contentMatches.push({
                    name: `📄 ${tagName.replaceAll('-', ' ')}`,
                    value: tagName
                });
            }
        }

        const tags = [...exactKeywords, ...keywordMatches, ...contentMatches];
        return tags as T extends true ? APIApplicationCommandOptionChoice[] : Tag;
    } else {
        const tag = tagCache.get(name) || tagCache.find(tag => tag.keywords.some(k => k.includes(name)));
        return tag as T extends true ? APIApplicationCommandOptionChoice[] : Tag;
    }
}

export const findTags = (name: string) => {
    if (!name)
        return [
            ...tagCache.map((tag, name) => new Object({
                name: `🚀 ${name.replaceAll('-', ' ')}`,
                value: name
            })).slice(0, 25)
        ];
    else {
        const tags = getTag(name, true);
        if (tags.length > 0) return tags;
        else return findTags(null);
    }
}