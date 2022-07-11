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

export const getTag = (name: string, more?: boolean) => {
    if (more) {
        const tags = [...tagCache.filter(tag => tag.keywords.some(k => k.includes(name))).values()];
        return tags;
    } else {
        const tag = tagCache.get(name) || tagCache.find(tag => tag.keywords.some(k => k.includes(name)));
        return tag;
    }
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
        const tags: Tag[] = getTag(name, true) as Tag[];
        if (tags.length > 0)
            return tags.map(tag => new Object({
                name: tag.keywords[0],
                value: tag.keywords[0]
            }));
        else return findTags(null);
    }
}