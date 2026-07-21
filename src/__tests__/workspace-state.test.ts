import { describe, expect, it } from "vitest";
import { parseMarcadoDocument } from "../lib/marcado";
import {
  createInitialWorkspaceDocumentStore,
  createInitialWorkspaceEntries,
  getWorkspaceSource,
  renameWorkspaceDocument,
  resolveWorkspaceModel,
  upsertWorkspaceDocument,
} from "../lib/workspace-state";

const baseSource = "# Example\n\nBody";
const initialDocument = parseMarcadoDocument("file:example.md", baseSource);

describe("workspace-state helpers", () => {
  it("hydrates bundled entries and respects stored drafts in the initial document store", () => {
    const entries = createInitialWorkspaceEntries([initialDocument]);
    const store = createInitialWorkspaceDocumentStore([initialDocument], (slug) =>
      slug === initialDocument.slug ? "# Draft\n\nStored body" : ""
    );

    expect(entries).toEqual([
      {
        slug: initialDocument.slug,
        initialSource: baseSource,
        origin: "bundled",
      },
    ]);
    expect(getWorkspaceSource(store, initialDocument.slug, baseSource)).toBe("# Draft\n\nStored body");
    expect(resolveWorkspaceModel(store, initialDocument.slug, baseSource).source).toBe("# Draft\n\nStored body");
  });

  it("upserts and renames workspace documents while preserving source and handles", () => {
    const handle = { name: "example.md" } as FileSystemFileHandle;
    const updatedSource = "# Updated\n\nBody";
    const renamedSlug = "file:renamed.md";

    const withHandle = upsertWorkspaceDocument(
      createInitialWorkspaceDocumentStore([initialDocument], () => ""),
      {
        slug: initialDocument.slug,
        source: updatedSource,
        model: parseMarcadoDocument(initialDocument.slug, updatedSource),
        fileHandle: handle,
      }
    );

    const renamed = renameWorkspaceDocument(withHandle, initialDocument.slug, {
      slug: renamedSlug,
      source: updatedSource,
      model: parseMarcadoDocument(renamedSlug, updatedSource),
      fileHandle: handle,
    });

    expect(renamed.sources[initialDocument.slug]).toBeUndefined();
    expect(renamed.models[initialDocument.slug]).toBeUndefined();
    expect(renamed.fileHandles[initialDocument.slug]).toBeUndefined();
    expect(renamed.sources[renamedSlug]).toBe(updatedSource);
    expect(renamed.models[renamedSlug]?.slug).toBe(renamedSlug);
    expect(renamed.fileHandles[renamedSlug]).toBe(handle);
  });
});
