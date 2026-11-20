FILE:desk/tasks/task-extraer-a-src-lib-los-helpers-puros-de-marcadores-resaltado-offset-de-selección-borrar-y-renombrar-y.md
---
sldb:
  by: agent
  at: '2026-11-16T05:10:57Z'
  authority: generated
  via: save_document_payload
id: task-extraer-a-src-lib-los-helpers-puros-de-marcadores-resaltado-offset-de-selección-borrar-y-renombrar-y
status: draft
summary: ''
tags:
- workspace:desk
- artifact:task
- host:local
current_node: ritual-execution
history: []
references:
- 7f0579a:desk/drawer/report-ui-purpose-gap.md (git show)
depends_on: []
pills: []
files:
- src/lib/marker-render.ts
- src/lib/marker-edit.ts
- src/components/document-workspace.tsx
- src/App.tsx
- src/__tests__/marker-render.test.ts
- src/__tests__/marker-edit.test.ts
- src/data/marcado-canonical-example.md
task_type: task.refactor
inherits_from: []
inherit_acceptance_context: false
atoms: []
from_drawer: desk/drawer/report-ui-purpose-gap.md
---

# Extraer a src/lib los helpers puros de marcadores (resaltado, offset de selección, borrar y renombrar) y cubrirlos con tests unitarios

## Rationale

_Explain why this task exists or the business driver behind it._

El hueco 10 del reporte del drawer (desk/drawer/report-ui-purpose-gap.md) señala que la lógica que reescribe el texto fuente de un documento Marcado no tiene tests unitarios; solo se prueba de forma indirecta, renderizando App con React Testing Library. Esa lógica está repartida así (verificado el 2026-11-16 en el commit 4515a8b):
- buildHighlightedMarkdown, getTextOffset y escapeHtml: funciones no exportadas en src/components/document-workspace.tsx, cerca de las líneas 611 a 665.
- El corte de texto de handleDeleteMarker y handleRenameMarker: closures dentro de src/App.tsx, líneas 511 a 553, que usan los offsets openMarkerStart/End y closeMarkerStart/End de MarkerRange, relativos al cuerpo después de bodySourceStart.
Un error de offset en estas funciones corrompe el documento del usuario sin que ningún test lo detecte.

## Goal

_Describe the concrete result this task must produce._

Dejar esas funciones como funciones puras exportadas en src/lib, con tests unitarios propios, sin cambiar el comportamiento de la UI.

## Scope

_State what is in scope and what is out of scope._

ENTRA:
(a) Crear src/lib/marker-render.ts con buildHighlightedMarkdown(markdown, markers), getTextOffset(container, node, offset) y escapeHtml(value), movidas sin cambios de lógica desde document-workspace.tsx, que pasa a importarlas.
(b) Crear src/lib/marker-edit.ts con removeMarkerFromSource(source, bodySourceStart, marker): string y renameMarkerInSource(source, bodySourceStart, marker, nextKey): string. Contienen exactamente el corte de texto que hoy hacen handleDeleteMarker y handleRenameMarker. App.tsx las llama y conserva el window.prompt, el estado y los avisos.
(c) Tests en src/__tests__/marker-render.test.ts y src/__tests__/marker-edit.test.ts:
  - sin marcadores;
  - un marcador;
  - marcadores solapados de dos namespaces (las clases marker-highlight-<ns> combinadas y data-marker-count);
  - escape de comillas y < > en el title;
  - getTextOffset sobre un DOM jsdom con nodos anidados;
  - borrar un marcador deja el texto interior intacto y quita el marcador de apertura y el de cierre;
  - renombrar cambia la clave en la apertura y en el cierre y no toca otras ocurrencias del texto;
  - un documento con frontmatter (bodySourceStart > 0), usando src/data/marcado-canonical-example.md.
NO ENTRA:
- corregir bugs que aparezcan; si un test revela uno, se deja el test marcado con it.fails y una nota en el handoff;
- cambiar la UI, los estilos o el parser (src/lib/marcado.ts);
- tocar el código legacy de anotaciones, que es otra tarea.

## Implementation Path

_Outline the expected implementation route or affected surface._

Repo: /home/jp/proyectos/SLDB_1/UIs/marcado-ui, rama main, máquina local.
1) Goldens: `TMPDIR=/dev/shm npx vitest run src/__tests__/integration.test.tsx src/__tests__/marcado-ui.ux.test.tsx` antes del cambio, con la salida guardada en runs/subagents/<run>/goldens-before.txt y registrada con `deskops review record <task> --kind goldens --evidence <archivo> --reason ... --root .`.
2) Mover las tres funciones a src/lib/marker-render.ts y extraer las dos funciones de edición a src/lib/marker-edit.ts.
3) Ajustar los imports en src/components/document-workspace.tsx y src/App.tsx.
4) Escribir los dos archivos de test.
5) Repetir los goldens: mismos resultados.
6) `npm run build`.

## Validation

_List the checks required before this task can close._

- cd /home/jp/proyectos/SLDB_1/UIs/marcado-ui && TMPDIR=/dev/shm npx vitest run src/__tests__/marker-render.test.ts src/__tests__/marker-edit.test.ts
- cd /home/jp/proyectos/SLDB_1/UIs/marcado-ui && TMPDIR=/dev/shm npx vitest run
- cd /home/jp/proyectos/SLDB_1/UIs/marcado-ui && npm run build
- cd /home/jp/proyectos/SLDB_1/UIs/marcado-ui && ! grep -n "function buildHighlightedMarkdown\|function getTextOffset" src/components/document-workspace.tsx

## Done When

_Name the observable condition that makes the task complete._

- src/lib/marker-render.ts y src/lib/marker-edit.ts existen y exportan las cinco funciones.
- document-workspace.tsx ya no define buildHighlightedMarkdown, getTextOffset ni escapeHtml.
- App.tsx ya no corta texto con body.slice para borrar o renombrar marcadores.
- Los dos tests nuevos pasan y cubren los ocho casos del scope.
- integration y marcado-ui.ux pasan con el mismo conteo que en goldens-before.txt.
- `npm run build` termina con exit 0.

FILE:desk/rituals/execution.md
---
id: ritual-execution
steps: []
tags:
- workspace:desk
---

# Execution ritual

Review the board, bind the relevant pills, keep scope tight, and implement only the active task for marcado-ui.

FILE:desk/rituals/testing.md
---
id: ritual-testing
steps: []
tags:
- workspace:desk
---

# Testing ritual

Run the smallest relevant validation first, then broaden coverage when marcado-ui changes shared behavior.

FILE:desk/rituals/closeout.md
---
id: ritual-closeout
steps: []
tags:
- workspace:desk
---

# Closeout ritual

Close a marcado-ui task only after validation passes, the board is updated, and the final change is ready to commit.

FILE:src/components/document-workspace.tsx
import { useEffect, useRef, useState, type ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import {
  FiBookOpen,
  FiCode,
  FiDownload,
  FiEdit2,
  FiEye,
  FiGitBranch,
  FiHash,
  FiLayers,
  FiPlus,
  FiRotateCcw,
  FiSave,
  FiSliders,
  FiTrash2,
  FiUpload,
  FiX,
} from "react-icons/fi";
import { type MarcadoDocument, type MarkerRange } from "../lib/marcado";
import { type SelectionState, type ViewMode } from "../lib/workspace-state";
import { WorkspaceTopToolbar } from "./workspace-shell";

export type DocumentInterpretationMode = "runtime" | "fallback" | "local";

export function DocumentWorkspace({
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
  onSetMarkerFilter,
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
  onSetMarkerFilter: (nextFilter: string[]) => void;
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
    <div className="grid h-full min-w-0 xl:grid-cols-[minmax(0,1fr)_320px]">
      <section className="min-w-0 overflow-y-auto">
        <WorkspaceTopToolbar
          eyebrow="@marcado/ui"
          title={document.title}
          description="Read, filter, inspect, and edit semantic Markdown without mixing in unrelated workflow surfaces."
          metadata={
            <>
              {fileLabel ? <p className="text-xs text-muted/80">{fileLabel}</p> : null}
              <InterpretationModeBadge mode={interpretationMode} />
            </>
          }
          viewSwitcher={
            <div className="space-y-3">
              <DocumentViewSwitcher viewMode={viewMode} onChangeViewMode={onChangeViewMode} />
              <FocusModeStrip
                viewMode={viewMode}
                markerFilter={markerFilter}
                onChangeViewMode={onChangeViewMode}
                onSetMarkerFilter={onSetMarkerFilter}
              />
            </div>
          }
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
            />
          }
          notice={notice ? <span className="text-sm text-muted">{notice}</span> : undefined}
        />

        <DocumentContentSurface>
          <WorkspaceStageSummary document={document} visibleMarkers={visibleMarkers} viewMode={viewMode} markerFilter={markerFilter} />
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
        onSetMarkerFilter={onSetMarkerFilter}
        onClearMarkerFilter={onClearMarkerFilter}
        onRenameMarker={onRenameMarker}
        onDeleteMarker={onDeleteMarker}
      />
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

function FocusModeStrip({
  viewMode,
  markerFilter,
  onChangeViewMode,
  onSetMarkerFilter,
}: {
  viewMode: ViewMode;
  markerFilter: string[];
  onChangeViewMode: (mode: ViewMode) => void;
  onSetMarkerFilter: (nextFilter: string[]) => void;
}) {
  const activeMode =
    viewMode === "source"
      ? "source"
      : markerFilter.length === 0
        ? "all"
        : markerFilter.length === 1 && markerFilter[0] === "struct"
          ? "struct"
          : markerFilter.length === 1 && markerFilter[0] === "sem"
            ? "sem"
            : markerFilter.length === 1 && markerFilter[0] === "rhet"
              ? "rhet"
              : "custom";

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-border bg-background/70 p-2">
      <FocusModeButton active={activeMode === "all"} icon={<FiLayers />} label="All" onClick={() => { onChangeViewMode("rendered"); onSetMarkerFilter([]); }} />
      <FocusModeButton active={activeMode === "struct"} icon={<FiSliders />} label="Structure" onClick={() => { onChangeViewMode("rendered"); onSetMarkerFilter(["struct"]); }} />
      <FocusModeButton active={activeMode === "sem"} icon={<FiHash />} label="Semantics" onClick={() => { onChangeViewMode("rendered"); onSetMarkerFilter(["sem"]); }} />
      <FocusModeButton active={activeMode === "rhet"} icon={<FiGitBranch />} label="Rhetoric" onClick={() => { onChangeViewMode("rendered"); onSetMarkerFilter(["rhet"]); }} />
      <FocusModeButton active={activeMode === "source"} icon={<FiCode />} label="Source" onClick={() => onChangeViewMode("source")} />
      {activeMode === "custom" ? <span className="rounded-full border border-border px-2 py-1 text-[11px] uppercase tracking-wide text-muted">Custom filter</span> : null}
    </div>
  );
}

function FocusModeButton({ active, icon, label, onClick }: { active: boolean; icon: ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-sm transition ${active ? "bg-primary text-on-primary shadow-sm" : "text-muted hover:bg-surface hover:text-foreground"}`}
    >
      {icon}
      {label}
    </button>
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
    </>
  );
}

function DocumentContentSurface({ children }: { children: ReactNode }) {
  return (
    <div className="p-5 lg:p-8">
      <div className="overflow-hidden rounded-[2rem] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0.01))] shadow-[0_24px_80px_rgba(0,0,0,0.28)]">
        {children}
      </div>
    </div>
  );
}

function WorkspaceStageSummary({
  document,
  visibleMarkers,
  viewMode,
  markerFilter,
}: {
  document: MarcadoDocument;
  visibleMarkers: MarkerRange[];
  viewMode: ViewMode;
  markerFilter: string[];
}) {
  return (
    <div className="border-b border-border/80 bg-background/55 px-5 py-4 lg:px-8">
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
        <span className="rounded-full border border-border px-2.5 py-1">{viewMode === "source" ? "Source editing" : "Rendered reading"}</span>
        <span className="rounded-full border border-border px-2.5 py-1">{visibleMarkers.length} visible markers</span>
        <span className="rounded-full border border-border px-2.5 py-1">{document.graphEdges.length} graph edges</span>
        <span className="rounded-full border border-border px-2.5 py-1">{markerFilter.length === 0 ? "all namespaces" : markerFilter.join(", ")}</span>
      </div>
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
    <div className="min-h-[72vh] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.03),transparent_35%)] p-6 lg:p-10">
      <div className="mx-auto max-w-4xl rounded-[1.75rem] border border-white/8 bg-background/80 px-6 py-8 shadow-[0_16px_48px_rgba(0,0,0,0.24)] lg:px-10" ref={renderedRef} onMouseUp={onMouseUp}>
        <div className="prose-content select-text">
          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
            {buildHighlightedMarkdown(document.plainBody, visibleMarkers)}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}

function SourceEditorSurface({ sourceValue, onSourceChange }: { sourceValue: string; onSourceChange: (value: string) => void }) {
  return (
    <div className="min-h-[72vh] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.03),transparent_35%)] p-4 lg:p-6">
      <textarea
        aria-label="Marcado source editor"
        value={sourceValue}
        onChange={(event) => onSourceChange(event.target.value)}
        className="min-h-[66vh] w-full resize-y rounded-[1.5rem] border border-white/8 bg-background/85 p-5 font-mono text-sm leading-7 text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] outline-none lg:p-8"
        spellCheck={false}
      />
    </div>
  );
}

function MarcadoInspectorSurface({
  document,
  markerFilter,
  visibleMarkers,
  onToggleMarkerFilter,
  onSetMarkerFilter,
  onClearMarkerFilter,
  onRenameMarker,
  onDeleteMarker,
}: {
  document: MarcadoDocument;
  markerFilter: string[];
  visibleMarkers: MarkerRange[];
  onToggleMarkerFilter: (namespace: string) => void;
  onSetMarkerFilter: (nextFilter: string[]) => void;
  onClearMarkerFilter: () => void;
  onRenameMarker: (marker: MarkerRange) => void;
  onDeleteMarker: (marker: MarkerRange) => void;
}) {
  return (
    <aside className="overflow-y-auto border-t border-border bg-surface/65 xl:border-t-0 xl:border-l">
      <div className="space-y-4 p-4 lg:p-5">
        <InfoCard icon={<FiEye />} title="Focus">
          <div className="mb-4 grid grid-cols-2 gap-2">
            <MiniStat label="Visible" value={String(visibleMarkers.length)} />
            <MiniStat label="Total" value={String(document.markers.length)} />
            <MiniStat label="Namespaces" value={String(document.namespaces.length)} />
            <MiniStat label="Edges" value={String(document.graphEdges.length)} />
          </div>
          <div className="space-y-2">
            <button onClick={() => onSetMarkerFilter([])} className={`w-full rounded-xl border px-3 py-2 text-left text-sm cursor-pointer ${markerFilter.length === 0 ? "border-primary/40 bg-primary/10 text-primary" : "border-border text-muted hover:bg-background"}`}>All layers</button>
            {document.namespaces.map((namespace) => {
              const active = markerFilter.includes(namespace.name);
              return (
                <button
                  key={namespace.name}
                  onClick={() => onToggleMarkerFilter(namespace.name)}
                  className={`flex w-full cursor-pointer items-center justify-between rounded-xl border px-3 py-2 text-left text-sm ${active ? "border-primary/40 bg-primary/10 text-primary" : "border-border text-muted hover:bg-background"}`}
                >
                  <span>{namespace.name}</span>
                  <span className="text-[11px] uppercase tracking-wide">{namespace.projection || "layer"}</span>
                </button>
              );
            })}
            {markerFilter.length > 0 ? (
              <button onClick={onClearMarkerFilter} className="cursor-pointer rounded-xl border border-border px-3 py-2 text-sm text-muted hover:bg-background">
                Clear filters
              </button>
            ) : null}
          </div>
        </InfoCard>

        <InfoCard icon={<FiCode />} title="Active markers">
          <div className="space-y-3">
            {visibleMarkers.slice(0, 6).map((marker) => (
              <MarkerCard
                key={`${marker.key}-${marker.start}-${marker.end}`}
                marker={marker}
                onRename={() => onRenameMarker(marker)}
                onDelete={() => onDeleteMarker(marker)}
              />
            ))}
            {visibleMarkers.length > 6 ? <EmptyState text={`${visibleMarkers.length - 6} more markers are hidden in this focused view.`} /> : null}
            {visibleMarkers.length === 0 ? <EmptyState text="No markers match the active filters." /> : null}
          </div>
        </InfoCard>

        <details className="rounded-3xl border border-border bg-background/65 p-4">
          <summary className="cursor-pointer list-none text-sm font-semibold uppercase tracking-[0.14em] text-muted">Advanced structure</summary>
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
              <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">Graph edges</div>
              {document.graphEdges.length === 0 ? (
                <EmptyState text="No explicit graph edges declared." />
              ) : (
                <div className="space-y-3">
                  {document.graphEdges.map((edge, index) => (
                    <div key={`${edge.namespace}-${edge.type}-${index}`} className="rounded-2xl border border-border bg-surface p-3 text-sm">
                      <div className="font-medium text-primary">{edge.namespace}:{edge.type}</div>
                      <div className="mt-2 break-words text-muted">{edge.from}</div>
                      <div className="break-words text-muted">{edge.to}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">Diagnostics</div>
              {document.diagnostics.length === 0 ? (
                <EmptyState text="No marker pairing issues are currently visible." />
              ) : (
                <ul className="space-y-2 text-sm text-warning">
                  {document.diagnostics.map((diagnostic) => (
                    <li key={diagnostic} className="rounded-xl border border-warning/20 bg-warning/10 p-3">{diagnostic}</li>
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

function ViewButton({ active, onClick, icon, children }: { active: boolean; onClick: () => void; icon: ReactNode; children: ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-sm transition ${active ? "bg-primary text-on-primary shadow-sm" : "text-muted hover:bg-background hover:text-foreground"}`}
    >
      {icon}
      {children}
    </button>
  );
}

function ActionButton({ onClick, icon, label }: { onClick: () => void; icon: ReactNode; label: string }) {
  return (
    <button onClick={onClick} className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-border bg-background/80 px-3 py-2 text-sm text-foreground hover:bg-surface-hover">
      {icon}
      {label}
    </button>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-background px-3 py-2">
      <div className="text-[11px] uppercase tracking-wide text-muted">{label}</div>
      <div className="mt-1 text-sm font-semibold text-foreground">{value}</div>
    </div>
  );
}

function InterpretationModeBadge({ mode }: { mode: DocumentInterpretationMode }) {
  const tone = mode === "runtime" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : mode === "fallback" ? "border-amber-200 bg-amber-50 text-amber-700" : "border-border bg-surface text-muted";
  const label = mode === "runtime" ? "Marcado runtime" : mode === "fallback" ? "Fallback parsing" : "Local parse";

  return <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide ${tone}`}>{label}</span>;
}

function UploadActionButton({ onChange }: { onChange: React.ChangeEventHandler<HTMLInputElement> }) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground hover:bg-surface-hover">
      <FiUpload />
      <span>Upload file</span>
      <input type="file" accept=".md,text/markdown,text/plain" className="hidden" aria-label="Upload file" onChange={onChange} />
    </label>
  );
}

function InfoCard({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <section className="rounded-[1.75rem] border border-border bg-surface/90 p-5 shadow-[0_10px_30px_rgba(0,0,0,0.16)]">
      <div className="mb-3 flex items-center gap-2">
        <div className="text-primary">{icon}</div>
        <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-muted">{title}</h3>
      </div>
      {children}
    </section>
  );
}

function MarkerCard({ marker, onRename, onDelete }: { marker: MarkerRange; onRename: () => void; onDelete: () => void }) {
  return (
    <div className="rounded-[1.25rem] border border-border bg-background/90 p-3.5">
      <div className="flex items-start justify-between gap-2">
        <div className="break-words text-sm font-medium text-foreground">{marker.key}</div>
        <div className="flex gap-1">
          <button onClick={onRename} aria-label={`Rename ${marker.key}`} className="cursor-pointer rounded-md border border-border p-1 text-muted hover:bg-surface-hover"><FiEdit2 /></button>
          <button onClick={onDelete} aria-label={`Delete ${marker.key}`} className="cursor-pointer rounded-md border border-border p-1 text-muted hover:bg-surface-hover"><FiTrash2 /></button>
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

function MarkerComposer({ selectionText, namespaces, onAddMarker, onCancel }: { selectionText: string; namespaces: string[]; onAddMarker: (namespace: string, classification: string) => void; onCancel: () => void; }) {
  const [namespace, setNamespace] = useState(namespaces[0] ?? "sem");
  const [classification, setClassification] = useState("");

  useEffect(() => {
    setNamespace(namespaces[0] ?? "sem");
    setClassification("");
  }, [selectionText, namespaces]);

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-[1.25rem] border border-primary/30 bg-primary/8 px-3 py-2 shadow-[0_10px_30px_rgba(63,94,251,0.08)]">
      <span className="max-w-48 truncate text-xs text-muted">“{selectionText}”</span>
      <select aria-label="Marker namespace" value={namespace} onChange={(event) => setNamespace(event.target.value)} className="rounded-lg border border-border bg-background px-2 py-1.5 text-sm text-foreground outline-none">
        {namespaces.length > 0 ? namespaces.map((item) => <option key={item} value={item}>{item}</option>) : <option value="sem">sem</option>}
      </select>
      <input aria-label="Marker classification" value={classification} onChange={(event) => setClassification(event.target.value)} placeholder="concept.new_marker" className="min-w-48 rounded-lg border border-border bg-background px-2 py-1.5 text-sm text-foreground outline-none" />
      <button onClick={() => onAddMarker(namespace, classification)} className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-primary px-3 py-1.5 text-sm text-on-primary"><FiPlus />Add marker</button>
      <button onClick={onCancel} className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-sm text-muted hover:bg-background"><FiX />Cancel</button>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return <div className="rounded-2xl border border-dashed border-border p-4 text-sm text-muted">{text}</div>;
}

function buildHighlightedMarkdown(markdown: string, markers: MarkerRange[]): string {
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

FILE:src/App.tsx
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { FiBookOpen, FiEdit2, FiFileText, FiFolder, FiPlus, FiSave, FiUpload } from "react-icons/fi";
import { DocumentWorkspace, type DocumentInterpretationMode } from "./components/document-workspace";
import { WorkspaceNavigator } from "./components/workspace-navigator";
import { WorkspaceMain, WorkspaceShell, WorkspaceSidebar, WorkspaceSidebarHeader } from "./components/workspace-shell";
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

FILE:src/data/marcado-canonical-example.md
---
document:
  id: canonical-example
  type: design_note
  version: 0.1
  title: Semantic Markdown ASG — Canonical Example
format:
  name: semantic-markdown-asg
  version: 0.1
namespaces:
  struct:
    projection: tree
    allow_crossing: false
  sem:
    projection: taxonomy
    allow_crossing: true
  rhet:
    projection: graph
    allow_crossing: true
    requires_addressable_nodes: true
graphs:
  rhet:
    edges:
      - type: justifies
        from: rhet:rationale.tree_overlap_limitation
        to: rhet:decision.use_asg
---

# Semantic Markdown ASG

<!-- struct:intro -->
This example introduces semantic milestone markers for prose documents.
<!-- /struct:intro -->

<!-- sem:concept.semantic_markdown -->
Semantic Markdown ASG keeps Markdown as the authoring surface while
<!-- sem:function.definition -->
semantic markers define addressable ranges that can overlap.
<!-- /sem:concept.semantic_markdown -->
Those ranges are later normalized into canonical JSON.
<!-- /sem:function.definition -->

<!-- rhet:rationale.tree_overlap_limitation -->
Pure trees cannot represent crossing semantic ranges cleanly.
<!-- /rhet:rationale.tree_overlap_limitation -->

<!-- rhet:decision.use_asg -->
The canonical representation should therefore be an Abstract Semantic Graph.
<!-- /rhet:decision.use_asg -->

FILE:instruccion
Cold-bundle de la tarea task-extraer-a-src-lib-los-helpers-puros-de-marcadores-resaltado-offset-de-selección-borrar-y-renombrar-y: con el TaskDoc, los rituales enrutados por el Board, las pills ligadas, los átomos ligados y los archivos que el TaskDoc nombra, reformula el encargo, lista ambigüedades con cita textual del input y da el DRY-RUN sin ejecutar nada. No ejecutes nada.

Sección de validación del TaskDoc:
- cd /home/jp/proyectos/SLDB_1/UIs/marcado-ui && TMPDIR=/dev/shm npx vitest run src/__tests__/marker-render.test.ts src/__tests__/marker-edit.test.ts
- cd /home/jp/proyectos/SLDB_1/UIs/marcado-ui && TMPDIR=/dev/shm npx vitest run
- cd /home/jp/proyectos/SLDB_1/UIs/marcado-ui && npm run build
- cd /home/jp/proyectos/SLDB_1/UIs/marcado-ui && ! grep -n "function buildHighlightedMarkdown\|function getTextOffset" src/components/document-workspace.tsx

