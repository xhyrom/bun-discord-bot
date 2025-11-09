FROM oven/bun:latest

RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y git

COPY package.json ./
COPY tsconfig.json ./
COPY src ./src
COPY data ./data

RUN bun install

ENTRYPOINT [ "bun", "src/index.ts" ]
