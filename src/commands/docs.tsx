import { ApplicationCommand, StringOption, UserOption } from "lilybird/jsx";
import algoliasearch from "algoliasearch";
import { SlashCommand } from "lilybird";

// @ts-expect-error It is callable, but algolia for some reason has a namespace with the same name
const algoliaClient = algoliasearch("2527C13E0N", "4efc87205e1fce4a1f267cadcab42cb2");
const algoliaIndex = algoliaClient.initIndex("bun");

export default {
    post: "GLOBAL",
    data: (
        <ApplicationCommand name="docs" description="Search at docs">
            <StringOption name="query" description="Select query" required />
            <UserOption name="target" description="User to mention" />
        </ApplicationCommand>
    ),
    autocomplete: async (interaction) => {
        const query = interaction.data.options.getString("query");
        const result = await algoliaIndex.search(query, {
            hitsPerPage: 25,
        });

        return interaction.respond(
            result.hits.map((hit: any) => {
                const name = getHitName(hit);

                return {
                    name: name.full.length > 100 ? name.full.slice(0, 100) : name.full,
                    value: name.name.length > 100 ? name.name.slice(0, 100) : name.name,
                }
            })
        );
    },
    run: async (interaction) => {
        await interaction.deferReply();

        const query = interaction.data.options.getString("query");
        const target = interaction.data.options.getUser("target");

        const result = await algoliaIndex.search(query, {
            hitsPerPage: 1,
        });

        const hit = result.hits[0];
        const url = hit.url;
        const name = getHitName(hit);
        const snippetContent = hit._snippetResult?.content?.value?.replace(/<[^>]+>/g, "");
        const notice = hit.content?.replace(/\r/g, "");

        const content = [
            target ? `*Suggestion for <@${target}>:*\n` : "",
            `[*${name.full}*](<${url}>)`,
            snippetContent ? snippetContent : "",
            notice ? notice.split("\n").map((s: any) => `> ${s}`).join("\n") : ""
        ].join("\n")

        await interaction.editReply({
            content,
            // allowedMentions: {
            //     parse: ["users"],
            // }
        });
    }
} satisfies SlashCommand

function getHitName(hit: any) {
    const type = hit.hierarchy.lvl0 === "Documentation" ? "📖" : "🗺️";
    const hierarchy = Object.values(hit.hierarchy).filter(v => v);
    hierarchy.shift();

    const name = hierarchy.join(" > ");

    return {
        full: `${type} ${name}`,
        name: name,
        emoji: type,
    }
}
