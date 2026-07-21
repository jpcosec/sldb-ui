import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import {
  FiBookOpen,
  FiCode,
  FiDownload,
  FiEdit2,
  FiFile,
  FiFileText,
  FiFolder,
  FiGitBranch,
  FiHash,
  FiPlus,
  FiRotateCcw,
  FiSave,
  FiTrash2,
  FiUpload,
  FiX,
} from "react-icons/fi";
import { loadDocuments } from "./data/documents";
import { marcadoAdapter } from "./lib/marcado-adapter";
import { type MarcadoDocument, type MarkerRange } from "./lib/marcado";
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

type DocumentInterpretationMode = "runtime" | "fallback" | "local";

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
    const body = currentSource.slice(selectedDoc.bodySourceStart);
    const nextBody =
      body.slice(0, marker.closeMarkerStart) +
      body.slice(marker.closeMarkerEnd);
    const adjustedOpenStart = marker.openMarkerStart;
    const adjustedOpenEnd = marker.openMarkerEnd;
    const finalBody =
      nextBody.slice(0, adjustedOpenStart) +
      nextBody.slice(adjustedOpenEnd);
    const nextSource = currentSource.slice(0, selectedDoc.bodySourceStart) + finalBody;
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
    const body = currentSource.slice(selectedDoc.bodySourceStart);
    const openRaw = body.slice(marker.openMarkerStart, marker.openMarkerEnd);
    const closeRaw = body.slice(marker.closeMarkerStart, marker.closeMarkerEnd);
    const nextOpenRaw = openRaw.replace(marker.key, nextKey);
    const nextCloseRaw = closeRaw.replace(marker.key, nextKey);
    const nextBody =
      body.slice(0, marker.openMarkerStart) +
      nextOpenRaw +
      body.slice(marker.openMarkerEnd, marker.closeMarkerStart) +
      nextCloseRaw +
      body.slice(marker.closeMarkerEnd);
    const nextSource = currentSource.slice(0, selectedDoc.bodySourceStart) + nextBody;
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
    <div className="h-screen w-screen overflow-hidden bg-background text-foreground">
      <div className="grid h-full lg:grid-cols-[300px_minmax(0,1fr)]">
        <aside className="border-b border-border bg-surface lg:border-r lg:border-b-0 overflow-y-auto">
          <div className="p-5 border-b border-border">
            <p className="text-xs uppercase tracking-[0.18em] text-primary font-semibold mb-2">
              @sldb/ui
            </p>
            <h1 className="text-2xl font-heading font-semibold mb-2">
              Open a structured Markdown document
            </h1>
            <p className="text-sm text-muted leading-6">
              Start with a local file, upload Markdown into this session, open a sample document,
              or resume a saved draft. This workspace is the human entry surface for Marcado-compatible documents.
            </p>
          </div>

          <div className="p-4 space-y-5">
            <section className="space-y-3">
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-muted">Start here</h2>
                <p className="mt-2 text-sm text-muted leading-6">
                  Pick the fastest path into the workspace. The current document tools stay available below once you are inside.
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

            <section className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-muted">Sample documents</h2>
                <span className="text-xs text-muted">{sampleDocuments.length} available</span>
              </div>
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
            </section>

            {draftEntries.length > 0 ? (
              <section className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-muted">Saved drafts</h2>
                  <span className="text-xs text-muted">{draftEntries.length} ready to resume</span>
                </div>
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
              </section>
            ) : null}

            <section className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-muted">Workspace files</h2>
                <div className="flex gap-2">
                  <ActionButton onClick={handleCreateFile} icon={<FiPlus />} label="New file" />
                  <ActionButton onClick={handleRenameFile} icon={<FiEdit2 />} label="Rename" />
                </div>
              </div>
              <FileExplorerTree
                documents={documents}
                entries={workspaceEntries}
                selectedSlug={selectedSlug}
                onSelect={setSelectedSlug}
              />
            </section>
          </div>
        </aside>

        <main className="min-w-0 overflow-hidden">
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
        </main>
      </div>
    </div>
  );
}

function DocumentWorkspace({
  document,
  sourceValue,
  viewMode,
  notice,
  fileLabel,
  interpretationMode,
  selectionState,
  canUseNativeFiles,
  markerFilter,
  visibleMarkers,
  onChangeViewMode,
  onSourceChange,
  onSelectRange,
  onClearSelection,
  onAddMarker,
  onToggleMarkerFilter,
  onClearMarkerFilter,
  onRenameMarker,
  onDeleteMarker,
  onRefreshRuntime,
  onSaveDraft,
  onSaveFile,
  onLoad,
  onReset,
  onDownload,
  onUpload,
  onOpenFile,
  onExploreFiles,
}: {
  document: MarcadoDocument;
  sourceValue: string;
  viewMode: ViewMode;
  notice: string;
  fileLabel: string | null;
  interpretationMode: DocumentInterpretationMode;
  selectionState: SelectionState | null;
  canUseNativeFiles: boolean;
  markerFilter: string[];
  visibleMarkers: MarkerRange[];
  onChangeViewMode: (mode: ViewMode) => void;
  onSourceChange: (value: string) => void;
  onSelectRange: (selection: SelectionState | null) => void;
  onClearSelection: () => void;
  onAddMarker: (namespace: string, classification: string) => void;
  onToggleMarkerFilter: (namespace: string) => void;
  onClearMarkerFilter: () => void;
  onRenameMarker: (marker: MarkerRange) => void;
  onDeleteMarker: (marker: MarkerRange) => void;
  onRefreshRuntime: () => void | Promise<void>;
  onSaveDraft: () => void;
  onSaveFile: () => void | Promise<void>;
  onLoad: () => void;
  onReset: () => void;
  onDownload: () => void;
  onUpload: React.ChangeEventHandler<HTMLInputElement>;
  onOpenFile: () => void | Promise<void>;
  onExploreFiles: () => void | Promise<void>;
}) {
  const renderedRef = useRef<HTMLDivElement | null>(null);

  const handleRenderedMouseUp = () => {
    if (viewMode !== "rendered") return;
    const container = renderedRef.current;
    if (!container) return;

    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || !selection.toString().trim()) {
      onSelectRange(null);
      return;
    }

    if (!container.contains(selection.anchorNode) || !container.contains(selection.focusNode)) {
      onSelectRange(null);
      return;
    }

    const start = Math.min(
      getTextOffset(container, selection.anchorNode!, selection.anchorOffset),
      getTextOffset(container, selection.focusNode!, selection.focusOffset)
    );
    const end = Math.max(
      getTextOffset(container, selection.anchorNode!, selection.anchorOffset),
      getTextOffset(container, selection.focusNode!, selection.focusOffset)
    );

    if (end <= start) {
      onSelectRange(null);
      return;
    }

    onSelectRange({ start, end, text: selection.toString().trim() });
  };

  return (
    <div className="grid h-full min-w-0 xl:grid-cols-[minmax(0,1fr)_360px]">
      <section className="min-w-0 overflow-y-auto">
        <header className="sticky top-0 z-10 border-b border-border bg-background/92 backdrop-blur px-6 py-5 lg:px-8">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-sm text-primary font-medium mb-1">{document.id}</p>
                <h2 className="text-3xl font-heading font-semibold">{document.title}</h2>
                <p className="text-sm text-muted mt-2 max-w-3xl leading-6">
                  Human entry surface for structured Markdown: open documents, compare rendered and source views,
                  inspect markers, and keep Markdown as the source of truth.
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {fileLabel ? <p className="text-xs text-muted/80">{fileLabel}</p> : null}
                  <InterpretationModeBadge mode={interpretationMode} />
                </div>
              </div>

              <div className="inline-flex rounded-xl border border-border bg-surface p-1 self-start lg:self-auto">
                <ViewButton active={viewMode === "rendered"} onClick={() => onChangeViewMode("rendered")} icon={<FiBookOpen />}>
                  Rendered
                </ViewButton>
                <ViewButton active={viewMode === "source"} onClick={() => onChangeViewMode("source")} icon={<FiCode />}>
                  Source
                </ViewButton>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {viewMode === "rendered" && selectionState ? (
                <MarkerComposer
                  selectionText={selectionState.text}
                  namespaces={document.namespaces.map((namespace) => namespace.name)}
                  onAddMarker={onAddMarker}
                  onCancel={onClearSelection}
                />
              ) : null}
              <ActionButton onClick={onRefreshRuntime} icon={<FiGitBranch />} label="Refresh runtime" />
              <ActionButton onClick={onSaveDraft} icon={<FiSave />} label="Save draft" />
              <ActionButton onClick={onLoad} icon={<FiUpload />} label="Load draft" />
              <ActionButton onClick={onSaveFile} icon={<FiSave />} label="Save file" />
              <ActionButton onClick={onReset} icon={<FiRotateCcw />} label="Reset" />
              <ActionButton onClick={onDownload} icon={<FiDownload />} label="Download" />
              {canUseNativeFiles ? (
                <>
                  <ActionButton onClick={onOpenFile} icon={<FiUpload />} label="Open file" />
                  <ActionButton onClick={onExploreFiles} icon={<FiHash />} label="Explore folder" />
                </>
              ) : null}
              <UploadActionButton onChange={onUpload} />
              {notice ? <span className="text-sm text-muted">{notice}</span> : null}
            </div>
          </div>
        </header>

        <div className="p-6 lg:p-8">
          <div className="rounded-3xl border border-border bg-surface shadow-sm overflow-hidden">
            {viewMode === "rendered" ? (
              <div className="p-6 lg:p-8">
                <div ref={renderedRef} onMouseUp={handleRenderedMouseUp} className="prose-content max-w-4xl select-text">
                  <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                    {buildHighlightedMarkdown(document.plainBody, visibleMarkers)}
                  </ReactMarkdown>
                </div>
              </div>
            ) : (
              <textarea
                aria-label="Marcado source editor"
                value={sourceValue}
                onChange={(event) => onSourceChange(event.target.value)}
                className="min-h-[70vh] w-full resize-y bg-surface p-6 font-mono text-sm leading-7 text-foreground outline-none lg:p-8"
                spellCheck={false}
              />
            )}
          </div>
        </div>
      </section>

      <aside className="border-t border-border bg-surface overflow-y-auto xl:border-t-0 xl:border-l">
        <div className="p-5 space-y-5">
          <InfoCard icon={<FiFileText />} title="Document">
            <KeyValue label="ID" value={document.id} />
            <KeyValue label="Type" value={document.type} />
            <KeyValue label="Markers" value={String(document.markers.length)} />
            <KeyValue label="Edges" value={String(document.graphEdges.length)} />
          </InfoCard>

          <InfoCard icon={<FiHash />} title="Namespaces">
            <div className="space-y-3">
              {document.namespaces.map((namespace) => (
                <div key={namespace.name} className="rounded-2xl border border-border bg-background p-3">
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <span className="font-medium text-foreground">{namespace.name}</span>
                    <span className="text-[11px] uppercase tracking-wide text-primary">
                      {namespace.projection || "n/a"}
                    </span>
                  </div>
                  <div className="text-xs text-muted space-y-1">
                    <div>allow_crossing: {String(namespace.allowCrossing ?? false)}</div>
                    <div>
                      requires_addressable_nodes: {String(namespace.requiresAddressableNodes ?? false)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </InfoCard>

          <InfoCard icon={<FiGitBranch />} title="Graph edges">
            {document.graphEdges.length === 0 ? (
              <EmptyState text="No explicit graph edges declared." />
            ) : (
              <div className="space-y-3">
                {document.graphEdges.map((edge, index) => (
                  <div key={`${edge.namespace}-${edge.type}-${index}`} className="rounded-2xl border border-border bg-background p-3 text-sm">
                    <div className="text-primary font-medium mb-2">{edge.namespace}:{edge.type}</div>
                    <div className="text-muted break-words">from {edge.from}</div>
                    <div className="text-muted break-words">to {edge.to}</div>
                  </div>
                ))}
              </div>
            )}
          </InfoCard>

          <InfoCard icon={<FiCode />} title="Marker ranges">
            <div className="mb-3 flex flex-wrap gap-2">
              {document.namespaces.map((namespace) => {
                const active = markerFilter.length === 0 || markerFilter.includes(namespace.name);
                return (
                  <button
                    key={namespace.name}
                    onClick={() => onToggleMarkerFilter(namespace.name)}
                    className={`rounded-full border px-2 py-1 text-xs cursor-pointer ${active ? "border-primary/40 bg-primary/10 text-primary" : "border-border text-muted"}`}
                  >
                    {namespace.name}
                  </button>
                );
              })}
              {markerFilter.length > 0 ? (
                <button onClick={onClearMarkerFilter} className="rounded-full border border-border px-2 py-1 text-xs text-muted cursor-pointer">
                  Clear
                </button>
              ) : null}
            </div>
            <div className="space-y-3">
              {visibleMarkers.map((marker) => (
                <MarkerCard
                  key={`${marker.key}-${marker.start}-${marker.end}`}
                  marker={marker}
                  onRename={() => onRenameMarker(marker)}
                  onDelete={() => onDeleteMarker(marker)}
                />
              ))}
              {visibleMarkers.length === 0 ? <EmptyState text="No markers match the active filters." /> : null}
            </div>
          </InfoCard>

          <InfoCard icon={<FiFileText />} title="Diagnostics">
            {document.diagnostics.length === 0 ? (
              <EmptyState text="No marker pairing issues found in this example." />
            ) : (
              <ul className="space-y-2 text-sm text-warning">
                {document.diagnostics.map((diagnostic) => (
                  <li key={diagnostic} className="rounded-xl border border-warning/20 bg-warning/10 p-3">
                    {diagnostic}
                  </li>
                ))}
              </ul>
            )}
          </InfoCard>
        </div>
      </aside>
    </div>
  );
}

function FileExplorerTree({
  documents,
  entries,
  selectedSlug,
  onSelect,
}: {
  documents: MarcadoDocument[];
  entries: WorkspaceEntry[];
  selectedSlug: string;
  onSelect: (slug: string) => void;
}) {
  const nodes = buildFileTree(entries, documents);
  return (
    <div className="space-y-1">
      {nodes.map((node) => (
        <FileTreeNodeView key={node.path} node={node} selectedSlug={selectedSlug} onSelect={onSelect} depth={0} />
      ))}
    </div>
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
        <div className="mb-1 flex items-center gap-2 px-2 text-xs uppercase tracking-wide text-muted" style={{ paddingLeft: `${depth * 12 + 8}px` }}>
          <FiFolder /> {node.name}
        </div>
        <div className="space-y-1">
          {node.children.map((child) => (
            <FileTreeNodeView key={child.path} node={child} selectedSlug={selectedSlug} onSelect={onSelect} depth={depth + 1} />
          ))}
        </div>
      </div>
    );
  }

  const selected = node.slug === selectedSlug;
  return (
    <button
      onClick={() => onSelect(node.slug)}
      className={`w-full rounded-xl border p-3 text-left transition cursor-pointer ${selected ? "border-primary/40 bg-primary/10" : "border-border bg-background hover:bg-surface-hover"}`}
      style={{ marginLeft: `${depth * 12}px` }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground"><FiFile className="shrink-0" /> <span className="truncate">{node.title}</span></div>
          <div className="mt-1 text-xs text-muted truncate">{node.path}</div>
        </div>
        <span className="rounded-full border border-border px-2 py-0.5 text-[11px] text-muted uppercase tracking-wide">{node.origin}</span>
      </div>
      <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted">
        <span className="rounded-full bg-surface px-2 py-1 border border-border">{node.markers} markers</span>
        <span className="rounded-full bg-surface px-2 py-1 border border-border">{node.namespaces} namespaces</span>
      </div>
    </button>
  );
}

function ViewButton({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition cursor-pointer ${
        active
          ? "bg-primary text-on-primary"
          : "text-muted hover:bg-background hover:text-foreground"
      }`}
    >
      {icon}
      {children}
    </button>
  );
}

function ActionButton({ onClick, icon, label }: { onClick: () => void; icon: ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground hover:bg-surface-hover"
    >
      {icon}
      {label}
    </button>
  );
}

function InterpretationModeBadge({ mode }: { mode: DocumentInterpretationMode }) {
  const tone = mode === "runtime"
    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
    : mode === "fallback"
      ? "border-amber-200 bg-amber-50 text-amber-700"
      : "border-border bg-surface text-muted";
  const label = mode === "runtime"
    ? "Marcado runtime"
    : mode === "fallback"
      ? "Fallback parsing (degraded)"
      : "Local parse";

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide ${tone}`}>
      {label}
    </span>
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
      className={`block w-full rounded-2xl border p-4 text-left transition ${
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

function UploadActionButton({ onChange }: { onChange: React.ChangeEventHandler<HTMLInputElement> }) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground hover:bg-surface-hover">
      <FiUpload />
      <span>Upload file</span>
      <input
        type="file"
        accept=".md,text/markdown,text/plain"
        className="hidden"
        aria-label="Upload file"
        onChange={onChange}
      />
    </label>
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
    <label className="block cursor-pointer rounded-2xl border border-border bg-background p-4 text-left transition hover:border-primary/40 hover:bg-primary/5">
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

function InfoCard({
  icon,
  title,
  children,
}: {
  icon: ReactNode;
  title: string;
  children: ReactNode;
}) {
  return (
    <section>
      <div className="flex items-center gap-2 mb-3">
        <div className="text-primary">{icon}</div>
        <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-muted">
          {title}
        </h3>
      </div>
      {children}
    </section>
  );
}

function KeyValue({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-background px-3 py-2 text-sm">
      <span className="text-muted">{label}</span>
      <span className="font-medium text-foreground text-right break-all">{value}</span>
    </div>
  );
}

function MarkerCard({
  marker,
  onRename,
  onDelete,
}: {
  marker: MarkerRange;
  onRename: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="rounded-2xl border border-border bg-background p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="text-sm font-medium text-foreground break-words">{marker.key}</div>
        <div className="flex gap-1">
          <button onClick={onRename} aria-label={`Rename ${marker.key}`} className="rounded-md border border-border p-1 text-muted hover:bg-surface-hover cursor-pointer"><FiEdit2 /></button>
          <button onClick={onDelete} aria-label={`Delete ${marker.key}`} className="rounded-md border border-border p-1 text-muted hover:bg-surface-hover cursor-pointer"><FiTrash2 /></button>
        </div>
      </div>
      <div className="mt-1 text-xs text-primary break-all">{marker.localAnchor}</div>
      <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-muted">
        <span className="rounded-full border border-border px-2 py-1">{marker.namespace}</span>
        <span className="rounded-full border border-border px-2 py-1">
          {marker.start}–{marker.end}
        </span>
        <span className="rounded-full border border-border px-2 py-1">
          {marker.facets.map((facet) => facet.join(".")).join(" | ")}
        </span>
      </div>
      <p className="mt-3 text-sm text-muted leading-6">{marker.text || "(empty range)"}</p>
    </div>
  );
}

function MarkerComposer({
  selectionText,
  namespaces,
  onAddMarker,
  onCancel,
}: {
  selectionText: string;
  namespaces: string[];
  onAddMarker: (namespace: string, classification: string) => void;
  onCancel: () => void;
}) {
  const [namespace, setNamespace] = useState(namespaces[0] ?? "sem");
  const [classification, setClassification] = useState("");

  useEffect(() => {
    setNamespace(namespaces[0] ?? "sem");
    setClassification("");
  }, [selectionText, namespaces]);

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-primary/30 bg-primary/8 px-3 py-2">
      <span className="text-xs text-muted max-w-48 truncate">“{selectionText}”</span>
      <select
        aria-label="Marker namespace"
        value={namespace}
        onChange={(event) => setNamespace(event.target.value)}
        className="rounded-lg border border-border bg-background px-2 py-1.5 text-sm text-foreground outline-none"
      >
        {namespaces.length > 0 ? namespaces.map((item) => (
          <option key={item} value={item}>{item}</option>
        )) : <option value="sem">sem</option>}
      </select>
      <input
        aria-label="Marker classification"
        value={classification}
        onChange={(event) => setClassification(event.target.value)}
        placeholder="concept.new_marker"
        className="min-w-48 rounded-lg border border-border bg-background px-2 py-1.5 text-sm text-foreground outline-none"
      />
      <button
        onClick={() => onAddMarker(namespace, classification)}
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-1.5 text-sm text-on-primary cursor-pointer"
      >
        <FiPlus />
        Add marker
      </button>
      <button
        onClick={onCancel}
        className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-sm text-muted cursor-pointer hover:bg-background"
      >
        <FiX />
        Cancel
      </button>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return <div className="rounded-2xl border border-dashed border-border p-4 text-sm text-muted">{text}</div>;
}

function buildHighlightedMarkdown(markdown: string, markers: MarkerRange[]): string {
  if (markers.length === 0) return markdown;

  const boundaries = Array.from(
    new Set([0, markdown.length, ...markers.flatMap((marker) => [marker.start, marker.end])])
  ).sort((a, b) => a - b);

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

function getTextOffset(container: Node, node: Node, offset: number): number {
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

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
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

      let folder = level.find((node): node is Extract<FileTreeNode, { kind: "folder" }> => node.kind === "folder" && node.path === currentPath);
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
    .map((node) => node.kind === "folder" ? { ...node, children: sortTreeNodes(node.children) } : node);
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

