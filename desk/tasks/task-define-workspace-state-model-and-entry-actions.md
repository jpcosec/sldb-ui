---
# task-xxx, unique task identifier
id: task-define-workspace-state-model-and-entry-actions
# draft | active | blocked | closed
status: draft
# Relevant file or doc paths
references: []
# Task identifiers that must complete first
depends_on: []
# Pill identifiers required
pills:
- desk/contexts/pill-decision-evolve-the-existing-app-instead-of-rewriting-it.md
- desk/contexts/pill-decision-sldb-ui-orchestrates-while-marcado-and-sldb-keep-runtime-ownership.md
- desk/contexts/pill-model-workspace-state-separates-source-interpreted-document-origin-and-persistence.md
- desk/contexts/pill-index-read-the-current-spec-diagrams-and-runtime-bridge-before-refactoring.md
# Files expected to change
files: []
# Routine identifier for operations
routine: routine-task-define-workspace-state-model-and-entry-actions
# Checklist identifiers for verification
checklists:
- checklist-task-define-workspace-state-model-and-entry-actions-execution-ready
- checklist-task-define-workspace-state-model-and-entry-actions-testing-ready
- checklist-task-define-workspace-state-model-and-entry-actions-closeout-ready
# Active routine node
current_node: checklist-task-define-workspace-state-model-and-entry-actions-execution-ready
# Execution history references
history: []
# e.g., system:deskops, topic:cli
tags:
- workspace:desk
- artifact:task
---

# Define workspace state model and entry actions

## Rationale

_Explain why this task exists or the business driver behind it._

The current prototype already has multiple document flows, but the new workspace shell needs a stable state model before UI refactors grow more complex.

## Goal

_Describe the concrete result this task must produce._

Make document/session state and top-level entry actions explicit so the rest of the UI can refactor around them safely.

## Scope

_State what is in scope and what is out of scope._

Document source state, interpreted model state, origin metadata, draft state, notice state, and the first open/upload/sample actions.

## Implementation Path

_Outline the expected implementation route or affected surface._

Extract or codify the current top-level state shape from App.tsx before deeper component splitting.

## Validation

_List the checks required before this task can close._

- npm test

## Done When

_Name the observable condition that makes the task complete._

The workspace has an explicit state model and clearly defined top-level entry actions.
