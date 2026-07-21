# @sldb/ui

Operator workspace for structured Markdown documents with first-class Marcado runtime support.

## Repository note

The repository path remains `tools/sldb-ui`, and the product/package narrative is now `@sldb/ui`.

## Purpose

`@sldb/ui` currently provides:

- a primary Marcado workspace for reading, rendering, and editing structured Markdown
- a separate SLDB context surface for contract and validation-oriented checks
- marker inspection and namespace filtering
- selection-based marker creation
- local draft save/load flows
- file open/upload/save/download flows
- folder exploration for Markdown workspaces
- explicit runtime refresh through `@marcado/`
- an early SLDB validation seam without forcing SLDB detail into the default writing surface

## Current architecture

The bundled canonical example is loaded from a runtime-generated canonical JSON export.
During local Vite development, the app can call the real Marcado runtime through a dev-only adapter endpoint and refresh the current document model.

A lightweight frontend parser in `src/lib/marcado.ts` still exists as a degraded fallback for live editing and browser-only cases.
This repo stays focused on the `@sldb/ui` operator surface while `@marcado/` remains the canonical parse/render runtime and `@sldb/` remains the semantic workflow boundary.
The product now distinguishes a default Marcado workspace from a separate SLDB context so those two jobs do not compete in the same screen.

## Commands

```bash
npm install
npm run dev
npm run build
npm test
npm run test:watch
npm run e2e
npm run sync:runtime
```

## Main entry points

- `src/App.tsx` — `@sldb/ui` workspace composition root
- `src/lib/marcado-adapter.ts` — Marcado interpretation boundary for parse/refresh/handoff flows
- `src/lib/sldb-adapter.ts` — early SLDB validation seam for document-aware actions
- `src/lib/marcado-runtime.ts` — adapter from Marcado runtime exports into UI models
- `src/lib/marcado.ts` — degraded frontend fallback parsing/helpers
- `src/data/runtime/*.runtime.json` — synced runtime exports used by the UI
- `scripts/sync-marcado-runtime.mjs` — refresh bundled runtime exports from `/tools/marcado`

## Notes

- Native file save/open/folder exploration uses the browser File System Access API when available.
- Browser-local drafts use `localStorage`.
- `npm run e2e` runs Playwright browser checks against a local Vite server.
- Git remains the intended temporal history layer; the UI focuses on document work surfaces rather than inventing a separate versioning system.
