import { useEffect, useRef, useState, type ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import {
  FiBookOpen,
  FiCode,
  FiDownload,
  FiEdit2,
  FiFileText,
  FiGitBranch,
  FiHash,
  FiPlus,
  FiRotateCcw,
  FiSave,
  FiTrash2,
  FiUpload,
  FiX,
} from "react-icons/fi";
import { type MarcadoDocument, type MarkerRange } from "../lib/marcado";
import { type SldbValidationSummary } from "../lib/sldb-adapter";
import { type SelectionState, type ViewMode } from "../lib/workspace-state";
import { WorkspaceTopToolbar } from "./workspace-shell";

export type DocumentInterpretationMode = "runtime" | "fallback" | "local";
export type WorkspaceSurface = "marcado" | "sldb";

export function DocumentWorkspace({
  document,
  sourceValue,
  viewMode,
  notice,
  fileLabel,
  interpretationMode,
  validationSummary,
  workspaceSurface,
  selectionState,
  canUseNativeFiles,
  markerFilter,
  visibleMarkers,
  onChangeViewMode,
  onChangeWorkspaceSurface,
  onSourceChange,
  onSelectRange,
  onClearSelection,
  onAddMarker,
  onToggleMarkerFilter,
  onClearMarkerFilter,
  onRenameMarker,
  onDeleteMarker,
  onRefreshRuntime,
  onCheckSldbValidation,
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
  validationSummary: SldbValidationSummary | null;
  workspaceSurface: WorkspaceSurface;
  selectionState: SelectionState | null;
  canUseNativeFiles: boolean;
  markerFilter: string[];
  visibleMarkers: MarkerRange[];
  onChangeViewMode: (mode: ViewMode) => void;
  onChangeWorkspaceSurface: (surface: WorkspaceSurface) => void;
  onSourceChange: (value: string) => void;
  onSelectRange: (selection: SelectionState | null) => void;
  onClearSelection: () => void;
  onAddMarker: (namespace: string, classification: string) => void;
  onToggleMarkerFilter: (namespace: string) => void;
  onClearMarkerFilter: () => void;
  onRenameMarker: (marker: MarkerRange) => void;
  onDeleteMarker: (marker: MarkerRange) => void;
  onRefreshRuntime: () => void | Promise<void>;
  onCheckSldbValidation: () => void;
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

  const metadata = (
    <>
      {fileLabel ? <p className="text-xs text-muted/80">{fileLabel}</p> : null}
      <InterpretationModeBadge mode={interpretationMode} />
      {validationSummary ? <ValidationStateBadge state={validationSummary.state} /> : null}
    </>
  );

  return workspaceSurface === "marcado" ? (
    <div className="grid h-full min-w-0 xl:grid-cols-[minmax(0,1fr)_320px]">
      <section className="min-w-0 overflow-y-auto">
        <WorkspaceTopToolbar
          eyebrow="Marcado workspace"
          title={document.title}
          description="Use this surface to read, render, and edit the Markdown document. SLDB validation lives in its own secondary context."
          metadata={metadata}
          viewSwitcher={<DocumentViewSwitcher viewMode={viewMode} onChangeViewMode={onChangeViewMode} />}
          contextualActions={viewMode === "rendered" && selectionState ? (
            <MarkerComposer
              selectionText={selectionState.text}
              namespaces={document.namespaces.map((namespace) => namespace.name)}
              onAddMarker={onAddMarker}
              onCancel={onClearSelection}
            />
          ) : undefined}
          primaryActions={
            <MarcadoToolbarActions
              canUseNativeFiles={canUseNativeFiles}
              onRefreshRuntime={onRefreshRuntime}
              onSaveDraft={onSaveDraft}
              onLoad={onLoad}
              onSaveFile={onSaveFile}
              onReset={onReset}
              onDownload={onDownload}
              onOpenFile={onOpenFile}
              onExploreFiles={onExploreFiles}
              onUpload={onUpload}
              onOpenSldbContext={() => onChangeWorkspaceSurface("sldb")}
            />
          }
          notice={notice ? <span className="text-sm text-muted">{notice}</span> : undefined}
        />

        <DocumentContentSurface>
          {viewMode === "rendered" ? (
            <RenderedDocumentSurface
              document={document}
              visibleMarkers={visibleMarkers}
              renderedRef={renderedRef}
              onMouseUp={handleRenderedMouseUp}
            />
          ) : (
            <SourceEditorSurface sourceValue={sourceValue} onSourceChange={onSourceChange} />
          )}
        </DocumentContentSurface>
      </section>

      <MarcadoInspectorSurface
        document={document}
        markerFilter={markerFilter}
        visibleMarkers={visibleMarkers}
        onToggleMarkerFilter={onToggleMarkerFilter}
        onClearMarkerFilter={onClearMarkerFilter}
        onRenameMarker={onRenameMarker}
        onDeleteMarker={onDeleteMarker}
      />
    </div>
  ) : (
    <div className="grid h-full min-w-0 xl:grid-cols-[minmax(0,1fr)_320px]">
      <section className="min-w-0 overflow-y-auto">
        <WorkspaceTopToolbar
          eyebrow="SLDB context"
          title={document.title}
          description="Use this surface to understand contract readiness, document identity, and issues without mixing those checks into the main writing workspace."
          metadata={metadata}
          viewSwitcher={<SurfaceSwitcher current={workspaceSurface} onChangeWorkspaceSurface={onChangeWorkspaceSurface} />}
          primaryActions={
            <SldbToolbarActions
              onCheckSldbValidation={onCheckSldbValidation}
              onReturnToMarcado={() => onChangeWorkspaceSurface("marcado")}
            />
          }
          notice={notice ? <span className="text-sm text-muted">{notice}</span> : undefined}
        />

        <div className="space-y-6 p-6 lg:p-8">
          {validationSummary ? <SldbValidationCard validationSummary={validationSummary} /> : null}
          <SldbOverviewSurface document={document} />
        </div>
      </section>

      <SldbContextSidebar document={document} validationSummary={validationSummary} />
    </div>
  );
}

function DocumentViewSwitcher({
  viewMode,
  onChangeViewMode,
}: {
  viewMode: ViewMode;
  onChangeViewMode: (mode: ViewMode) => void;
}) {
  return (
    <div className="inline-flex self-start rounded-xl border border-border bg-surface p-1 lg:self-auto">
      <ViewButton active={viewMode === "rendered"} onClick={() => onChangeViewMode("rendered")} icon={<FiBookOpen />}>
        Rendered
      </ViewButton>
      <ViewButton active={viewMode === "source"} onClick={() => onChangeViewMode("source")} icon={<FiCode />}>
        Source
      </ViewButton>
    </div>
  );
}

function SurfaceSwitcher({
  current,
  onChangeWorkspaceSurface,
}: {
  current: WorkspaceSurface;
  onChangeWorkspaceSurface: (surface: WorkspaceSurface) => void;
}) {
  return (
    <div className="inline-flex self-start rounded-xl border border-border bg-surface p-1 lg:self-auto">
      <ViewButton active={current === "marcado"} onClick={() => onChangeWorkspaceSurface("marcado")} icon={<FiBookOpen />}>
        Marcado
      </ViewButton>
      <ViewButton active={current === "sldb"} onClick={() => onChangeWorkspaceSurface("sldb")} icon={<FiFileText />}>
        SLDB
      </ViewButton>
    </div>
  );
}

function MarcadoToolbarActions({
  canUseNativeFiles,
  onRefreshRuntime,
  onSaveDraft,
  onLoad,
  onSaveFile,
  onReset,
  onDownload,
  onOpenFile,
  onExploreFiles,
  onUpload,
  onOpenSldbContext,
}: {
  canUseNativeFiles: boolean;
  onRefreshRuntime: () => void | Promise<void>;
  onSaveDraft: () => void;
  onLoad: () => void;
  onSaveFile: () => void | Promise<void>;
  onReset: () => void;
  onDownload: () => void;
  onOpenFile: () => void | Promise<void>;
  onExploreFiles: () => void | Promise<void>;
  onUpload: React.ChangeEventHandler<HTMLInputElement>;
  onOpenSldbContext: () => void;
}) {
  return (
    <>
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
      <ActionButton onClick={onOpenSldbContext} icon={<FiFileText />} label="Open SLDB context" />
    </>
  );
}

function SldbToolbarActions({
  onCheckSldbValidation,
  onReturnToMarcado,
}: {
  onCheckSldbValidation: () => void;
  onReturnToMarcado: () => void;
}) {
  return (
    <>
      <ActionButton onClick={onCheckSldbValidation} icon={<FiFileText />} label="Check SLDB validation" />
      <ActionButton onClick={onReturnToMarcado} icon={<FiBookOpen />} label="Back to Marcado workspace" />
    </>
  );
}

function DocumentContentSurface({ children }: { children: ReactNode }) {
  return (
    <div className="p-6 lg:p-8">
      <div className="overflow-hidden rounded-3xl border border-border bg-surface shadow-sm">{children}</div>
    </div>
  );
}

function RenderedDocumentSurface({
  document,
  visibleMarkers,
  renderedRef,
  onMouseUp,
}: {
  document: MarcadoDocument;
  visibleMarkers: MarkerRange[];
  renderedRef: React.RefObject<HTMLDivElement | null>;
  onMouseUp: () => void;
}) {
  return (
    <div className="p-6 lg:p-8">
      <div ref={renderedRef} onMouseUp={onMouseUp} className="prose-content max-w-4xl select-text">
        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
          {buildHighlightedMarkdown(document.plainBody, visibleMarkers)}
        </ReactMarkdown>
      </div>
    </div>
  );
}

function SourceEditorSurface({
  sourceValue,
  onSourceChange,
}: {
  sourceValue: string;
  onSourceChange: (value: string) => void;
}) {
  return (
    <textarea
      aria-label="Marcado source editor"
      value={sourceValue}
      onChange={(event) => onSourceChange(event.target.value)}
      className="min-h-[70vh] w-full resize-y bg-surface p-6 font-mono text-sm leading-7 text-foreground outline-none lg:p-8"
      spellCheck={false}
    />
  );
}

function MarcadoInspectorSurface({
  document,
  markerFilter,
  visibleMarkers,
  onToggleMarkerFilter,
  onClearMarkerFilter,
  onRenameMarker,
  onDeleteMarker,
}: {
  document: MarcadoDocument;
  markerFilter: string[];
  visibleMarkers: MarkerRange[];
  onToggleMarkerFilter: (namespace: string) => void;
  onClearMarkerFilter: () => void;
  onRenameMarker: (marker: MarkerRange) => void;
  onDeleteMarker: (marker: MarkerRange) => void;
}) {
  return (
    <aside className="overflow-y-auto border-t border-border bg-surface xl:border-t-0 xl:border-l">
      <div className="space-y-5 p-5">
        <InfoCard icon={<FiFileText />} title="Document summary">
          <KeyValue label="ID" value={document.id} />
          <KeyValue label="Type" value={document.type} />
          <KeyValue label="Markers" value={String(document.markers.length)} />
        </InfoCard>

        <InfoCard icon={<FiCode />} title="Markers">
          <div className="mb-3 flex flex-wrap gap-2">
            {document.namespaces.map((namespace) => {
              const active = markerFilter.length === 0 || markerFilter.includes(namespace.name);
              return (
                <button
                  key={namespace.name}
                  onClick={() => onToggleMarkerFilter(namespace.name)}
                  className={`cursor-pointer rounded-full border px-2 py-1 text-xs ${active ? "border-primary/40 bg-primary/10 text-primary" : "border-border text-muted"}`}
                >
                  {namespace.name}
                </button>
              );
            })}
            {markerFilter.length > 0 ? (
              <button
                onClick={onClearMarkerFilter}
                className="cursor-pointer rounded-full border border-border px-2 py-1 text-xs text-muted"
              >
                Clear
              </button>
            ) : null}
          </div>
          <div className="space-y-3">
            {visibleMarkers.slice(0, 6).map((marker) => (
              <MarkerCard
                key={`${marker.key}-${marker.start}-${marker.end}`}
                marker={marker}
                onRename={() => onRenameMarker(marker)}
                onDelete={() => onDeleteMarker(marker)}
              />
            ))}
            {visibleMarkers.length > 6 ? (
              <EmptyState text={`${visibleMarkers.length - 6} more markers are hidden in this focused view.`} />
            ) : null}
            {visibleMarkers.length === 0 ? <EmptyState text="No markers match the active filters." /> : null}
          </div>
        </InfoCard>

        <details className="rounded-3xl border border-border bg-background p-4">
          <summary className="cursor-pointer list-none text-sm font-semibold uppercase tracking-[0.14em] text-muted">
            Advanced structure
          </summary>
          <div className="mt-4 space-y-5">
            <div>
              <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">Namespaces</div>
              <div className="space-y-3">
                {document.namespaces.map((namespace) => (
                  <div key={namespace.name} className="rounded-2xl border border-border bg-surface p-3">
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <span className="font-medium text-foreground">{namespace.name}</span>
                      <span className="text-[11px] uppercase tracking-wide text-primary">{namespace.projection || "n/a"}</span>
                    </div>
                    <div className="space-y-1 text-xs text-muted">
                      <div>allow_crossing: {String(namespace.allowCrossing ?? false)}</div>
                      <div>requires_addressable_nodes: {String(namespace.requiresAddressableNodes ?? false)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">Diagnostics</div>
              {document.diagnostics.length === 0 ? (
                <EmptyState text="No marker pairing issues are currently visible." />
              ) : (
                <ul className="space-y-2 text-sm text-warning">
                  {document.diagnostics.map((diagnostic) => (
                    <li key={diagnostic} className="rounded-xl border border-warning/20 bg-warning/10 p-3">
                      {diagnostic}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </details>
      </div>
    </aside>
  );
}

function SldbOverviewSurface({ document }: { document: MarcadoDocument }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <InfoCard icon={<FiFileText />} title="Document contract context">
        <div className="space-y-3">
          <KeyValue label="Document ID" value={document.id} />
          <KeyValue label="Contract" value={document.type ? `${document.type} contract` : "document contract"} />
          <KeyValue label="Namespaces" value={String(document.namespaces.length)} />
          <KeyValue label="Graph edges" value={String(document.graphEdges.length)} />
        </div>
      </InfoCard>

      <InfoCard icon={<FiHash />} title="Why this is separate">
        <div className="space-y-3 text-sm leading-6 text-muted">
          <p>Marcado editing and rendering are the day-to-day writing surface.</p>
          <p>SLDB context is where document contract readiness, advisories, and tracked-document preparation belong.</p>
          <p>This keeps writing tasks from competing with semantic workflow detail in the same default view.</p>
        </div>
      </InfoCard>

      <InfoCard icon={<FiGitBranch />} title="Graph edges">
        {document.graphEdges.length === 0 ? (
          <EmptyState text="No explicit graph edges declared." />
        ) : (
          <div className="space-y-3">
            {document.graphEdges.map((edge, index) => (
              <div key={`${edge.namespace}-${edge.type}-${index}`} className="rounded-2xl border border-border bg-background p-3 text-sm">
                <div className="font-medium text-primary">{edge.namespace}:{edge.type}</div>
                <div className="mt-2 break-words text-muted">{edge.from}</div>
                <div className="break-words text-muted">{edge.to}</div>
              </div>
            ))}
          </div>
        )}
      </InfoCard>

      <InfoCard icon={<FiCode />} title="Anchors in context">
        <div className="space-y-3">
          {document.markers.slice(0, 8).map((marker) => (
            <div key={marker.key} className="rounded-2xl border border-border bg-background p-3 text-sm">
              <div className="font-medium text-foreground">{marker.key}</div>
              <div className="mt-1 break-all text-xs text-primary">{marker.localAnchor}</div>
            </div>
          ))}
        </div>
      </InfoCard>
    </div>
  );
}

function SldbContextSidebar({
  document,
  validationSummary,
}: {
  document: MarcadoDocument;
  validationSummary: SldbValidationSummary | null;
}) {
  return (
    <aside className="overflow-y-auto border-t border-border bg-surface xl:border-t-0 xl:border-l">
      <div className="space-y-5 p-5">
        <InfoCard icon={<FiFileText />} title="Identity">
          <KeyValue label="ID" value={document.id} />
          <KeyValue label="Type" value={document.type} />
          <KeyValue label="Markers" value={String(document.markers.length)} />
          <KeyValue label="Diagnostics" value={String(document.diagnostics.length)} />
        </InfoCard>

        <InfoCard icon={<FiHash />} title="Advisories">
          {validationSummary?.advisoryNotes?.length ? (
            <ul className="space-y-2 text-sm text-muted">
              {validationSummary.advisoryNotes.map((note) => (
                <li key={note} className="rounded-xl border border-border bg-background p-3">
                  {note}
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState text="No extra SLDB advisories are visible right now." />
          )}
        </InfoCard>

        <InfoCard icon={<FiGitBranch />} title="Diagnostics">
          {document.diagnostics.length === 0 ? (
            <EmptyState text="No marker pairing issues are currently visible." />
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
      className={`inline-flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${
        active ? "bg-primary text-on-primary" : "text-muted hover:bg-background hover:text-foreground"
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
  const tone =
    mode === "runtime"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : mode === "fallback"
        ? "border-amber-200 bg-amber-50 text-amber-700"
        : "border-border bg-surface text-muted";
  const label = mode === "runtime" ? "Marcado runtime" : mode === "fallback" ? "Fallback parsing" : "Local parse";

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide ${tone}`}
    >
      {label}
    </span>
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

function SldbValidationCard({ validationSummary }: { validationSummary: SldbValidationSummary }) {
  return (
    <InfoCard icon={<FiFileText />} title="SLDB validation">
      <div className="space-y-3">
        <div className="rounded-2xl border border-border bg-background p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-sm font-medium text-foreground">{validationSummary.contractLabel}</div>
              <div className="mt-1 text-xs text-muted">Provenance: {validationSummary.provenance}</div>
            </div>
            <ValidationStateBadge state={validationSummary.state} />
          </div>
        </div>

        {validationSummary.blockingIssues.length > 0 ? (
          <div className="space-y-2">
            <div className="text-xs font-semibold uppercase tracking-wide text-muted">Blocking issues</div>
            <ul className="space-y-2 text-sm text-warning">
              {validationSummary.blockingIssues.map((issue) => (
                <li key={issue} className="rounded-xl border border-warning/20 bg-warning/10 p-3">
                  {issue}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <EmptyState text="No local structural blockers are visible through the SLDB seam right now." />
        )}
      </div>
    </InfoCard>
  );
}

function ValidationStateBadge({ state }: { state: SldbValidationSummary["state"] }) {
  const tone =
    state === "ready"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : "border-amber-200 bg-amber-50 text-amber-700";
  const label = state === "ready" ? "Ready" : "Needs attention";

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide ${tone}`}>
      {label}
    </span>
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
    <section className="rounded-3xl border border-border bg-surface p-5 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <div className="text-primary">{icon}</div>
        <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-muted">{title}</h3>
      </div>
      {children}
    </section>
  );
}

function KeyValue({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-background px-3 py-2 text-sm">
      <span className="text-muted">{label}</span>
      <span className="break-all text-right font-medium text-foreground">{value}</span>
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
        <div className="break-words text-sm font-medium text-foreground">{marker.key}</div>
        <div className="flex gap-1">
          <button
            onClick={onRename}
            aria-label={`Rename ${marker.key}`}
            className="cursor-pointer rounded-md border border-border p-1 text-muted hover:bg-surface-hover"
          >
            <FiEdit2 />
          </button>
          <button
            onClick={onDelete}
            aria-label={`Delete ${marker.key}`}
            className="cursor-pointer rounded-md border border-border p-1 text-muted hover:bg-surface-hover"
          >
            <FiTrash2 />
          </button>
        </div>
      </div>
      <div className="mt-1 break-all text-xs text-primary">{marker.localAnchor}</div>
      <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-muted">
        <span className="rounded-full border border-border px-2 py-1">{marker.namespace}</span>
        <span className="rounded-full border border-border px-2 py-1">{marker.start}–{marker.end}</span>
      </div>
      <p className="mt-3 text-sm leading-6 text-muted">{marker.text || "(empty range)"}</p>
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
      <span className="max-w-48 truncate text-xs text-muted">“{selectionText}”</span>
      <select
        aria-label="Marker namespace"
        value={namespace}
        onChange={(event) => setNamespace(event.target.value)}
        className="rounded-lg border border-border bg-background px-2 py-1.5 text-sm text-foreground outline-none"
      >
        {namespaces.length > 0 ? (
          namespaces.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))
        ) : (
          <option value="sem">sem</option>
        )}
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
        className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-primary px-3 py-1.5 text-sm text-on-primary"
      >
        <FiPlus />
        Add marker
      </button>
      <button
        onClick={onCancel}
        className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-sm text-muted hover:bg-background"
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

  const boundaries = Array.from(new Set([0, markdown.length, ...markers.flatMap((marker) => [marker.start, marker.end])])).sort(
    (a, b) => a - b
  );

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
  return value.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}
