---
# board-xxx
id: board-001
# Affected workspace or domain
scope: desk
# List of task-xxx paths
tasks:
- desk/tasks/task-define-workspace-state-model-and-entry-actions.md
- desk/tasks/task-simplify-the-first-screen-document-entry-flows.md
- desk/tasks/task-formalize-the-marcado-adapter-interface.md
- desk/tasks/task-preserve-runtime-refresh-and-degraded-fallback-behavior.md
- desk/tasks/task-extract-the-workspace-shell-and-top-toolbar.md
- desk/tasks/task-extract-navigator-source-rendered-and-inspector-surfaces.md
- desk/tasks/task-add-the-sldbadapter-contract-and-first-validation-affordance.md
- desk/tasks/task-align-product-copy-docs-and-test-narrative.md
# List of pill-xxx paths
pills:
- desk/contexts/pills.md
- desk/contexts/pill-decision-evolve-the-existing-app-instead-of-rewriting-it.md
- desk/contexts/pill-decision-sldb-ui-orchestrates-while-marcado-and-sldb-keep-runtime-ownership.md
- desk/contexts/pill-model-workspace-state-separates-source-interpreted-document-origin-and-persistence.md
- desk/contexts/pill-pattern-the-first-useful-action-must-be-obvious.md
- desk/contexts/pill-index-read-the-current-spec-diagrams-and-runtime-bridge-before-refactoring.md
- desk/contexts/pill-guardrail-fallback-parsing-stays-degraded-and-runtime-refresh-stays-canonical.md
# List of ritual-xxx paths
rituals:
- desk/rituals/execution.md
- desk/rituals/testing.md
- desk/rituals/closeout.md
# e.g., system:sldb, workspace:desk
tags:
- workspace:desk
---

# sldb-ui Board

## Purpose

Route only the currently necessary granular task set for turning the existing app into a usable `@sldb/ui` entry surface.

## Notes

- The routed pills carry the reusable implementation context for this slice: reuse-not-rewrite, runtime ownership boundaries, workspace state shape, first-use UX, orientation sources, and fallback/runtime posture.
- The task set is intentionally granular; shared reasoning should stay in pills instead of being recopied into every task doc.

## Task Details

_Generated from the task references above._

- Define workspace state model and entry actions [draft] - Make document/session state and top-level entry actions explicit so the rest of the UI can refactor around them safely.
- Simplify the first-screen document entry flows [draft] - Present open file, upload, sample document, and draft continuation as obvious first actions in the entry surface.
- Formalize the Marcado adapter interface [draft] - Expose a named Marcado adapter interface for parsing, runtime refresh, and interpreted document handoff.
- Preserve runtime refresh and degraded fallback behavior [draft] - Keep runtime-backed refresh working while making fallback mode explicit and intentionally degraded.
- Extract the workspace shell and top toolbar [draft] - Create explicit shell-level components for the workspace frame and its primary user actions.
- Extract navigator, source, rendered, and inspector surfaces [draft] - Break the current monolithic UI into explicit navigator, source editor, rendered document, and structure inspector surfaces.
- Add the SldbAdapter contract and first validation affordance [draft] - Introduce a minimal SldbAdapter contract and expose at least one document-context or validation-oriented user affordance through it.
- Align product copy, docs, and test narrative [draft] - Update product-facing strings, docs, and tests to consistently describe @sldb/ui with first-class Marcado support.
