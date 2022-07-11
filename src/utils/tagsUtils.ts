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

export const getTag = (name: string) => {
    const tag = tagCache.get(name) || tagCache.find(tag => tag.keywords.some(k => k.includes(name)));
    return tag;
}

export const findTags = (name: string) => {
    if (!name)
        return [
            ...tagCache.map((tag, name) => new Object({
                name,
                value: name
            })).slice(0, 25)
        ];
    else {
        const tag = getTag(name);
        if (tag)
            return [
                {
                    name: tag.keywords[0],
                    value: tag.keywords[0],
                }
            ];
        else return findTags(null);
    }
}