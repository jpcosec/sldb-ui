# Bootstrap SLDB UI as the @sldb entry surface

## Kind

feature

## Status

open

## Problem

`sldb-ui` already contains a useful Marcado-oriented prototype, but it still reads as an experimental app rather than the clear human entry surface for `@sldb/`. The product direction, boundaries, and diagrams now exist, but the implementation work still needs to be routed as a coherent execution plan that reuses the current code instead of rewriting it.

## Desired Outcome

Turn the existing app into the first usable `@sldb/ui` workspace shell by reusing current source/render/edit flows, formalizing runtime boundaries, and preparing clean seams for SLDB-native actions.

## Proposed General Tasks

1. Reframe the current app as the `@sldb/ui` workspace shell.
2. Extract and stabilize the Marcado adapter boundary from the existing runtime/fallback code.
3. Refactor the current UI into explicit entry, workspace, editor, rendered, and inspector surfaces.
4. Add the first SLDB integration seam for document context and validation-oriented actions.
5. Align naming, docs, and tests with the new `@sldb/ui` positioning.

## Proposed Breakdown

### Workspace shell

- define the first-screen and workspace layout
- separate document/session state from view components
- keep open/upload/sample/draft flows intact while simplifying their presentation

### Marcado boundary

- turn current runtime refresh code into a named adapter surface
- keep the frontend parser only as degraded fallback
- make runtime-backed refresh a first-class user action

### UI surfaces

- split the current monolithic app into shell, navigator, source, rendered, inspector, and toolbar pieces
- keep existing marker functionality and selection-based editing where it already works
- make the rendered/source toggle and notices obvious

### SLDB seam

- reserve an adapter for tracked-doc context and validation flows
- start with lightweight or stubbed actions if the runtime contract is not ready
- keep the seam explicit so semantics do not leak into generic UI state

### Product alignment

- rename or relabel product-facing language toward `@sldb/ui`
- preserve the fact that `@marcado/` is supported from day one
- update docs and tests so they describe the real product goal

## Questions

- What exact package/app naming should be visible in the first release?
- Which current components already map cleanly to the target inspector and workspace surfaces?
- How much SLDB action surface should be real now versus placeholder/stub?

## Notes

This draft is intentionally implementation-oriented: reuse what exists, refactor incrementally, and avoid rewriting working source/render/edit behavior.
