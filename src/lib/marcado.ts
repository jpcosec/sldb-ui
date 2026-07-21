export interface NamespaceInfo {
  name: string;
  projection?: string;
  allowCrossing?: boolean;
  requiresAddressableNodes?: boolean;
}

export interface GraphEdge {
  namespace: string;
  type: string;
  from: string;
  to: string;
}

export interface MarkerRange {
  key: string;
  namespace: string;
  classification: string;
  facets: string[][];
  start: number;
  end: number;
  text: string;
  localAnchor: string;
  openMarkerStart: number;
  openMarkerEnd: number;
  closeMarkerStart: number;
  closeMarkerEnd: number;
}

export interface MarcadoDocument {
  id: string;
  slug: string;
  title: string;
  type: string;
  source: string;
  frontmatterRaw: string;
  plainBody: string;
  plainToSourceMap: number[];
  bodySourceStart: number;
  namespaces: NamespaceInfo[];
  graphEdges: GraphEdge[];
  markers: MarkerRange[];
  diagnostics: string[];
}

const FRONTMATTER_REGEX = /^---\n([\s\S]*?)\n---\n?/;
const MARKER_REGEX = /<!--\s*(\/)?\s*([A-Za-z_][\w-]*:[^>]*?)\s*-->/g;

export function parseMarcadoDocument(slug: string, source: string): MarcadoDocument {
  const frontmatterMatch = source.match(FRONTMATTER_REGEX);
  const frontmatterRaw = frontmatterMatch?.[1] ?? "";
  const bodySourceStart = frontmatterMatch ? frontmatterMatch[0].length : 0;
  const body = source.slice(bodySourceStart);

  const meta = extractDocumentMeta(frontmatterRaw);
  const namespaces = extractNamespaces(frontmatterRaw);
  const graphEdges = extractGraphEdges(frontmatterRaw);
  const { plainBody, plainToSourceMap, markers, diagnostics } = extractMarkers(body);

  return {
    id: meta.id || slug,
    slug,
    title: meta.title || slug,
    type: meta.type || "document",
    source,
    frontmatterRaw,
    plainBody,
    plainToSourceMap,
    bodySourceStart,
    namespaces,
    graphEdges,
    markers,
    diagnostics,
  };
}

function extractDocumentMeta(frontmatterRaw: string): {
  id?: string;
  title?: string;
  type?: string;
} {
  const documentBlock = getIndentedBlock(frontmatterRaw, "document");
  return {
    id: readScalar(documentBlock, "id") || readScalar(documentBlock, "document_id"),
    title: readScalar(documentBlock, "title"),
    type: readScalar(documentBlock, "type"),
  };
}

function extractNamespaces(frontmatterRaw: string): NamespaceInfo[] {
  const block = getIndentedBlock(frontmatterRaw, "namespaces");
  if (!block) return [];

  const lines = block.split("\n");
  const namespaces: NamespaceInfo[] = [];
  let current: NamespaceInfo | null = null;

  for (const rawLine of lines) {
    const line = rawLine.replace(/\t/g, "    ");
    const trimmed = line.trim();
    if (!trimmed) continue;

    const topMatch = line.match(/^\s{2}([A-Za-z_][\w-]*):\s*$/);
    if (topMatch) {
      current = { name: topMatch[1] };
      namespaces.push(current);
      continue;
    }

    if (!current) continue;

    const propMatch = line.match(/^\s{4}([A-Za-z_][\w-]*):\s*(.+?)\s*$/);
    if (!propMatch) continue;

    const [, key, rawValue] = propMatch;
    const value = unquote(rawValue);

    if (key === "projection") current.projection = value;
    if (key === "allow_crossing") current.allowCrossing = value === "true";
    if (key === "requires_addressable_nodes") {
      current.requiresAddressableNodes = value === "true";
    }
  }

  return namespaces;
}

function extractGraphEdges(frontmatterRaw: string): GraphEdge[] {
  const graphsBlock = getIndentedBlock(frontmatterRaw, "graphs");
  if (!graphsBlock) return [];

  const edges: GraphEdge[] = [];
  const lines = graphsBlock.split("\n");
  let currentNamespace = "";
  let currentEdge: Partial<GraphEdge> | null = null;

  for (const rawLine of lines) {
    const line = rawLine.replace(/\t/g, "    ");
    const trimmed = line.trim();
    if (!trimmed) continue;

    const namespaceMatch = line.match(/^\s{2}([A-Za-z_][\w-]*):\s*$/);
    if (namespaceMatch) {
      currentNamespace = namespaceMatch[1];
      continue;
    }

    if (/^\s{6}-\s+type:\s+/.test(line)) {
      if (currentEdge?.type && currentEdge.from && currentEdge.to && currentNamespace) {
        edges.push(currentEdge as GraphEdge);
      }
      currentEdge = {
        namespace: currentNamespace,
        type: unquote(line.replace(/^\s{6}-\s+type:\s+/, "")),
      };
      continue;
    }

    const propMatch = line.match(/^\s{8}(from|to):\s+(.+?)\s*$/);
    if (propMatch && currentEdge) {
      const [, key, value] = propMatch;
      currentEdge[key] = unquote(value) as never;
    }
  }

  if (currentEdge?.type && currentEdge.from && currentEdge.to && currentNamespace) {
    edges.push(currentEdge as GraphEdge);
  }

  return edges;
}

function extractMarkers(body: string): {
  plainBody: string;
  plainToSourceMap: number[];
  markers: MarkerRange[];
  diagnostics: string[];
} {
  const plainParts: string[] = [];
  const tokens: Array<{
    key: string;
    isClose: boolean;
    plainOffset: number;
    sourceStart: number;
    sourceEnd: number;
  }> = [];
  const diagnostics: string[] = [];
  const plainToSourceMap: number[] = [];

  let lastIndex = 0;
  let plainOffset = 0;

  for (const match of body.matchAll(MARKER_REGEX)) {
    const index = match.index ?? 0;
    const before = body.slice(lastIndex, index);
    plainParts.push(before);
    for (let i = 0; i < before.length; i += 1) {
      plainToSourceMap[plainOffset + i] = lastIndex + i;
    }
    plainOffset += before.length;

    tokens.push({
      key: match[2].trim(),
      isClose: Boolean(match[1]),
      plainOffset,
      sourceStart: index,
      sourceEnd: index + match[0].length,
    });

    lastIndex = index + match[0].length;
  }

  const tail = body.slice(lastIndex);
  plainParts.push(tail);
  for (let i = 0; i < tail.length; i += 1) {
    plainToSourceMap[plainOffset + i] = lastIndex + i;
  }
  plainOffset += tail.length;
  plainToSourceMap[plainOffset] = body.length;
  const plainBody = plainParts.join("");

  const openStacks = new Map<string, Array<{ plainOffset: number; sourceStart: number; sourceEnd: number }>>();
  const markers: MarkerRange[] = [];

  for (const token of tokens) {
    if (!token.isClose) {
      const stack = openStacks.get(token.key) ?? [];
      stack.push({
        plainOffset: token.plainOffset,
        sourceStart: token.sourceStart,
        sourceEnd: token.sourceEnd,
      });
      openStacks.set(token.key, stack);
      continue;
    }

    const stack = openStacks.get(token.key);
    const start = stack?.pop();

    if (start == null) {
      diagnostics.push(`Close marker without open: ${token.key}`);
      continue;
    }

    if (stack && stack.length === 0) {
      openStacks.delete(token.key);
    }

    const [namespace, classification = ""] = token.key.split(/:(.+)/);
    markers.push({
      key: token.key,
      namespace,
      classification,
      facets: classification.split("|").map((facet) => facet.split(".")),
      start: start.plainOffset,
      end: token.plainOffset,
      text: plainBody.slice(start.plainOffset, token.plainOffset).trim(),
      localAnchor: `#${token.key}`,
      openMarkerStart: start.sourceStart,
      openMarkerEnd: start.sourceEnd,
      closeMarkerStart: token.sourceStart,
      closeMarkerEnd: token.sourceEnd,
    });
  }

  for (const [key, stack] of openStacks.entries()) {
    for (let i = 0; i < stack.length; i += 1) {
      diagnostics.push(`Open marker without close: ${key}`);
    }
  }

  markers.sort((a, b) => a.start - b.start || a.end - b.end || a.key.localeCompare(b.key));

  return { plainBody, plainToSourceMap, markers, diagnostics };
}

function getIndentedBlock(frontmatterRaw: string, section: string): string {
  const lines = frontmatterRaw.split("\n");
  const start = lines.findIndex((line) => line.trim() === `${section}:`);
  if (start === -1) return "";

  const collected: string[] = [];
  for (let i = start + 1; i < lines.length; i += 1) {
    const line = lines[i];
    if (!line.trim()) {
      collected.push(line);
      continue;
    }
    if (!/^\s{2,}/.test(line)) break;
    collected.push(line);
  }

  return collected.join("\n");
}

function readScalar(block: string, key: string): string {
  const match = block.match(new RegExp(`^\\s{2}${key}:\\s+(.+?)\\s*$`, "m"));
  return match ? unquote(match[1]) : "";
}

function unquote(value: string): string {
  return value.trim().replace(/^['"]|['"]$/g, "");
}
