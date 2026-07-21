import { FiFile, FiFolder } from "react-icons/fi";
import { type MarcadoDocument } from "../lib/marcado";
import { type WorkspaceEntry } from "../lib/workspace-state";
import type { ReactNode } from "react";

type FileTreeNode =
  | { kind: "folder"; name: string; path: string; children: FileTreeNode[] }
  | {
      kind: "file";
      name: string;
      path: string;
      slug: string;
      title: string;
      origin: WorkspaceEntry["origin"];
      markers: number;
      namespaces: number;
    };

export function WorkspaceNavigator({
  documents,
  entries,
  selectedSlug,
  onSelect,
  actions,
}: {
  documents: MarcadoDocument[];
  entries: WorkspaceEntry[];
  selectedSlug: string;
  onSelect: (slug: string) => void;
  actions?: ReactNode;
}) {
  const nodes = buildFileTree(entries, documents);

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-muted">Workspace files</h2>
        {actions ? <div className="flex gap-2">{actions}</div> : null}
      </div>
      <div className="space-y-1">
        {nodes.map((node) => (
          <FileTreeNodeView key={node.path} node={node} selectedSlug={selectedSlug} onSelect={onSelect} depth={0} />
        ))}
      </div>
    </section>
  );
}

function FileTreeNodeView({
  node,
  selectedSlug,
  onSelect,
  depth,
}: {
  node: FileTreeNode;
  selectedSlug: string;
  onSelect: (slug: string) => void;
  depth: number;
}) {
  if (node.kind === "folder") {
    return (
      <div>
        <div
          className="mb-1 flex items-center gap-2 px-2 text-xs uppercase tracking-wide text-muted"
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
        >
          <FiFolder /> {node.name}
        </div>
        <div className="space-y-1">
          {node.children.map((child) => (
            <FileTreeNodeView
              key={child.path}
              node={child}
              selectedSlug={selectedSlug}
              onSelect={onSelect}
              depth={depth + 1}
            />
          ))}
        </div>
      </div>
    );
  }

  const selected = node.slug === selectedSlug;
  return (
    <button
      onClick={() => onSelect(node.slug)}
      className={`w-full cursor-pointer rounded-xl border p-3 text-left transition ${selected ? "border-primary/40 bg-primary/10" : "border-border bg-background hover:bg-surface-hover"}`}
      style={{ marginLeft: `${depth * 12}px` }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <FiFile className="shrink-0" /> <span className="truncate">{node.title}</span>
          </div>
          <div className="mt-1 truncate text-xs text-muted">{node.path}</div>
        </div>
        <span className="rounded-full border border-border px-2 py-0.5 text-[11px] uppercase tracking-wide text-muted">
          {selected ? "current" : node.origin}
        </span>
      </div>
    </button>
  );
}

function buildFileTree(entries: WorkspaceEntry[], documents: MarcadoDocument[]): FileTreeNode[] {
  const root: FileTreeNode[] = [];
  const docBySlug = new Map(documents.map((doc) => [doc.slug, doc]));

  for (const entry of entries) {
    const path = entry.filePath || entry.fileName || entry.slug.replace(/^file:/, "");
    const parts = path.split("/").filter(Boolean);
    let level = root;
    let currentPath = "";

    parts.forEach((part, index) => {
      currentPath = currentPath ? `${currentPath}/${part}` : part;
      const isLeaf = index === parts.length - 1;

      if (isLeaf) {
        const doc = docBySlug.get(entry.slug);
        level.push({
          kind: "file",
          name: part,
          path: currentPath,
          slug: entry.slug,
          title: doc?.title || part,
          origin: entry.origin,
          markers: doc?.markers.length || 0,
          namespaces: doc?.namespaces.length || 0,
        });
        return;
      }

      let folder = level.find(
        (node): node is Extract<FileTreeNode, { kind: "folder" }> =>
          node.kind === "folder" && node.path === currentPath
      );
      if (!folder) {
        folder = { kind: "folder", name: part, path: currentPath, children: [] };
        level.push(folder);
      }
      level = folder.children;
    });
  }

  return sortTreeNodes(root);
}

function sortTreeNodes(nodes: FileTreeNode[]): FileTreeNode[] {
  return [...nodes]
    .sort((a, b) => {
      if (a.kind !== b.kind) return a.kind === "folder" ? -1 : 1;
      return a.path.localeCompare(b.path);
    })
    .map((node) => (node.kind === "folder" ? { ...node, children: sortTreeNodes(node.children) } : node));
}
