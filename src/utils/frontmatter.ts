/**
 * Lightweight YAML frontmatter parser for the browser.
 * Handles simple key-value pairs and arrays (the formats used in this project).
 * No Node.js dependencies — works in any browser environment.
 */

const FRONTMATTER_REGEX = /^---\n([\s\S]*?)\n?---\n?/;

function parseSimpleYaml(yaml: string): Record<string, unknown> {
  const data: Record<string, unknown> = {};

  for (const line of yaml.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const colonIndex = trimmed.indexOf(":");
    if (colonIndex === -1) continue;

    const key = trimmed.slice(0, colonIndex).trim();
    let value: unknown = trimmed.slice(colonIndex + 1).trim();

    // Handle arrays: ["item1", "item2", ...]
    if (typeof value === "string" && value.startsWith("[") && value.endsWith("]")) {
      value = value
        .slice(1, -1)
        .split(",")
        .map((item: string) => item.trim().replace(/^["']|["']$/g, ""));
    } else if (typeof value === "string") {
      // Handle quoted strings
      value = value.replace(/^["']|["']$/g, "");
    }

    data[key] = value;
  }

  return data;
}

export interface ParsedFrontmatter {
  data: Record<string, unknown>;
  content: string;
}

/**
 * Parse frontmatter from markdown content.
 * Returns the parsed frontmatter data and the remaining content body.
 */
export function parseFrontmatter(content: string): ParsedFrontmatter {
  const match = content.match(FRONTMATTER_REGEX);

  if (!match) {
    return { data: {}, content };
  }

  const frontmatterStr = match[1];
  const body = content.slice(match[0].length);
  const data = parseSimpleYaml(frontmatterStr);

  return { data, content: body };
}