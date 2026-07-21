# marcado-ui

Frontend workspace for inspecting, rendering, and editing Marcado documents.

## Status

This repository path is still transitional (`sldb-ui`), but the app itself is now **marcado-ui**.

## Purpose

The UI currently provides:

- rendered vs source views for Marcado documents
- marker inspection and namespace filtering
- selection-based marker creation
- local draft save/load
- file open/upload/save/download flows
- folder exploration for Markdown workspaces
- runtime refresh against the Marcado Python implementation during local dev

## Current architecture

The bundled canonical example is now loaded from a **runtime-generated canonical JSON export**.
During local Vite development, the app can also call the real Marcado Python runtime through a dev-only adapter endpoint and refresh the current document model.

A lightweight frontend parser in `src/lib/marcado.ts` still exists as a fallback for live editing and static/browser-only cases.
Longer term, this project should keep reducing that fallback path and converge toward canonical outputs from the real Marcado runtime in:

- `/home/jp/proyectos/hum-ecosystem/tools/marcado`

The intended direction is for this repo to remain a **UI/operator surface**, not a second independent Marcado runtime.

## Commands

```bash
npm install
npm run dev
npm run build
npm test
npm run test:watch
npm run sync:runtime
```

## Main entry points

- `src/App.tsx` — main Marcado workspace UI
- `src/lib/marcado-runtime.ts` — adapter from Marcado runtime exports into UI models
- `src/lib/marcado.ts` — fallback frontend parsing/helpers
- `src/data/marcado-canonical-example.md` — canonical demo document
- `src/data/runtime/*.runtime.json` — synced runtime exports used by the UI
- `scripts/sync-marcado-runtime.mjs` — refresh bundled runtime exports from `/tools/marcado`

## Notes

- Native file save/open/folder exploration uses the browser File System Access API when available.
- Browser-local drafts use `localStorage`.
