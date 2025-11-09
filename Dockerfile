FROM oven/bun:latest

COPY package.json ./
COPY src ./src
COPY data ./data

RUN bun install

ENTRYPOINT [ "bun", "start" ]
