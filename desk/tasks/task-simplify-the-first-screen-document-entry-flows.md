---
# task-xxx, unique task identifier
id: task-simplify-the-first-screen-document-entry-flows
# draft | active | blocked | closed
status: draft
# Relevant file or doc paths
references: []
# Task identifiers that must complete first
depends_on:
- task-define-workspace-state-model-and-entry-actions
# Pill identifiers required
pills:
- desk/contexts/pill-decision-evolve-the-existing-app-instead-of-rewriting-it.md
- desk/contexts/pill-pattern-the-first-useful-action-must-be-obvious.md
- desk/contexts/pill-model-workspace-state-separates-source-interpreted-document-origin-and-persistence.md
- desk/contexts/pill-index-read-the-current-spec-diagrams-and-runtime-bridge-before-refactoring.md
# Files expected to change
files: []
# Routine identifier for operations
routine: routine-task-simplify-the-first-screen-document-entry-flows
# Checklist identifiers for verification
checklists:
- checklist-task-simplify-the-first-screen-document-entry-flows-execution-ready
- checklist-task-simplify-the-first-screen-document-entry-flows-testing-ready
- checklist-task-simplify-the-first-screen-document-entry-flows-closeout-ready
# Active routine node
current_node: checklist-task-simplify-the-first-screen-document-entry-flows-execution-ready
# Execution history references
history: []
# e.g., system:deskops, topic:cli
tags:
- workspace:desk
- artifact:task
---

# Simplify the first-screen document entry flows

## Rationale

_Explain why this task exists or the business driver behind it._

Ease of use depends on making the first useful action obvious instead of forcing users to infer the app model from a dense prototype shell.

## Goal

_Describe the concrete result this task must produce._

Present open file, upload, sample document, and draft continuation as obvious first actions in the entry surface.

## Scope

_State what is in scope and what is out of scope._

Entry messaging, first-screen controls, and the transition from no document/opening state into the main workspace.

## Implementation Path

_Outline the expected implementation route or affected surface._

Reuse current open/upload/sample/draft behaviors but simplify their presentation and language.

## Validation

_List the checks required before this task can close._

- npm run build

## Done When

_Name the observable condition that makes the task complete._

A first-time user can understand how to start without reading internal architecture concepts.
