const files = await Bun.file('./files.json').text();
if (!files.includes('files/tags.toml')) process.exit(0);

// @ts-expect-error types
const tags = await import('./files/tags.toml');
console.log(tags);

export { };
