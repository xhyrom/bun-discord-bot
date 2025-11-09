import { Address, Remap, ResolvedCommit } from "bun-tracestrings";
import {
  basename,
  escmd,
  escmdcode,
} from "node_modules/bun-tracestrings/lib/util";

export function formatMarkdown(
  remap: Remap,
  internal?: { source: string },
): string {
  return [
    `Bun v${remap.version} (${treeURLMD(remap.commit)}) on ${remap.os} ${remap.arch} [${remap.command}]`,
    "",
    remap.message.replace(/^panic: /, "**panic**: "),
    "",
    ...addrsToMarkdown(remap.commit.oid, remap.addresses).map((l) => `- ${l}`),
    "",
    remap.features.length > 0
      ? `Features: ${remap.features.map(escmd).join(", ")}`
      : "",
    "",
    ...(internal
      ? [
          `[(see trace)](<https://bun.report/${internal.source.replace(/^\/+/, "")}/view>)`,
        ]
      : []),
  ]
    .join("\n")
    .trim()
    .replace(/\n\n+/g, "\n\n");
}

function treeURLMD(commit: ResolvedCommit) {
  if (commit.pr) {
    return `[#${commit.pr.number}](https://github.com/oven-sh/bun/pull/${commit.pr.number})`;
  }

  return `[\`${commit.oid.slice(0, 7)}\`](<https://github.com/oven-sh/bun/tree/${commit.oid}>)`;
}

export function addrsToMarkdown(commit: string, addrs: Address[]): string[] {
  let unknown_in_a_row = 0;
  let pushUnknown = () => {
    if (unknown_in_a_row > 0) {
      lines.push(`*${unknown_in_a_row} unknown/js code*`);
      unknown_in_a_row = 0;
    }
  };

  const lines: string[] = [];

  for (const addr of addrs) {
    if (addr.object === "?") {
      unknown_in_a_row++;
      continue;
    }

    pushUnknown();

    if (addr.remapped) {
      lines.push(
        `${
          addr.src
            ? `[\`${escmdcode(basename(addr.src.file))}:${addr.src.line}\`](<https://github.com/oven-sh/bun/blob/${commit}/${addr.src.file}#L${addr.src.line}>): `
            : ""
        }\`${escmdcode(addr.function)}\`${addr.object !== "bun" ? ` in ${addr.object}` : ""}`,
      );
    } else {
      lines.push(
        `??? at \`0x${addr.address.toString(16)}\` ${addr.object !== "bun" ? `in ${addr.object}` : ""}`,
      );
    }
  }

  pushUnknown();

  return lines;
}
