---
# task-xxx, unique task identifier
id: task-extract-the-workspace-shell-and-top-toolbar
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
- desk/contexts/pill-model-workspace-state-separates-source-interpreted-document-origin-and-persistence.md
- desk/contexts/pill-pattern-the-first-useful-action-must-be-obvious.md
- desk/contexts/pill-index-read-the-current-spec-diagrams-and-runtime-bridge-before-refactoring.md
# Files expected to change
files: []
# Routine identifier for operations
routine: routine-task-extract-the-workspace-shell-and-top-toolbar
# Checklist identifiers for verification
checklists:
- checklist-task-extract-the-workspace-shell-and-top-toolbar-execution-ready
- checklist-task-extract-the-workspace-shell-and-top-toolbar-testing-ready
- checklist-task-extract-the-workspace-shell-and-top-toolbar-closeout-ready
# Active routine node
current_node: checklist-task-extract-the-workspace-shell-and-top-toolbar-execution-ready
# Execution history references
history: []
# e.g., system:deskops, topic:cli
tags:
- workspace:desk
- artifact:task
---

# Extract the workspace shell and top toolbar

## Rationale

_Explain why this task exists or the business driver behind it._

The top-level app framing should be separated from detailed editor/render logic so the product can read clearly as a workspace.

## Goal

_Describe the concrete result this task must produce._

Create explicit shell-level components for the workspace frame and its primary user actions.

## Scope

_State what is in scope and what is out of scope._

Shell layout, top toolbar, notices, and the composition boundary between shell and inner panes.

## Implementation Path

_Outline the expected implementation route or affected surface._

Lift shell concerns out of the monolithic App flow and preserve existing actions through the new shell components.

## Validation

_List the checks required before this task can close._

- npm test

## Done When

_Name the observable condition that makes the task complete._

The app has a recognizable workspace shell and toolbar with the current primary actions wired through it.
