import { useEffect, useMemo, useState, type ReactNode } from "react";
import { FiBookOpen, FiEdit2, FiFileText, FiFolder, FiPlus, FiSave, FiUpload } from "react-icons/fi";
import { DocumentWorkspace, type DocumentInterpretationMode } from "./components/document-workspace";
import { WorkspaceNavigator } from "./components/workspace-navigator";
import { WorkspaceMain, WorkspaceShell, WorkspaceSidebar, WorkspaceSidebarHeader } from "./components/workspace-shell";
import { loadDocuments } from "./data/documents";
import { marcadoAdapter } from "./lib/marcado-adapter";
import { type MarcadoDocument, type MarkerRange } from "./lib/marcado";
import { removeMarkerFromSource, renameMarkerInSource } from "./lib/marker-edit";
import {
  basenameWithoutExtension,
  createInitialWorkspaceDocumentStore,
  createInitialWorkspaceEntries,
  createInitialWorkspaceUiState,
  createWorkspaceSlug,
  findAllOccurrences,
  getWorkspaceSource,
  moveStoredDraft,
  readStoredSource,
  renameWorkspaceDocument,
  resolveWorkspaceModel,
  STORAGE_PREFIX,
  type SelectionState,
  type ViewMode,
  type WorkspaceDocumentStore,
  type WorkspaceEntry,
  type WorkspaceUiState,
  upsertWorkspaceDocument,
  upsertWorkspaceDocuments,
  upsertWorkspaceEntry,
} from "./lib/workspace-state";

const initialDocuments = loadDocuments();

export default function App() {
  const [workspaceEntries, setWorkspaceEntries] = useState<WorkspaceEntry[]>(() =>
    createInitialWorkspaceEntries(initialDocuments)
  );
  const [selectedSlug, setSelectedSlug] = useState(initialDocuments[0]?.slug ?? "");
  const [workspaceDocuments, setWorkspaceDocuments] = useState<WorkspaceDocumentStore>(() =>
    createInitialWorkspaceDocumentStore(initialDocuments, readStoredSource)
  );
  const [documentModes, setDocumentModes] = useState<Record<string, DocumentInterpretationMode>>(() =>
    Object.fromEntries(
      initialDocuments.map((doc) => [doc.slug, readStoredSource(doc.slug) ? "local" : "runtime"] as const)
    )
  );
  const [workspaceUi, setWorkspaceUi] = useState<WorkspaceUiState>(() => createInitialWorkspaceUiState());

  const { viewMode, notice, selectionState, markerFilter } = workspaceUi;

  const setNotice = (nextNotice: string) => {
    setWorkspaceUi((current) => ({ ...current, notice: nextNotice }));
  };

  const setViewMode = (nextViewMode: ViewMode) => {
    setWorkspaceUi((current) => ({ ...current, viewMode: nextViewMode }));
  };

  const setSelectionState = (nextSelectionState: SelectionState | null) => {
    setWorkspaceUi((current) => ({ ...current, selectionState: nextSelectionState }));
  };

  const setMarkerFilter = (nextMarkerFilter: string[] | ((current: string[]) => string[])) => {
    setWorkspaceUi((current) => ({
      ...current,
      markerFilter:
        typeof nextMarkerFilter === "function"
          ? nextMarkerFilter(current.markerFilter)
          : nextMarkerFilter,
    }));
  };

  const activateWorkspaceEntry = ({
    entry,
    source,
    model,
    fileHandle,
    viewMode: nextViewMode = "source",
    notice: nextNotice,
    interpretationMode = "local",
  }: {
    entry: WorkspaceEntry;
    source: string;
    model: MarcadoDocument;
    fileHandle?: FileSystemFileHandle;
    viewMode?: ViewMode;
    notice: string;
    interpretationMode?: DocumentInterpretationMode;
  }) => {
    setWorkspaceEntries((current) => upsertWorkspaceEntry(current, entry));
    setWorkspaceDocuments((current) =>
      upsertWorkspaceDocument(current, {
        slug: entry.slug,
        source,
        model,
        fileHandle,
      })
    );
    setSelectedSlug(entry.slug);
    setDocumentModes((current) => ({ ...current, [entry.slug]: interpretationMode }));
    setWorkspaceUi((current) => ({
      ...current,
      viewMode: nextViewMode,
      notice: nextNotice,
    }));
  };

  useEffect(() => {
    if (!selectedSlug && initialDocuments[0]) {
      setSelectedSlug(initialDocuments[0].slug);
    }
  }, [selectedSlug]);

  const documents = useMemo(
    () => workspaceEntries.map((entry) => resolveWorkspaceModel(workspaceDocuments, entry.slug, entry.initialSource)),
    [workspaceDocuments, workspaceEntries]
  );

  const selectedDoc = useMemo(
    () => documents.find((doc) => doc.slug === selectedSlug) ?? null,
    [documents, selectedSlug]
  );

  const selectedEntry = useMemo(
    () => workspaceEntries.find((entry) => entry.slug === selectedSlug) ?? null,
    [workspaceEntries, selectedSlug]
  );

  const sampleDocuments = useMemo(
    () => workspaceEntries
      .filter((entry) => entry.origin === "bundled")
      .map((entry) => {
        const doc = documents.find((item) => item.slug === entry.slug);
        return {
          slug: entry.slug,
          title: doc?.title ?? entry.fileName ?? entry.slug.replace(/^file:/, ""),
          description: doc?.id ?? "Bundled sample document",
        };
      }),
    [documents, workspaceEntries]
  );

  const draftEntries = useMemo(
    () => workspaceEntries
      .filter((entry) => Boolean(readStoredSource(entry.slug)))
      .map((entry) => {
        const doc = documents.find((item) => item.slug === entry.slug);
        return {
          slug: entry.slug,
          title: doc?.title ?? entry.fileName ?? entry.slug.replace(/^file:/, ""),
          description: entry.filePath ?? entry.fileName ?? doc?.id ?? "Saved draft",
        };
      }),
    [documents, notice, workspaceEntries]
  );

  const visibleMarkers = useMemo(() => {
    if (!selectedDoc) return [];
    if (markerFilter.length === 0) return selectedDoc.markers;
    return selectedDoc.markers.filter((marker) => markerFilter.includes(marker.namespace));
  }, [selectedDoc, markerFilter]);

  const selectedDocumentMode = selectedDoc ? (documentModes[selectedDoc.slug] ?? "local") : "local";

  const handleSourceChange = (value: string) => {
    if (!selectedDoc) return;
    setWorkspaceDocuments((current) =>
      upsertWorkspaceDocument(current, marcadoAdapter.handoff({ slug: selectedDoc.slug, source: value }))
    );
    setDocumentModes((current) => ({ ...current, [selectedDoc.slug]: "local" }));
  };

  const handleAddMarker = (namespace: string, classification: string) => {
    if (!selectedDoc || !selectionState) return;

    const normalizedNamespace = namespace.trim();
    const normalizedClassification = classification.trim();
    if (!normalizedNamespace || !normalizedClassification) {
      setNotice("Namespace and classification are required");
      return;
    }

    const key = `${normalizedNamespace}:${normalizedClassification}`;
    const sourceMap = selectedDoc.plainToSourceMap;
    const exactMatches = findAllOccurrences(selectedDoc.plainBody, selectionState.text);

    const plainStart = exactMatches.length === 1 ? exactMatches[0] : selectionState.start;
    const plainEnd = exactMatches.length === 1 ? plainStart + selectionState.text.length : selectionState.end;

    const startInBody = sourceMap[plainStart];
    const endInBody = sourceMap[plainEnd];

    if (startInBody == null || endInBody == null) {
      setNotice("Could not resolve selection back into source");
      return;
    }

    const startIndex = selectedDoc.bodySourceStart + startInBody;
    const endIndex = selectedDoc.bodySourceStart + endInBody;
    const currentSource = getWorkspaceSource(workspaceDocuments, selectedDoc.slug, selectedDoc.source);
    const openMarker = `<!-- ${key} -->`;
    const closeMarker = `<!-- /${key} -->`;
    const nextSource =
      currentSource.slice(0, startIndex) +
      openMarker +
      currentSource.slice(startIndex, endIndex) +
      closeMarker +
      currentSource.slice(endIndex);

    setWorkspaceDocuments((current) =>
      upsertWorkspaceDocument(current, marcadoAdapter.handoff({ slug: selectedDoc.slug, source: nextSource }))
    );
    setDocumentModes((current) => ({ ...current, [selectedDoc.slug]: "local" }));
    setSelectionState(null);
    window.getSelection()?.removeAllRanges();
    setNotice(`Added marker ${key}`);
  };

  const handleRefreshRuntime = async () => {
    if (!selectedDoc) return;
    const source = getWorkspaceSource(workspaceDocuments, selectedDoc.slug, selectedDoc.source);
    const runtimeDoc = await marcadoAdapter.refresh({
      slug: selectedDoc.slug,
      source,
      filePath: selectedEntry?.filePath,
    });
    setWorkspaceDocuments((current) =>
      upsertWorkspaceDocument(current, {
        slug: selectedDoc.slug,
        source,
        model: runtimeDoc.model,
      })
    );
    setDocumentModes((current) => ({ ...current, [selectedDoc.slug]: runtimeDoc.mode }));
    setNotice(
      runtimeDoc.mode === "runtime"
        ? `Refreshed ${selectedDoc.id} from Marcado runtime`
        : `Marcado runtime unavailable; refreshed ${selectedDoc.id} with degraded fallback parsing`
    );
  };

  const handleSaveDraft = () => {
    if (!selectedDoc) return;
    localStorage.setItem(
      `${STORAGE_PREFIX}${selectedDoc.slug}`,
      getWorkspaceSource(workspaceDocuments, selectedDoc.slug, selectedDoc.source)
    );
    setNotice(`Saved draft for ${selectedDoc.id}`);
  };

  const handleSaveFile = async () => {
    if (!selectedDoc) return;

    let fileHandle = workspaceDocuments.fileHandles[selectedDoc.slug];
    if (!fileHandle && typeof window !== "undefined" && window.showSaveFilePicker) {
      fileHandle = await window.showSaveFilePicker({
        suggestedName: selectedEntry?.fileName || `${selectedDoc.slug.replace(/^file:/, "")}.md`,
        types: [{
          description: "Markdown files",
          accept: { "text/markdown": [".md"], "text/plain": [".md", ".txt"] },
        }],
      });
      setWorkspaceDocuments((current) =>
        upsertWorkspaceDocument(current, {
          slug: selectedDoc.slug,
          source: getWorkspaceSource(current, selectedDoc.slug, selectedDoc.source),
          model: current.models[selectedDoc.slug] ?? selectedDoc,
          fileHandle: fileHandle!,
        })
      );
    }

    if (!fileHandle) {
      handleDownload();
      setNotice(`No file handle for ${selectedDoc.id}; downloaded instead`);
      return;
    }

    const writable = await fileHandle.createWritable();
    await writable.write(getWorkspaceSource(workspaceDocuments, selectedDoc.slug, selectedDoc.source));
    await writable.close();
    setNotice(`Saved file ${fileHandle.name}`);
  };

  const handleResumeDraft = (slug: string) => {
    const draftDoc = documents.find((doc) => doc.slug === slug);
    if (!draftDoc) return;

    const stored = readStoredSource(slug);
    if (!stored) {
      setNotice(`No saved draft found for ${draftDoc.id}`);
      return;
    }

    setWorkspaceDocuments((current) =>
      upsertWorkspaceDocument(current, marcadoAdapter.handoff({ slug, source: stored }))
    );
    setDocumentModes((current) => ({ ...current, [slug]: "local" }));
    setSelectedSlug(slug);
    setWorkspaceUi((current) => ({
      ...current,
      viewMode: "source",
      notice: `Resumed saved draft for ${draftDoc.id}`,
    }));
  };

  const handleLoad = () => {
    if (!selectedDoc) return;
    handleResumeDraft(selectedDoc.slug);
  };

  const handleOpenSample = (slug: string) => {
    const sampleDoc = documents.find((doc) => doc.slug === slug);
    if (!sampleDoc) return;
    setSelectedSlug(slug);
    setWorkspaceUi((current) => ({
      ...current,
      viewMode: "rendered",
      notice: `Opened sample ${sampleDoc.title}`,
    }));
  };

  const handleReset = () => {
    if (!selectedDoc || !selectedEntry) return;
    setWorkspaceDocuments((current) =>
      upsertWorkspaceDocument(
        current,
        marcadoAdapter.handoff({ slug: selectedDoc.slug, source: selectedEntry.initialSource })
      )
    );
    setDocumentModes((current) => ({ ...current, [selectedDoc.slug]: "local" }));
    setNotice(`Reset ${selectedDoc.id} to original source`);
  };

  const handleDownload = () => {
    if (!selectedDoc) return;
    const blob = new Blob([getWorkspaceSource(workspaceDocuments, selectedDoc.slug, selectedDoc.source)], {
      type: "text/markdown;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${selectedDoc.slug}.md`;
    link.click();
    URL.revokeObjectURL(url);
    setNotice(`Downloaded ${selectedDoc.slug}.md`);
  };

  const handleUpload: React.ChangeEventHandler<HTMLInputElement> = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const slug = createWorkspaceSlug(file.name);
    const interpretedDocument = await marcadoAdapter.interpret({ slug, source: text, filePath: file.name });

    activateWorkspaceEntry({
      entry: {
        slug,
        initialSource: text,
        fileName: file.name,
        filePath: file.name,
        origin: "opened",
      },
      source: text,
      model: interpretedDocument.model,
      notice:
        interpretedDocument.mode === "runtime"
          ? `Opened ${file.name}`
          : `Opened ${file.name} with degraded fallback parsing`,
      interpretationMode: interpretedDocument.mode,
    });
    event.target.value = "";
  };

  const handleOpenFile = async () => {
    if (!supportsFileSystemAccess()) return;
    const [fileHandle] = await window.showOpenFilePicker({
      multiple: false,
      types: [{
        description: "Markdown files",
        accept: { "text/markdown": [".md"], "text/plain": [".md", ".txt"] },
      }],
    });

    if (!fileHandle) return;
    const file = await fileHandle.getFile();
    const text = await file.text();
    const slug = createWorkspaceSlug(file.name);
    const interpretedDocument = await marcadoAdapter.interpret({ slug, source: text, filePath: file.name });

    activateWorkspaceEntry({
      entry: {
        slug,
        initialSource: text,
        fileName: file.name,
        filePath: file.name,
        origin: "opened",
      },
      source: text,
      model: interpretedDocument.model,
      fileHandle,
      notice:
        interpretedDocument.mode === "runtime"
          ? `Opened ${file.name}`
          : `Opened ${file.name} with degraded fallback parsing`,
      interpretationMode: interpretedDocument.mode,
    });
  };

  const handleExploreFiles = async () => {
    if (!supportsFileSystemAccess()) return;
    const directoryHandle = await window.showDirectoryPicker();
    const discovered = await collectMarkdownFiles(directoryHandle);

    if (discovered.length === 0) {
      setNotice(`No markdown files found in ${directoryHandle.name}`);
      return;
    }

    const nextEntries = discovered.map(({ path, handle, source }) => ({
      slug: createWorkspaceSlug(path),
      initialSource: source,
      fileName: handle.name,
      filePath: path,
      origin: "explored" as const,
    }));
    const nextModels = await Promise.all(
      nextEntries.map((entry) =>
        marcadoAdapter.interpret({ slug: entry.slug, source: entry.initialSource, filePath: entry.filePath })
      )
    );

    setWorkspaceEntries((current) => {
      let updated = current;
      for (const entry of nextEntries) updated = upsertWorkspaceEntry(updated, entry);
      return updated;
    });
    setWorkspaceDocuments((current) =>
      upsertWorkspaceDocuments(
        current,
        nextEntries.map((entry, index) => ({
          slug: entry.slug,
          source: entry.initialSource,
          model: nextModels[index].model,
          fileHandle: discovered[index]?.handle,
        }))
      )
    );
    setDocumentModes((current) => ({
      ...current,
      ...Object.fromEntries(nextEntries.map((entry, index) => [entry.slug, nextModels[index]?.mode ?? "fallback"])),
    }));
    setSelectedSlug(nextEntries[0].slug);
    setNotice(
      nextModels.some((result) => result.mode === "fallback")
        ? `Loaded ${discovered.length} markdown file(s) from ${directoryHandle.name} with degraded fallback parsing where runtime export was unavailable`
        : `Loaded ${discovered.length} markdown file(s) from ${directoryHandle.name}`
    );
  };

  const handleCreateFile = () => {
    const requestedPath = window.prompt("New markdown file path", "drafts/new-document.md");
    if (!requestedPath) return;
    const slug = createWorkspaceSlug(requestedPath);
    const source = `---\ndocument:\n  id: ${basenameWithoutExtension(requestedPath)}\n  type: note\n  title: ${basenameWithoutExtension(requestedPath)}\n---\n\n# ${basenameWithoutExtension(requestedPath)}\n`;
    activateWorkspaceEntry({
      entry: {
        slug,
        initialSource: source,
        fileName: requestedPath.split("/").pop() || requestedPath,
        filePath: requestedPath,
        origin: "opened",
      },
      source,
      model: marcadoAdapter.parse({ slug, source }),
      notice: `Created ${requestedPath}`,
      interpretationMode: "local",
    });
  };

  const handleRenameFile = () => {
    if (!selectedEntry || !selectedDoc) return;
    const nextPath = window.prompt("Rename file", selectedEntry.filePath || selectedEntry.fileName || selectedDoc.slug.replace(/^file:/, ""));
    if (!nextPath || nextPath === (selectedEntry.filePath || selectedEntry.fileName)) return;
    const nextSlug = createWorkspaceSlug(nextPath);
    const source = getWorkspaceSource(workspaceDocuments, selectedDoc.slug, selectedDoc.source);

    setWorkspaceEntries((current) => current.map((entry) =>
      entry.slug === selectedEntry.slug
        ? { ...entry, slug: nextSlug, fileName: nextPath.split("/").pop() || nextPath, filePath: nextPath }
        : entry
    ));
    setDocumentModes((current) => {
      const next = { ...current, [nextSlug]: current[selectedEntry.slug] ?? "local" };
      delete next[selectedEntry.slug];
      return next;
    });
    setWorkspaceDocuments((current) =>
      renameWorkspaceDocument(current, selectedEntry.slug, {
        slug: nextSlug,
        source,
        model: marcadoAdapter.parse({ slug: nextSlug, source }),
        fileHandle: current.fileHandles[selectedEntry.slug],
      })
    );
    moveStoredDraft(selectedEntry.slug, nextSlug);
    setSelectedSlug(nextSlug);
    setNotice(`Renamed to ${nextPath}`);
  };

  const handleDeleteMarker = (marker: MarkerRange) => {
    if (!selectedDoc) return;
    const currentSource = getWorkspaceSource(workspaceDocuments, selectedDoc.slug, selectedDoc.source);
    const nextSource = removeMarkerFromSource(currentSource, selectedDoc.bodySourceStart, marker);
    setWorkspaceDocuments((current) =>
      upsertWorkspaceDocument(current, marcadoAdapter.handoff({ slug: selectedDoc.slug, source: nextSource }))
    );
    setDocumentModes((current) => ({ ...current, [selectedDoc.slug]: "local" }));
    setNotice(`Deleted marker ${marker.key}`);
  };

  const handleRenameMarker = (marker: MarkerRange) => {
    if (!selectedDoc) return;
    const nextKey = window.prompt("Rename marker key", marker.key);
    if (!nextKey || nextKey === marker.key) return;
    const currentSource = getWorkspaceSource(workspaceDocuments, selectedDoc.slug, selectedDoc.source);
    const nextSource = renameMarkerInSource(currentSource, selectedDoc.bodySourceStart, marker, nextKey);
    setWorkspaceDocuments((current) =>
      upsertWorkspaceDocument(current, marcadoAdapter.handoff({ slug: selectedDoc.slug, source: nextSource }))
    );
    setDocumentModes((current) => ({ ...current, [selectedDoc.slug]: "local" }));
    setNotice(`Renamed marker to ${nextKey}`);
  };

  useEffect(() => {
    setSelectionState(null);
  }, [selectedSlug, viewMode, workspaceDocuments.sources]);

  useEffect(() => {
    setMarkerFilter([]);
  }, [selectedSlug]);

  const canUseNativeFiles = supportsFileSystemAccess();
  const firstSampleDocument = sampleDocuments[0] ?? null;
  const firstDraftEntry = draftEntries[0] ?? null;

  return (
    <WorkspaceShell
      sidebar={
        <WorkspaceSidebar>
          <WorkspaceSidebarHeader
            eyebrow="@marcado/ui"
            title="Open a semantic Markdown document"
            description="Use Marcado to read, render, inspect, and edit semantic Markdown documents with runtime-backed structure." 
          />

          <div className="space-y-5 p-4 lg:p-5">
            <section className="space-y-3">
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-muted">Start here</h2>
                <p className="mt-2 text-sm text-muted leading-6">
                  Pick the fastest path into a document, then work directly in rendered or source mode with semantic filters.
                </p>
              </div>
              <div className="space-y-3">
                {canUseNativeFiles ? (
                  <EntryActionCard
                    icon={<FiFolder />}
                    title="Open a local Markdown file"
                    description="Use the browser file picker when you want to work on a real file right away."
                    badge="recommended"
                    ariaLabel="Open a local Markdown file"
                    onClick={handleOpenFile}
                  />
                ) : null}
                <UploadActionCard
                  icon={<FiUpload />}
                  title="Upload a Markdown file"
                  description="Bring a document into this browser session when native file access is not available or not needed."
                  badge="browser-safe"
                  ariaLabel="Upload a Markdown document"
                  onChange={handleUpload}
                />
                {firstSampleDocument ? (
                  <EntryActionCard
                    icon={<FiBookOpen />}
                    title={`Open sample: ${firstSampleDocument.title}`}
                    description="Start from a bundled example to inspect structure, markers, and the dual source/render flow."
                    badge="sample"
                    ariaLabel={`Open sample ${firstSampleDocument.title}`}
                    onClick={() => handleOpenSample(firstSampleDocument.slug)}
                  />
                ) : null}
                <EntryActionCard
                  icon={<FiSave />}
                  title={firstDraftEntry ? `Resume draft: ${firstDraftEntry.title}` : "Resume a saved draft"}
                  description={firstDraftEntry
                    ? "Jump back into the latest saved draft and continue editing in source view."
                    : "Saved drafts will appear here after you use Save draft on any document."}
                  badge={firstDraftEntry ? "saved" : undefined}
                  ariaLabel={firstDraftEntry ? `Resume draft ${firstDraftEntry.title}` : "Resume a saved draft"}
                  onClick={firstDraftEntry ? () => handleResumeDraft(firstDraftEntry.slug) : undefined}
                  disabled={!firstDraftEntry}
                />
              </div>
            </section>

            {sampleDocuments.length > 1 ? (
              <CompactSection title="More sample documents" meta={`${sampleDocuments.length} available`}>
                <div className="space-y-2">
                  {sampleDocuments.map((sample) => (
                    <EntryActionCard
                      key={sample.slug}
                      icon={<FiFileText />}
                      title={sample.title}
                      description={sample.description}
                      badge={sample.slug === selectedSlug ? "current" : "sample"}
                      ariaLabel={`Open sample ${sample.title}`}
                      onClick={() => handleOpenSample(sample.slug)}
                    />
                  ))}
                </div>
              </CompactSection>
            ) : null}

            {draftEntries.length > 0 ? (
              <CompactSection title="Saved drafts" meta={`${draftEntries.length} ready to resume`}>
                <div className="space-y-2">
                  {draftEntries.map((entry) => (
                    <EntryActionCard
                      key={entry.slug}
                      icon={<FiSave />}
                      title={entry.title}
                      description={entry.description}
                      badge={entry.slug === selectedSlug ? "current" : "draft"}
                      ariaLabel={`Resume draft ${entry.title}`}
                      onClick={() => handleResumeDraft(entry.slug)}
                    />
                  ))}
                </div>
              </CompactSection>
            ) : null}

            <WorkspaceNavigator
              documents={documents}
              entries={workspaceEntries}
              selectedSlug={selectedSlug}
              onSelect={setSelectedSlug}
              actions={
                <>
                  <ActionButton onClick={handleCreateFile} icon={<FiPlus />} label="New file" />
                  <ActionButton onClick={handleRenameFile} icon={<FiEdit2 />} label="Rename" />
                </>
              }
            />
          </div>
        </WorkspaceSidebar>
      }
      main={
        <WorkspaceMain>
          {selectedDoc ? (
            <DocumentWorkspace
              document={selectedDoc}
              sourceValue={getWorkspaceSource(workspaceDocuments, selectedDoc.slug, selectedDoc.source)}
              viewMode={viewMode}
              notice={notice}
              fileLabel={selectedEntry?.filePath ?? selectedEntry?.fileName ?? null}
              interpretationMode={selectedDocumentMode}
              selectionState={selectionState}
              canUseNativeFiles={canUseNativeFiles}
              markerFilter={markerFilter}
              visibleMarkers={visibleMarkers}
              onChangeViewMode={setViewMode}
              onSourceChange={handleSourceChange}
              onSelectRange={setSelectionState}
              onClearSelection={() => setSelectionState(null)}
              onAddMarker={handleAddMarker}
              onToggleMarkerFilter={(namespace) => setMarkerFilter((current) =>
                current.includes(namespace)
                  ? current.filter((item) => item !== namespace)
                  : [...current, namespace]
              )}
              onSetMarkerFilter={(nextFilter) => setMarkerFilter(nextFilter)}
              onClearMarkerFilter={() => setMarkerFilter([])}
              onRenameMarker={handleRenameMarker}
              onDeleteMarker={handleDeleteMarker}
              onRefreshRuntime={handleRefreshRuntime}
              onSaveDraft={handleSaveDraft}
              onSaveFile={handleSaveFile}
              onLoad={handleLoad}
              onReset={handleReset}
              onDownload={handleDownload}
              onUpload={handleUpload}
              onOpenFile={handleOpenFile}
              onExploreFiles={handleExploreFiles}
            />
          ) : null}
        </WorkspaceMain>
      }
    />
  );
}

function ActionButton({ onClick, icon, label }: { onClick: () => void; icon: ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-border bg-background/80 px-3 py-2 text-sm text-foreground hover:bg-surface-hover"
    >
      {icon}
      {label}
    </button>
  );
}

function PurposeCard({
  title,
  description,
  badge,
  active,
  onClick,
}: {
  title: string;
  description: string;
  badge: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`w-full rounded-[1.5rem] border p-4 text-left transition ${
        active ? "border-primary/40 bg-primary/12 shadow-[0_8px_24px_rgba(91,96,255,0.12)]" : "border-border bg-background/80 hover:border-primary/30 hover:bg-surface-hover"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-foreground">{title}</div>
          <p className="mt-2 text-sm leading-6 text-muted">{description}</p>
        </div>
        <span className="rounded-full border border-border px-2 py-0.5 text-[11px] uppercase tracking-wide text-muted">{badge}</span>
      </div>
    </button>
  );
}

function CompactSection({ title, meta, children }: { title: string; meta?: string; children: ReactNode }) {
  return (
    <details className="rounded-[1.5rem] border border-border bg-background/70 p-3">
      <summary className="cursor-pointer list-none">
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm font-semibold text-foreground">{title}</div>
          {meta ? <span className="text-xs text-muted">{meta}</span> : null}
        </div>
      </summary>
      <div className="mt-3 space-y-2">{children}</div>
    </details>
  );
}

function EntryActionCard({
  icon,
  title,
  description,
  badge,
  ariaLabel,
  onClick,
  disabled = false,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  badge?: string;
  ariaLabel?: string;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel ?? title}
      className={`block w-full rounded-[1.5rem] border p-4 text-left transition ${
        disabled
          ? "cursor-not-allowed border-border bg-background/70 text-muted opacity-70"
          : "cursor-pointer border-border bg-background hover:border-primary/40 hover:bg-primary/5"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`mt-0.5 rounded-xl border p-2 ${disabled ? "border-border bg-surface text-muted" : "border-primary/20 bg-primary/10 text-primary"}`}>
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm font-semibold text-foreground">{title}</div>
            {badge ? (
              <span className="rounded-full border border-border px-2 py-0.5 text-[11px] uppercase tracking-wide text-muted">
                {badge}
              </span>
            ) : null}
          </div>
          <p className="mt-2 text-sm leading-6 text-muted">{description}</p>
        </div>
      </div>
    </button>
  );
}

function UploadActionCard({
  icon,
  title,
  description,
  badge,
  ariaLabel,
  onChange,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  badge?: string;
  ariaLabel?: string;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
}) {
  return (
    <label className="block cursor-pointer rounded-[1.5rem] border border-border bg-background/80 p-4 text-left transition hover:border-primary/40 hover:bg-primary/5">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 rounded-xl border border-primary/20 bg-primary/10 p-2 text-primary">
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm font-semibold text-foreground">{title}</div>
            {badge ? (
              <span className="rounded-full border border-border px-2 py-0.5 text-[11px] uppercase tracking-wide text-muted">
                {badge}
              </span>
            ) : null}
          </div>
          <p className="mt-2 text-sm leading-6 text-muted">{description}</p>
        </div>
      </div>
      <input
        type="file"
        accept=".md,text/markdown,text/plain"
        className="hidden"
        aria-label={ariaLabel ?? title}
        onChange={onChange}
      />
    </label>
  );
}

function supportsFileSystemAccess(): boolean {
  return typeof window !== "undefined" && !!window.showOpenFilePicker && !!window.showDirectoryPicker;
}

async function collectMarkdownFiles(
  directoryHandle: FileSystemDirectoryHandle,
  prefix = directoryHandle.name
): Promise<Array<{ path: string; handle: FileSystemFileHandle; source: string }>> {
  const discovered: Array<{ path: string; handle: FileSystemFileHandle; source: string }> = [];

  for await (const [name, handle] of directoryHandle.entries()) {
    const path = `${prefix}/${name}`;
    if (handle.kind === "file" && /\.md$/i.test(name)) {
      const file = await handle.getFile();
      discovered.push({ path, handle, source: await file.text() });
    }

    if (handle.kind === "directory") {
      discovered.push(...await collectMarkdownFiles(handle, path));
    }
  }

  return discovered;
}

