import Collection from '@discordjs/collection';
// @ts-expect-error Types :(
import tags from '../../files/tags.toml';

export interface Tag {
	keywords: string[];
	content: string;
}

const tagCache: Collection<string, Tag> = new Collection();

for (const [key, value] of Object.entries(tags)) {
    tagCache.set(key, value as unknown as Tag);
}

export const getTag = <T extends boolean>(name: string, more?: T): T extends true ? Tag[] : Tag => {
    if (more) {
        const tags = [...tagCache.filter(tag => tag.keywords.some(k => k.includes(name))).values()];
        return tags as T extends true ? Tag[] : Tag;
    } else {
        const tag = tagCache.get(name) || tagCache.find(tag => tag.keywords.some(k => k.includes(name)));
        return tag as T extends true ? Tag[] : Tag;
    }
}

export const findTags = (name: string) => {
    if (!name)
        return [
            ...tagCache.map((tag, name) => new Object({
                name: name.replaceAll('-', ''),
                value: name
            })).slice(0, 25)
        ];
    else {
        const tags = getTag(name, true);
        if (tags.length > 0)
            return tags.map(tag => new Object({
                name: tag.keywords[0].replaceAll('-', ''),
                value: tag.keywords[0]
            }));
        else return findTags(null);
    }
}