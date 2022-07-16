const files = await Bun.file('./files.json').text();
console.log(files);

export { };
