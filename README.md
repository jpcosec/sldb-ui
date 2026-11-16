# @marcado/ui

Frontend workspace for inspecting, rendering, and editing Marcado documents.

## Purpose

`@marcado/ui` provides:

- rendered vs source views for Marcado documents
- marker inspection and namespace filtering
- selection-based marker creation
- local draft save/load
- file open/upload/save/download flows
- folder exploration for Markdown workspaces
- runtime refresh against the Marcado Python implementation during local dev

## Architecture

The bundled canonical example is loaded from a runtime-generated canonical JSON export.
During local Vite development, the app can call the real Marcado Python runtime through a dev-only adapter endpoint and refresh the current document model.

A lightweight frontend parser in `src/lib/marcado.ts` still exists as a fallback for live editing and static/browser-only cases.
The intended direction is for this project to remain a Marcado-focused UI surface while `/tools/marcado` remains the canonical runtime.

## Setup

Node-based Vite/React/TypeScript project. Choose **one** of the supported installers.

**Prerequisites:** Node.js ≥ 18 (Vite 7 requires Node 18.18+; Node 20+ recommended), npm 9+ (bundled with Node) or Bun 1.1+.

### Using Bun (recommended — fast install)

```bash
cd tools/marcado-ui
bun install
bun run dev          # http://localhost:5173
bun run build        # production build into dist/
bun run preview      # serve the built bundle
bun test             # vitest run
bun run test:watch   # vitest in watch mode
bun run e2e          # playwright test (requires `npx playwright install --with-deps chromium` first)
bun run sync:runtime # refresh src/data/runtime/*.runtime.json from /tools/marcado
```

### Using npm

```bash
cd tools/marcado-ui
npm install
npm run dev
npm run build
npm test
npm run test:watch
npm run e2e
npm run sync:runtime
```

### First-time E2E setup

Playwright needs a browser binary the first time you run the e2e suite:

```bash
npx playwright install chromium   # or `bunx playwright install chromium`
```

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
