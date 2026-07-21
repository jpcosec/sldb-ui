---
# task-xxx, unique task identifier
id: task-align-product-copy-docs-and-test-narrative
# draft | active | blocked | closed
status: draft
# Relevant file or doc paths
references: []
# Task identifiers that must complete first
depends_on:
- task-simplify-the-first-screen-document-entry-flows
- task-add-the-sldbadapter-contract-and-first-validation-affordance
# Pill identifiers required
pills:
- desk/contexts/pill-decision-evolve-the-existing-app-instead-of-rewriting-it.md
- desk/contexts/pill-decision-sldb-ui-orchestrates-while-marcado-and-sldb-keep-runtime-ownership.md
- desk/contexts/pill-pattern-the-first-useful-action-must-be-obvious.md
- desk/contexts/pill-index-read-the-current-spec-diagrams-and-runtime-bridge-before-refactoring.md
# Files expected to change
files: []
# Routine identifier for operations
routine: routine-task-align-product-copy-docs-and-test-narrative
# Checklist identifiers for verification
checklists:
- checklist-task-align-product-copy-docs-and-test-narrative-execution-ready
- checklist-task-align-product-copy-docs-and-test-narrative-testing-ready
- checklist-task-align-product-copy-docs-and-test-narrative-closeout-ready
# Active routine node
current_node: checklist-task-align-product-copy-docs-and-test-narrative-execution-ready
# Execution history references
history: []
# e.g., system:deskops, topic:cli
tags:
- workspace:desk
- artifact:task
---

# Align product copy, docs, and test narrative

## Rationale

_Explain why this task exists or the business driver behind it._

Once the entry surface and adapter boundaries are clarified, the repo should stop narrating itself primarily as a transitional marcado-ui prototype.

## Goal

_Describe the concrete result this task must produce._

Update product-facing strings, docs, and tests to consistently describe @sldb/ui with first-class Marcado support.

## Scope

_State what is in scope and what is out of scope._

README, UI labels, diagram references, and test naming or descriptions where product framing matters.

## Implementation Path

_Outline the expected implementation route or affected surface._

Update copy after the workspace and adapter seams settle so the final narrative matches the actual structure.

## Validation

_List the checks required before this task can close._

- npm test

## Done When

_Name the observable condition that makes the task complete._

A reader or user sees a consistent @sldb/ui story across the app, docs, and key tests.
