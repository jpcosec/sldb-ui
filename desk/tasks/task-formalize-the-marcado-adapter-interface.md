---
# task-xxx, unique task identifier
id: task-formalize-the-marcado-adapter-interface
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
- desk/contexts/pill-decision-sldb-ui-orchestrates-while-marcado-and-sldb-keep-runtime-ownership.md
- desk/contexts/pill-index-read-the-current-spec-diagrams-and-runtime-bridge-before-refactoring.md
- desk/contexts/pill-guardrail-fallback-parsing-stays-degraded-and-runtime-refresh-stays-canonical.md
# Files expected to change
files: []
# Routine identifier for operations
routine: routine-task-formalize-the-marcado-adapter-interface
# Checklist identifiers for verification
checklists:
- checklist-task-formalize-the-marcado-adapter-interface-execution-ready
- checklist-task-formalize-the-marcado-adapter-interface-testing-ready
- checklist-task-formalize-the-marcado-adapter-interface-closeout-ready
# Active routine node
current_node: checklist-task-formalize-the-marcado-adapter-interface-execution-ready
# Execution history references
history: []
# e.g., system:deskops, topic:cli
tags:
- workspace:desk
- artifact:task
---

# Formalize the Marcado adapter interface

## Rationale

_Explain why this task exists or the business driver behind it._

The app already relies on Marcado semantics, but it needs a clean contract so future SLDB work does not blur runtime responsibilities.

## Goal

_Describe the concrete result this task must produce._

Expose a named Marcado adapter interface for parsing, runtime refresh, and interpreted document handoff.

## Scope

_State what is in scope and what is out of scope._

Adapter naming, functions, argument/return shape, and the handoff between source text and interpreted models.

## Implementation Path

_Outline the expected implementation route or affected surface._

Wrap the current runtime and fallback paths behind a stable adapter surface used by the workspace.

## Validation

_List the checks required before this task can close._

- npm test

## Done When

_Name the observable condition that makes the task complete._

Marcado integration is consumed through an explicit adapter rather than scattered app-specific calls.
