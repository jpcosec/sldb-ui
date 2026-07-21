---
# task-xxx, unique task identifier
id: task-extract-navigator-source-rendered-and-inspector-surfaces
# draft | active | blocked | closed
status: draft
# Relevant file or doc paths
references: []
# Task identifiers that must complete first
depends_on:
- task-extract-the-workspace-shell-and-top-toolbar
- task-preserve-runtime-refresh-and-degraded-fallback-behavior
# Pill identifiers required
pills:
- desk/contexts/pill-decision-evolve-the-existing-app-instead-of-rewriting-it.md
- desk/contexts/pill-decision-sldb-ui-orchestrates-while-marcado-and-sldb-keep-runtime-ownership.md
- desk/contexts/pill-model-workspace-state-separates-source-interpreted-document-origin-and-persistence.md
- desk/contexts/pill-index-read-the-current-spec-diagrams-and-runtime-bridge-before-refactoring.md
# Files expected to change
files: []
# Routine identifier for operations
routine: routine-task-extract-navigator-source-rendered-and-inspector-surfaces
# Checklist identifiers for verification
checklists:
- checklist-task-extract-navigator-source-rendered-and-inspector-surfaces-execution-ready
- checklist-task-extract-navigator-source-rendered-and-inspector-surfaces-testing-ready
- checklist-task-extract-navigator-source-rendered-and-inspector-surfaces-closeout-ready
# Active routine node
current_node: checklist-task-extract-navigator-source-rendered-and-inspector-surfaces-execution-ready
# Execution history references
history: []
# e.g., system:deskops, topic:cli
tags:
- workspace:desk
- artifact:task
---

# Extract navigator, source, rendered, and inspector surfaces

## Rationale

_Explain why this task exists or the business driver behind it._

The current interaction model already exists, but its responsibilities need to be split into stable surfaces that match the target UI design.

## Goal

_Describe the concrete result this task must produce._

Break the current monolithic UI into explicit navigator, source editor, rendered document, and structure inspector surfaces.

## Scope

_State what is in scope and what is out of scope._

Component extraction, prop/state boundaries, preservation of marker interactions, and the rendered/source workspace composition.

## Implementation Path

_Outline the expected implementation route or affected surface._

Reuse existing components and hooks where possible, and move remaining responsibilities out of App.tsx incrementally.

## Validation

_List the checks required before this task can close._

- npm test

## Done When

_Name the observable condition that makes the task complete._

The main workspace is composed from explicit navigator/editor/rendered/inspector surfaces without losing current behavior.
