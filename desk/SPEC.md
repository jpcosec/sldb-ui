# SLDB UI Entry Surface Spec

## Product Goal

`@sldb/ui` must become the default human entry point for working with `@sldb/` documents, stores, and model-backed workflows, while supporting `@marcado/` from day one as the canonical document render/parse runtime.

The UI should not be a second document runtime. It should be the operator surface that lets a human open, inspect, edit, validate, and persist structured Markdown documents whose semantics come from `@sldb/` and whose rendering/extraction pipeline is compatible with `@marcado/`.

## Real Use Case

A contributor opens the UI because they want to work with a real structured Markdown document, not with raw implementation details.

They need to:

1. open a local Markdown document or a tracked SLDB document
2. see the rendered document and the source side by side
3. inspect structure, fields, markers, sections, and document metadata
4. edit safely without losing the underlying Markdown truth
5. validate the document against its SLDB model contract
6. use Marcado-compatible parsing/rendering from the start
7. persist changes back to disk and eventually back into tracked SLDB workflows

## Core Positioning

This surface is the front door for `@sldb/`.

That means:

- users should arrive here first when interacting with structured documents
- document operations should feel SLDB-native, not like a generic Markdown editor
- Marcado support is foundational, not optional
- the UI should expose document structure, field semantics, and tracked-document identity
- the UI must preserve Markdown as the source of truth

## First Delivery Slice

The first credible slice should prove all of the following:

1. **Workspace loading**
   - open local `.md` files
   - upload documents into a temporary session
   - load bundled sample documents
   - remember local drafts

2. **Dual document surface**
   - rendered view
   - source view
   - quick switching between both
   - visible sync between source edits and rendered output

3. **Marcado-first compatibility**
   - parse through `@marcado/` runtime when available
   - keep a browser fallback only as a temporary resilience path
   - make runtime refresh explicit and visible
   - ensure document markers and structure remain Marcado-compatible

4. **SLDB-aware inspection**
   - show document identity, path, title, and origin
   - show markers, namespaces, and structural regions
   - show field-like or section-like structure when derivable
   - prepare clear affordances for tracked-document metadata and model binding

5. **Safe local editing**
   - edit source directly
   - add markers through selection-based operations
   - save local drafts
   - save back to file when browser capabilities allow it
   - download the current document otherwise

6. **Future-ready integration seam for `@sldb/`**
   - the app architecture must leave a clean seam for:
     - tracked docs
     - model validation
     - field-level inspection
     - compose/recover/update flows
     - store-backed search and navigation

## What The UI Must Support From Day One

### A. Document-centric workflow

The primary object is a document in Markdown form.

The UI must treat the document as:

- editable source
- rendered artifact
- structured object
- future tracked SLDB entity

### B. Marcado runtime compatibility

The UI must assume `@marcado/` is the canonical semantic interpreter whenever available.

Implications:

- runtime-derived structure should be preferred over frontend-only parsing
- any fallback parser must be explicitly treated as temporary or degraded mode
- rendered output and source mapping should stay compatible with future Marcado evolution
- runtime refresh should be a first-class action

### C. SLDB model awareness

Even before full model editing exists, the interface should be shaped around SLDB concepts:

- model name
- tracked/untracked state
- field ownership
- section boundaries
- validation status
- document/store provenance

### D. Progressive filesystem support

The app should work in three modes:

1. bundled demo mode
2. uploaded file mode
3. native local file mode via File System Access API when available

This keeps the UI usable in browser-only environments while still supporting serious local editing.

## Non-Goals For The First Slice

- full SLDB store administration from the browser
- complete model authoring UX
- deskops workflow execution
- collaborative multi-user editing
- remote sync as a requirement
- replacing the real `@sldb/` or `@marcado/` runtimes with frontend logic

## Required Product Capabilities

### 1. Workspace

The app should provide a workspace with:

- a document list or navigator
- current document metadata
- current document source state
- current rendered state
- notices for save/load/refresh actions

### 2. Document inspection

For the selected document, the UI should expose:

- title or derived identity
- file name / path when known
- document origin
- visible marker inventory
- namespace filtering
- structure summary

### 3. Editing

The UI should support:

- free source editing
- selection-based marker insertion
- reset to original source
- load/save draft
- save to file or download

### 4. Runtime refresh

A user should be able to re-run interpretation through the Marcado runtime and see refreshed structure without leaving the workspace.

### 5. Integration seam for SLDB actions

The UI architecture should reserve explicit command surfaces for future actions such as:

- validate against model
- track document
- recover document
- compose document
- inspect fields
- update field
- open store context

These do not all need to be implemented now, but the navigation and state model should expect them.

## Architecture Direction

### Frontend role

The frontend should be an operator shell with:

- document workspace state
- render/source panes
- inspection panels
- action toolbar
- adapters for runtime-backed parsing and future SLDB commands

### Runtime boundary

Keep two distinct boundaries:

1. **Marcado boundary**
   - parse/render/structure derivation
   - source mapping
   - marker semantics

2. **SLDB boundary**
   - tracked-document identity
   - model validation
   - field/section operations
   - store-backed queries and mutations

The UI should not blur these responsibilities.

### Naming direction

Even if the current repo path remains `sldb-ui`, the product model should converge toward something like:

- `@sldb/ui` as the package identity
- Marcado as a required supported runtime
- SLDB as the top-level user-facing workflow surface

## Acceptance Criteria

The first acceptable delivery should satisfy all of the following:

1. a user can open or load a Markdown document in the UI
2. the same document can be viewed as source and rendered output
3. marker structure is inspectable and filterable
4. edits can be made in source and preserved locally
5. the UI can refresh interpretation through the Marcado-compatible runtime path
6. the codebase clearly separates frontend concerns from runtime concerns
7. the product shape visibly prepares for tracked SLDB operations rather than acting like a generic Markdown toy

## Immediate Next Step Recommendation

The next implementation step should be to formalize the app as an `@sldb/ui` workspace shell with two explicit adapters:

- a **Marcado adapter** for canonical parse/render/source-map operations
- an **SLDB adapter** for tracked-doc, model, field, and store actions

That gives the UI a stable contract now, while allowing `@marcado/` support to be real from the beginning and `@sldb/` workflows to land incrementally without re-architecting the frontend.
