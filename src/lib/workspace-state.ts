import { marcadoAdapter, type MarcadoAdapter } from "./marcado-adapter";
import type { MarcadoDocument } from "./marcado";

export const STORAGE_PREFIX = "marcado-ui:source:";

export type ViewMode = "rendered" | "source";
export type WorkspaceOrigin = "bundled" | "opened" | "explored";

export type WorkspaceEntry = {
  slug: string;
  initialSource: string;
  fileName?: string;
  filePath?: string;
  origin: WorkspaceOrigin;
};

export type SelectionState = {
  start: number;
  end: number;
  text: string;
};

export type WorkspaceDocumentStore = {
  sources: Record<string, string>;
  models: Record<string, MarcadoDocument>;
  fileHandles: Record<string, FileSystemFileHandle>;
};

export type WorkspaceUiState = {
  viewMode: ViewMode;
  notice: string;
  selectionState: SelectionState | null;
  markerFilter: string[];
};

export type WorkspaceDocumentRegistration = {
  slug: string;
  source: string;
  model?: MarcadoDocument;
  fileHandle?: FileSystemFileHandle;
};

export function createInitialWorkspaceEntries(initialDocuments: MarcadoDocument[]): WorkspaceEntry[] {
  return initialDocuments.map((doc) => ({
    slug: doc.slug,
    initialSource: doc.source,
    origin: "bundled",
  }));
}

export function createInitialWorkspaceDocumentStore(
  initialDocuments: MarcadoDocument[],
  readStored: (slug: string) => string,
  adapter: MarcadoAdapter = marcadoAdapter
): WorkspaceDocumentStore {
  const sources = Object.fromEntries(
    initialDocuments.map((doc) => [doc.slug, readStored(doc.slug) || doc.source])
  );
  const models = Object.fromEntries(
    initialDocuments.map((doc) => {
      const source = sources[doc.slug];
      return [doc.slug, source === doc.source ? doc : adapter.handoff({ slug: doc.slug, source }).model] as const;
    })
  );

  return {
    sources,
    models,
    fileHandles: {},
  };
}

export function createInitialWorkspaceUiState(): WorkspaceUiState {
  return {
    viewMode: "rendered",
    notice: "",
    selectionState: null,
    markerFilter: [],
  };
}

export function getWorkspaceSource(
  store: WorkspaceDocumentStore,
  slug: string,
  fallbackSource: string
): string {
  return store.sources[slug] ?? fallbackSource;
}

export function resolveWorkspaceModel(
  store: WorkspaceDocumentStore,
  slug: string,
  fallbackSource: string,
  adapter: MarcadoAdapter = marcadoAdapter
): MarcadoDocument {
  return store.models[slug] ?? adapter.handoff({ slug, source: getWorkspaceSource(store, slug, fallbackSource) }).model;
}

export function upsertWorkspaceEntry(current: WorkspaceEntry[], entry: WorkspaceEntry): WorkspaceEntry[] {
  const existingIndex = current.findIndex((item) => item.slug === entry.slug);
  if (existingIndex === -1) return [...current, entry];
  const next = [...current];
  next[existingIndex] = entry;
  return next;
}

export function upsertWorkspaceDocument(
  current: WorkspaceDocumentStore,
  registration: WorkspaceDocumentRegistration,
  adapter: MarcadoAdapter = marcadoAdapter
): WorkspaceDocumentStore {
  return {
    sources: {
      ...current.sources,
      [registration.slug]: registration.source,
    },
    models: {
      ...current.models,
      [registration.slug]: adapter.handoff(registration).model,
    },
    fileHandles: registration.fileHandle
      ? {
          ...current.fileHandles,
          [registration.slug]: registration.fileHandle,
        }
      : current.fileHandles,
  };
}

export function upsertWorkspaceDocuments(
  current: WorkspaceDocumentStore,
  registrations: WorkspaceDocumentRegistration[],
  adapter: MarcadoAdapter = marcadoAdapter
): WorkspaceDocumentStore {
  return registrations.reduce((next, registration) => upsertWorkspaceDocument(next, registration, adapter), current);
}

export function renameWorkspaceDocument(
  current: WorkspaceDocumentStore,
  fromSlug: string,
  registration: WorkspaceDocumentRegistration,
  adapter: MarcadoAdapter = marcadoAdapter
): WorkspaceDocumentStore {
  const next = upsertWorkspaceDocument(current, registration, adapter);
  const sources = { ...next.sources };
  const models = { ...next.models };
  const fileHandles = { ...next.fileHandles };

  delete sources[fromSlug];
  delete models[fromSlug];
  if (fromSlug !== registration.slug) {
    delete fileHandles[fromSlug];
  }

  return {
    sources,
    models,
    fileHandles,
  };
}

export function createWorkspaceSlug(seed: string): string {
  return `file:${seed.replace(/[^a-zA-Z0-9._/-]+/g, "-")}`;
}

export function basenameWithoutExtension(path: string): string {
  const last = path.split("/").pop() || path;
  return last.replace(/\.[^.]+$/, "");
}

export function moveStoredDraft(fromSlug: string, toSlug: string): void {
  try {
    const value = localStorage.getItem(`${STORAGE_PREFIX}${fromSlug}`);
    if (value != null) {
      localStorage.setItem(`${STORAGE_PREFIX}${toSlug}`, value);
      localStorage.removeItem(`${STORAGE_PREFIX}${fromSlug}`);
    }
  } catch {
    // ignore storage failures
  }
}

export function findAllOccurrences(text: string, query: string): number[] {
  if (!query) return [];
  const matches: number[] = [];
  let startIndex = 0;

  while (startIndex <= text.length) {
    const index = text.indexOf(query, startIndex);
    if (index === -1) break;
    matches.push(index);
    startIndex = index + query.length;
  }

  return matches;
}

export function readStoredSource(slug: string): string {
  try {
    return localStorage.getItem(`${STORAGE_PREFIX}${slug}`) ?? "";
  } catch {
    return "";
  }
}
