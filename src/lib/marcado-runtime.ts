import { parseMarcadoDocument, type GraphEdge, type MarcadoDocument, type MarkerRange, type NamespaceInfo } from './marcado';

export type MarcadoRuntimeMode = 'runtime' | 'fallback';

export interface MarcadoRuntimeRefreshResult {
  mode: MarcadoRuntimeMode;
  model: MarcadoDocument;
}

export interface RuntimeExportMarkerToken {
  key: string;
  namespace: string;
  classification: string;
  facets: string[][];
  kind: 'open' | 'close';
  source: {
    raw: string;
    line: number;
    column: number;
    start_offset: number;
    end_offset: number;
  };
}

export interface RuntimeExportRange {
  key: string;
  namespace: string;
  classification: string;
  facets: string[][];
  span: {
    start: number;
    end: number;
    start_line: number;
    start_column: number;
    end_line: number;
    end_column: number;
  };
  text: string;
}

export interface RuntimeExportDocument {
  document?: {
    id?: string;
    title?: string;
    type?: string;
  };
  source?: {
    frontmatter?: {
      namespaces?: Record<string, {
        projection?: string;
        allow_crossing?: boolean;
        requires_addressable_nodes?: boolean;
      }>;
      graphs?: Record<string, {
        edges?: Array<{ type?: string; from?: string; to?: string }>;
      }>;
    };
    plain_text?: string;
    body?: string;
  };
  markers?: RuntimeExportMarkerToken[];
  ranges?: RuntimeExportRange[];
  diagnostics?: Array<{ message?: string; code?: string; severity?: string }>;
  validation?: {
    blocking?: Array<{ message?: string; code?: string }>;
    lint?: Array<{ message?: string; code?: string }>;
  };
}

export async function refreshMarcadoDocument(
  slug: string,
  source: string,
  filePath?: string
): Promise<MarcadoRuntimeRefreshResult> {
  const runtimeExport = await requestRuntimeExport(source, filePath);
  if (runtimeExport) {
    return {
      mode: 'runtime',
      model: runtimeExportToDocument(slug, source, runtimeExport),
    };
  }

  return {
    mode: 'fallback',
    model: parseMarcadoDocument(slug, source),
  };
}

export async function parseSourceWithRuntimeFallback(
  slug: string,
  source: string,
  filePath?: string
): Promise<MarcadoDocument> {
  return (await refreshMarcadoDocument(slug, source, filePath)).model;
}

export function runtimeExportToDocument(
  slug: string,
  source: string,
  exported: RuntimeExportDocument
): MarcadoDocument {
  const fallback = parseMarcadoDocument(slug, source);
  const frontmatterRaw = fallback.frontmatterRaw;
  const bodySourceStart = fallback.bodySourceStart;
  const body = source.slice(bodySourceStart);
  const plainProjection = buildPlainProjection(body);
  const tokens = exported.markers ?? [];
  const tokenGroups = new Map<string, { open: RuntimeExportMarkerToken[]; close: RuntimeExportMarkerToken[] }>();

  for (const token of tokens) {
    const group = tokenGroups.get(token.key) ?? { open: [], close: [] };
    if (token.kind === 'open') group.open.push(token);
    else group.close.push(token);
    tokenGroups.set(token.key, group);
  }

  const markers: MarkerRange[] = (exported.ranges ?? []).map((range) => {
    const group = tokenGroups.get(range.key);
    const openToken = group?.open.shift();
    const closeToken = group?.close.shift();
    return {
      key: range.key,
      namespace: range.namespace,
      classification: range.classification,
      facets: range.facets,
      start: range.span.start,
      end: range.span.end,
      text: range.text.trim(),
      localAnchor: `#${range.key}`,
      openMarkerStart: openToken?.source.start_offset ?? 0,
      openMarkerEnd: openToken?.source.end_offset ?? 0,
      closeMarkerStart: closeToken?.source.start_offset ?? 0,
      closeMarkerEnd: closeToken?.source.end_offset ?? 0,
    };
  });

  markers.sort((a, b) => a.start - b.start || a.end - b.end || a.key.localeCompare(b.key));

  const namespaces = extractRuntimeNamespaces(exported).length > 0
    ? extractRuntimeNamespaces(exported)
    : fallback.namespaces;
  const graphEdges = extractRuntimeGraphEdges(exported).length > 0
    ? extractRuntimeGraphEdges(exported)
    : fallback.graphEdges;

  const diagnostics = [
    ...(exported.diagnostics ?? []).map((entry) => formatDiagnostic(entry.code, entry.message, entry.severity)),
    ...((exported.validation?.blocking ?? []).map((entry) => formatDiagnostic(entry.code, entry.message, 'error'))),
    ...((exported.validation?.lint ?? []).map((entry) => formatDiagnostic(entry.code, entry.message, 'warning'))),
  ].filter(Boolean) as string[];

  return {
    id: exported.document?.id || fallback.id,
    slug,
    title: exported.document?.title || fallback.title,
    type: exported.document?.type || fallback.type,
    source,
    frontmatterRaw,
    plainBody: exported.source?.plain_text ?? plainProjection.plainBody,
    plainToSourceMap: plainProjection.plainToSourceMap,
    bodySourceStart,
    namespaces,
    graphEdges,
    markers,
    diagnostics,
  };
}

async function requestRuntimeExport(
  source: string,
  filePath?: string
): Promise<RuntimeExportDocument | null> {
  if (typeof fetch === 'undefined') return null;

  try {
    const response = await fetch('/api/marcado/export', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ source, filePath }),
    });

    if (!response.ok) return null;
    return await response.json() as RuntimeExportDocument;
  } catch {
    return null;
  }
}

function extractRuntimeNamespaces(exported: RuntimeExportDocument): NamespaceInfo[] {
  const namespaces = exported.source?.frontmatter?.namespaces ?? {};
  return Object.entries(namespaces).map(([name, value]) => ({
    name,
    projection: value.projection,
    allowCrossing: value.allow_crossing,
    requiresAddressableNodes: value.requires_addressable_nodes,
  }));
}

function extractRuntimeGraphEdges(exported: RuntimeExportDocument): GraphEdge[] {
  const graphs = exported.source?.frontmatter?.graphs ?? {};
  const edges: GraphEdge[] = [];

  for (const [namespace, graph] of Object.entries(graphs)) {
    for (const edge of graph.edges ?? []) {
      if (!edge.type || !edge.from || !edge.to) continue;
      edges.push({ namespace, type: edge.type, from: edge.from, to: edge.to });
    }
  }

  return edges;
}

function buildPlainProjection(body: string): { plainBody: string; plainToSourceMap: number[] } {
  const markerRegex = /<!--\s*(\/)?\s*([A-Za-z_][\w-]*:[^>]*?)\s*-->/g;
  const plainParts: string[] = [];
  const plainToSourceMap: number[] = [];
  let lastIndex = 0;
  let plainOffset = 0;

  for (const match of body.matchAll(markerRegex)) {
    const index = match.index ?? 0;
    const before = body.slice(lastIndex, index);
    plainParts.push(before);
    for (let i = 0; i < before.length; i += 1) {
      plainToSourceMap[plainOffset + i] = lastIndex + i;
    }
    plainOffset += before.length;
    lastIndex = index + match[0].length;
  }

  const tail = body.slice(lastIndex);
  plainParts.push(tail);
  for (let i = 0; i < tail.length; i += 1) {
    plainToSourceMap[plainOffset + i] = lastIndex + i;
  }
  plainOffset += tail.length;
  plainToSourceMap[plainOffset] = body.length;

  return { plainBody: plainParts.join(''), plainToSourceMap };
}

function formatDiagnostic(code?: string, message?: string, severity?: string): string | null {
  if (!code && !message) return null;
  const prefix = [severity, code].filter(Boolean).join(': ');
  return prefix ? `${prefix} — ${message || ''}`.trim() : (message || null);
}
