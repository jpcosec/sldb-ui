import { type MarkerRange } from "./marcado";

export function buildHighlightedMarkdown(markdown: string, markers: MarkerRange[]): string {
  if (markers.length === 0) return markdown;
  const boundaries = Array.from(new Set([0, markdown.length, ...markers.flatMap((marker) => [marker.start, marker.end])])).sort((a, b) => a - b);
  let result = "";
  for (let i = 0; i < boundaries.length - 1; i += 1) {
    const start = boundaries[i];
    const end = boundaries[i + 1];
    if (start === end) continue;
    const chunk = markdown.slice(start, end);
    const active = markers.filter((marker) => marker.start <= start && marker.end >= end);
    if (active.length === 0) {
      result += chunk;
      continue;
    }
    const namespaces = Array.from(new Set(active.map((marker) => marker.namespace)));
    const classNames = ["marker-highlight", ...namespaces.map((namespace) => `marker-highlight-${namespace}`)].join(" ");
    const title = escapeHtml(active.map((marker) => marker.key).join(" | "));
    result += `<span class="${classNames}" title="${title}" data-marker-count="${active.length}">${chunk}</span>`;
  }
  return result;
}

export function getTextOffset(container: Node, node: Node, offset: number): number {
  let charCount = 0;
  function walk(current: Node): boolean {
    if (current === node) {
      if (current.nodeType === Node.TEXT_NODE) {
        charCount += offset;
      } else {
        for (let i = 0; i < Math.min(offset, current.childNodes.length); i += 1) {
          charCount += (current.childNodes[i].textContent || "").length;
        }
      }
      return true;
    }
    if (current.nodeType === Node.TEXT_NODE) {
      charCount += (current.textContent || "").length;
      return false;
    }
    for (let i = 0; i < current.childNodes.length; i += 1) {
      if (walk(current.childNodes[i])) return true;
    }
    return false;
  }
  walk(container);
  return charCount;
}

export function escapeHtml(value: string): string {
  return value.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}
