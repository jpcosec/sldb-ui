---
# task-xxx, unique task identifier
id: task-add-the-sldbadapter-contract-and-first-validation-affordance
# draft | active | blocked | closed
status: draft
# Relevant file or doc paths
references: []
# Task identifiers that must complete first
depends_on:
- task-extract-navigator-source-rendered-and-inspector-surfaces
# Pill identifiers required
pills:
- desk/contexts/pill-decision-sldb-ui-orchestrates-while-marcado-and-sldb-keep-runtime-ownership.md
- desk/contexts/pill-index-read-the-current-spec-diagrams-and-runtime-bridge-before-refactoring.md
# Files expected to change
files: []
# Routine identifier for operations
routine: routine-task-add-the-sldbadapter-contract-and-first-validation-affordance
# Checklist identifiers for verification
checklists:
- checklist-task-add-the-sldbadapter-contract-and-first-validation-affordance-execution-ready
- checklist-task-add-the-sldbadapter-contract-and-first-validation-affordance-testing-ready
- checklist-task-add-the-sldbadapter-contract-and-first-validation-affordance-closeout-ready
# Active routine node
current_node: checklist-task-add-the-sldbadapter-contract-and-first-validation-affordance-execution-ready
# Execution history references
history: []
# e.g., system:deskops, topic:cli
tags:
- workspace:desk
- artifact:task
---

# Add the SldbAdapter contract and first validation affordance

## Rationale

_Explain why this task exists or the business driver behind it._

The UI must visibly prepare for SLDB-native work without absorbing semantic runtime logic into generic frontend state.

## Goal

_Describe the concrete result this task must produce._

Introduce a minimal SldbAdapter contract and expose at least one document-context or validation-oriented user affordance through it.

## Scope

_State what is in scope and what is out of scope._

Adapter boundary, early UI affordance, placeholder or lightweight implementation, and boundary-safe wiring from toolbar or inspector.

## Implementation Path

_Outline the expected implementation route or affected surface._

Add a minimal adapter surface that the workspace can call without hard-coding SLDB semantics into view logic.

## Validation

_List the checks required before this task can close._

- npm run build

## Done When

_Name the observable condition that makes the task complete._

The codebase and UI both show the first explicit SLDB action seam.
