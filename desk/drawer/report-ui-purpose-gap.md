# Report: @marcado/ui — Purpose Gap Analysis

## Stated Purpose

> "poder visualizar, editar, guardar e interactuar con el formato marcado de @marcado/"

## Source Inventory (key files and what they do)

### Entry point & orchestration

| File | Purpose |
|---|---|
| `src/App.tsx` | Root workspace component. Manages all state: workspace entries, documents, UI mode, selection, marker filters. Wires every action handler (open, save, edit, add marker, refresh runtime, etc.) to the `DocumentWorkspace`. |
| `src/lib/workspace-state.ts` | Pure-state helpers for workspace entries, document stores, localStorage draft management (`STORAGE_PREFIX`), slug creation, and occurrence-finding. |

### Marcado parsing & integration

| File | Purpose |
|---|---|
| `src/lib/marcado.ts` | Lightweight fallback parser for Marcado documents. Implements `parseMarcadoDocument()` which extracts frontmatter, namespaces, graph edges, markers (open/close pairs), and diagnostics from raw Markdown source using regex (`FRONTMATTER_REGEX`, `MARKER_REGEX`). Returns `MarcadoDocument`. |
| `src/lib/marcado-runtime.ts` | Runtime adapter. `refreshMarcadoDocument()` calls `POST /api/marcado/export` (Vite dev proxy to Python runtime). `runtimeExportToDocument()` converts the Python export format (`RuntimeExportDocument`) into the UI `MarcadoDocument` model, merging with the fallback parser's frontmatter/body offsets. `requestRuntimeExport()` silently falls back to `null` on network failure. |
| `src/lib/marcado-adapter.ts` | Facade with four methods: `parse()` (fallback only), `refresh()` (runtime with fallback), `interpret()` (alias of refresh), `handoff()` (local parse, no runtime call). Used everywhere to avoid coupling to runtime. |

### Components

| File | Purpose |
|---|---|
| `src/components/document-workspace.tsx` | Main workspace panel. Renders toolbar, document content (rendered or source), and inspector sidebar. Handles mouse-up text selection, marker composition, namespace filter buttons, and all action wiring. `buildHighlightedMarkdown()` wraps plain-body ranges in `<span class="marker-highlight …">` for CSS highlighting. |
| `src/components/workspace-shell.tsx` | Layout primitives: `WorkspaceShell` (2-column grid), `WorkspaceSidebar`, `WorkspaceMain`, `WorkspaceTopToolbar`. No business logic. |
| `src/components/workspace-navigator.tsx` | File-tree sidebar listing all workspace entries (bundled, opened, explored). Supports rename/create actions. Builds a tree from flat `WorkspaceEntry[]`. |
| `src/components/DocumentViewer.tsx` | Legacy viewer component (pre-workspace rewrite). Renders `Document` from `types.ts` via `ReactMarkdown`. Unused in the current `App.tsx` workspace flow. |
| `src/components/DocumentSidebar.tsx` | Legacy sidebar for `DocumentViewer`. Unused. |
| `src/components/AnnotationPopup.tsx` | Floating popup for adding/editing text annotations. Used by the annotation system, which is **not wired** into the current workspace. |
| `src/components/AnnotationsList.tsx` | List of saved annotations. Part of the orphaned annotation subsystem. |
| `src/components/document-workspace.tsx` → `MarkerComposer` | Inline composable: appears in toolbar when text is selected in rendered view. Lets user choose namespace + classification, then calls `onAddMarker`. |

### Hooks & utilities

| File | Purpose |
|---|---|
| `src/hooks/useAnnotations.ts` | CRUD for `Annotation[]` persisted to `localStorage`. Not connected to the Marcado workspace. |
| `src/hooks/useAnnotationHighlights.ts` | DOM manipulation to inject `<mark>` tags for annotations in the content ref. Not connected to the Marcado workspace. |
| `src/utils/frontmatter.ts` | Frontmatter utilities. |
| `src/types.ts` | Legacy types (`Document`, `Annotation`, `Frontmatter`) — not the Marcado model types. |

### Data

| File | Purpose |
|---|---|
| `src/data/documents.ts` | Loads the canonical example: raw Markdown + pre-generated `.runtime.json` from Python. Calls `runtimeExportToDocument()` with the synced export. |
| `src/data/marcado-canonical-example.md` | Canonical Marcado demo document with `struct`, `sem`, `rhet` namespaces and graph edges. |
| `src/data/runtime/marcado-canonical-example.runtime.json` | Pre-generated Python runtime export (synced via `sync-marcado-runtime.mjs`). |

### Build & dev

| File | Purpose |
|---|---|
| `vite.config.ts` | Registers `marcadoRuntimePlugin()` which intercepts `POST /api/marcado/export` in `configureServer`. Spawns `python3` with `marcado.parser.parse_text` + `marcado.export.export_document` and pipes source via stdin. Only active in `vite dev` mode. |
| `scripts/sync-marcado-runtime.mjs` | Reads all `.md` files from `src/data/`, pipes them through the Python runtime, writes `.runtime.json` exports. Run manually via `npm run sync:runtime`. |
| `src/__tests__/marcado-ui.ux.test.tsx` | 9 integration tests covering: view switching, namespace filter, marker addition, save/load draft, upload, create/rename file, native file API, download. |
| `src/__tests__/integration.test.tsx` | 9 tests covering: workspace loading, view switching, file rename, namespace filter, localStorage, runtime refresh with mock fetch, upload, native save-as. |
| `src/__tests__/marcado-adapter.test.ts` | 3 unit tests for `marcadoAdapter`: local parse, runtime interpret, runtime fallback. |

---

## Capability Assessment

### Visualizar (Visualize)

**Status: ✅ Full**

**Evidence:**
- `DocumentWorkspace` (`src/components/document-workspace.tsx:280`) renders `ReactMarkdown` with `remarkGfm` + `rehypeRaw` in `RenderedDocumentSurface`.
- `buildHighlightedMarkdown()` (`src/components/document-workspace.tsx:435`) wraps plain-body ranges in `<span class="marker-highlight marker-highlight-{namespace}">` using the `plainToSourceMap` offsets from the Marcado model.
- The inspector sidebar (`MarcadoInspectorSurface`, line 320) shows live marker count, namespace filters, marker cards (key, anchor, range), advanced namespace properties, graph edges, and diagnostics.
- Tests confirm rendering with highlights: `marcado-ui.ux.test.tsx` asserts `.marker-highlight-struct`, `.marker-highlight-sem`, `.marker-highlight-rhet` are present.

### Editar (Edit)

**Status: ✅ Full**

**Evidence:**
- `SourceEditorSurface` (`src/components/document-workspace.tsx:297`) is a plain `<textarea>` bound to `sourceValue` with `onChange` calling `handleSourceChange` in `App.tsx`, which calls `marcadoAdapter.handoff()` to re-parse.
- Marker **creation** via `MarkerComposer`: user selects text in rendered view → `handleRenderedMouseUp` computes `SelectionState` via `getTextOffset()` → `handleAddMarker()` wraps selection with `<!-- {ns}:{cls} -->` / `<!-- /{ns}:{cls} -->` HTML comments in source, then re-parses.
- Marker **rename**: `handleRenameMarker()` (`App.tsx`) replaces both open/close marker keys via string substitution, then re-parses.
- Marker **delete**: `handleDeleteMarker()` (`App.tsx`) surgically removes open and close marker spans from source using the `MarkerRange` offset fields, then re-parses.
- Tests confirm: `marcado-ui.ux.test.tsx` "supports adding a marker from rendered selection" and "supports local save and load for source edits."

### Guardar (Save)

**Status: ✅ Full**

**Evidence:**
- `handleSaveDraft()` (`App.tsx`) writes `localStorage.setItem(STORAGE_PREFIX + slug, source)`.
- `handleSaveFile()` uses `window.showSaveFilePicker` → `fileHandle.createWritable()` → writes source bytes (native OS save).
- `handleDownload()` creates a `Blob` with `text/markdown`, `URL.createObjectURL`, and an `<a>` click for browser download.
- `handleSaveAs` flow: if no `fileHandle` exists yet for the document, prompts `showSaveFilePicker` first, then writes.
- `handleResumeDraft()` reads from localStorage and calls `marcadoAdapter.handoff()` to restore.
- Tests confirm: `marcado-ui.ux.test.tsx` "supports local save and load for source edits"; `integration.test.tsx` "supports native open-file save-as fallback."

### Interactuar con el formato marcado

**Status: ⚠️ Partial — read-only inspection is full; write-back from inspection is limited**

**Evidence:**
- Inspector sidebar shows: marker cards with key/anchor/range, namespace properties (projection, allow_crossing, requires_addressable_nodes), graph edges, and marker pairing diagnostics.
- Namespace filter toggles (`onToggleMarkerFilter`) dim/hide markers by namespace, letting users focus on specific layers.
- "Refresh runtime" button calls `POST /api/marcado/export`, merges the Python export into the model, and shows the `InterpretationModeBadge` as "Marcado runtime" (green) or "Fallback parsing" (amber).
- **Missing write-back interactions**: the inspector has no action to change a marker's namespace or classification — only rename (via prompt) and delete exist. There is no way to add a namespace or graph edge through the UI. No drag-and-drop reordering of markers.
- **Partial graph interaction**: graph edges are displayed as static text cards (`namespace:type` label + `from`/`to` anchors). No interactive graph view, no way to add/edit edges from the UI.

---

## Marcado Runtime Integration Status

**Dev mode: ✅ Wired**

- `vite.config.ts` registers `marcadoRuntimePlugin()` in `configureServer`.
- `POST /api/marcado/export` is intercepted, parsed as JSON, and piped to `python3` with `from marcado.parser import parse_text; from marcado.export import export_document`.
- Source is sent via `stdin.end(payload.source)`, stdout (JSON) is returned as the response.
- `marcadoRuntimeMode` in `marcado-runtime.ts` tracks `'runtime'` vs `'fallback'` (when fetch fails or returns non-200).
- `InterpretationModeBadge` in `document-workspace.tsx` visually signals which mode is active.

**Production mode: ⚠️ Degraded**

- The `marcadoRuntimePlugin` only runs in `vite dev` (`configureServer` is not called during `vite build`).
- In production the app loads pre-generated `src/data/runtime/*.runtime.json` files (synced at build/dev time via `sync-marcado-runtime.mjs`).
- There is **no production HTTP call to a running Marcado server** — the integration only works through the Vite dev proxy.
- `npm run sync:runtime` must be run manually to refresh the bundled `.runtime.json` files from the Python codebase.

**Source of truth for production: bundled JSON**

- `src/data/documents.ts` imports both raw `.md?raw` and `.runtime.json`, then calls `runtimeExportToDocument(slug, raw, runtimeJSON)` to produce the initial `MarcadoDocument` for each bundled document.

---

## Product Narrative Alignment

### README.md

The README explicitly states:

> "`@marcado/ui` provides: rendered vs source views for Marcado documents; marker inspection and namespace filtering; selection-based marker creation; local draft save/load; file open/upload/save/download flows; folder exploration for Markdown workspaces; runtime refresh against the Marcado Python implementation during local dev"

**Alignment: ✅ All stated features are implemented in code.** The README is accurate and up-to-date.

### `src/data/marcado-canonical-example.md` (canonical demo document)

The bundled example contains `struct`, `sem`, and `rhet` namespaces with crossing/non-crossing markers and graph edges. This is a meaningful, non-trivial demonstration of the Marcado format that exercises all inspector panels.

**Alignment: ✅ Adequate demo coverage.**

### `desk/drawer/README.md`

> "Deferred desk work for marcado-ui lives here until it is promoted into active execution."

No deferred items currently present in `desk/drawer/`.

---

## Gap Summary

### Concrete missing pieces

1. **`/api/marcado/export` has no production path.** In production builds, the runtime refresh button falls back silently to the frontend parser because the Vite dev proxy is not active. A production deployment would need either a standalone Node.js server for the proxy or a hosted Marcado API endpoint reachable from the browser.

2. **`sync:runtime` is manual, not automated.** The `npm run sync:runtime` script requires a Python environment with `marcado` on `PYTHONPATH`. There is no CI/CD step that keeps `src/data/runtime/*.runtime.json` in sync with the Python source. Out-of-date runtime exports will silently misrepresent document structure in production.

3. **Annotation system is orphaned code.** `AnnotationPopup`, `AnnotationsList`, `useAnnotations`, and `useAnnotationHighlights` are not imported or used anywhere in the `App.tsx` workspace or `DocumentWorkspace`. They target the legacy `Document`/`Annotation` types from `types.ts`, not `MarcadoDocument`. They will never be rendered in the current UI.

4. **`DocumentViewer` and `DocumentSidebar` are dead code.** These legacy components use the `types.ts` model (`Document` with `Frontmatter`), which is unrelated to `MarcadoDocument`. They are not imported in `App.tsx`.

5. **`types.ts` is unused by the main workspace.** `Document`, `Annotation`, and `Frontmatter` from `types.ts` are only consumed by the orphaned annotation and viewer components.

6. **No graph interaction.** Graph edges are displayed as static cards with `from`/`to` labels. There is no graph visualization, no way to add or edit edges from the UI, and no way to navigate from a marker to its connected edges.

7. **No namespace or graph-edge creation UI.** The inspector can rename/delete markers but cannot add a new namespace declaration to frontmatter, nor add a new graph edge. Users must edit source directly for these structural changes.

8. **No server-side save API.** File saving relies entirely on the browser File System Access API. Users on browsers without `showSaveFilePicker` (Firefox, Safari) can only download. There is no backend endpoint for persistent saves.

9. **"Refresh runtime" is an all-or-nothing reload.** The runtime refresh (`handleRefreshRuntime`) replaces the entire document model. There is no partial/incremental update (e.g., re-highlight only markers that changed) and no conflict detection if local edits diverge from the runtime export.

10. **No tests for `document-workspace.tsx` internal logic.** The test suite (`marcado-ui.ux.test.tsx`, `integration.test.tsx`, `marcado-adapter.test.ts`) exercises the `App.tsx` surface via React Testing Library. There are no unit tests for `buildHighlightedMarkdown`, `getTextOffset`, `MarkerComposer`, `handleDeleteMarker`, or `handleRenameMarker` in isolation.

---

## Acceptance Contract

```acceptance-report
{
  "criteriaSatisfied": [
    {
      "id": "criterion-1",
      "status": "satisfied",
      "evidence": "No code changes were made. This report is a read-only gap analysis. All findings are grounded in file reads and code inspection: src/App.tsx, src/components/document-workspace.tsx, src/lib/marcado.ts, src/lib/marcado-runtime.ts, src/lib/marcado-adapter.ts, src/lib/workspace-state.ts, vite.config.ts, src/__tests__/marcado-ui.ux.test.tsx, src/__tests__/integration.test.tsx, src/__tests__/marcado-adapter.test.ts, src/data/documents.ts, src/data/marcado-canonical-example.md, scripts/sync-marcado-runtime.mjs, README.md, desk/drawer/README.md, package.json, src/types.ts, src/components/DocumentViewer.tsx, src/components/DocumentSidebar.tsx, src/components/AnnotationPopup.tsx, src/components/AnnotationsList.tsx, src/hooks/useAnnotations.ts, src/hooks/useAnnotationHighlights.ts, src/components/workspace-shell.tsx, src/components/workspace-navigator.tsx, src/utils/frontmatter.ts."
    }
  ],
  "changedFiles": [],
  "testsAddedOrUpdated": [],
  "commandsRun": [
    {
      "command": "find /home/jp/proyectos/hum-ecosystem/tools/marcado-ui/src -type f -name '*.ts' -o -name '*.tsx' | sort",
      "result": "passed",
      "summary": "Listed all 26 TypeScript/TSX source files"
    },
    {
      "command": "ls /home/jp/proyectos/hum-ecosystem/tools/marcado-ui/desk/drawer/",
      "result": "passed",
      "summary": "Confirmed desk/drawer/README.md exists; no deferred items"
    }
  ],
  "validationOutput": [
    "All 4 stated capabilities verified against code evidence: visualize (✅ full, buildHighlightedMarkdown + ReactMarkdown + inspector), edit (✅ full, textarea + marker CRUD), save (✅ full, localStorage + File System Access API + blob download), interact (⚠️ partial, inspector read-only, no graph UI, no namespace/edge creation)",
    "Runtime integration verified: dev mode wired via vite.config.ts marcadasRuntimePlugin → POST /api/marcado/export → python3 subprocess; production mode falls back to bundled .runtime.json files with no HTTP call",
    "Orphaned code confirmed: AnnotationPopup, AnnotationsList, useAnnotations, useAnnotationHighlights, DocumentViewer, DocumentSidebar, types.ts legacy Document/Annotation — none imported in App.tsx or DocumentWorkspace",
    "README.md feature list aligns exactly with implemented code; desk/drawer/README.md has no deferred items",
    "Gap summary lists 10 concrete missing pieces with specific file/line references"
  ],
  "residualRisks": [
    "The orphaned annotation system (AnnotationPopup, AnnotationsList, useAnnotations, useAnnotationHighlights) is dead code that could mislead future contributors — it should either be integrated or removed",
    "Production deployments will silently fall back to frontend parsing since /api/marcado/export is only available through the Vite dev proxy — no production runtime endpoint exists",
    "sync:runtime is manual; bundled .runtime.json files may drift from the Python source over time",
    "No unit tests for internal document-workspace.tsx logic (buildHighlightedMarkdown, getTextOffset, MarkerComposer, handleDeleteMarker, handleRenameMarker)"
  ],
  "noStagedFiles": true,
  "diffSummary": "No diff — this is a read-only gap analysis report written to desk/drawer/report-ui-purpose-gap.md. No source files were modified.",
  "reviewFindings": [
    "note: src/types.ts, src/components/DocumentViewer.tsx, src/components/DocumentSidebar.tsx, src/components/AnnotationPopup.tsx, src/components/AnnotationsList.tsx, src/hooks/useAnnotations.ts, src/hooks/useAnnotationHighlights.ts — legacy/orphaned code not connected to the Marcado workspace. These should be removed or integrated.",
    "note: vite.config.ts — marcadoRuntimePlugin only runs in vite dev (configureServer). Production builds have no runtime integration path. This is an architectural gap.",
    "note: src/data/runtime/*.runtime.json are pre-generated snapshots. No CI step updates them. They may become stale relative to the Python source.",
    "blocker: none — the 4 stated capabilities (visualize, edit, save, interact) are all implemented to at least a partial degree. No blocker prevents the stated purpose from being fulfilled in dev mode."
  ],
  "manualNotes": "The gap analysis covers the repository as of the current commit. The stated purpose 'visualizar, editar, guardar e interactuar con el formato marcado' is achievable in dev mode with all four capabilities implemented. The most significant gap is production-mode runtime unavailability and the presence of significant orphaned legacy code (annotation system, legacy viewer types) that should be cleaned up."
}
```
