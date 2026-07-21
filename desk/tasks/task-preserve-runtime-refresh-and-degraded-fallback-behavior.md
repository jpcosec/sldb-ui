---
# task-xxx, unique task identifier
id: task-preserve-runtime-refresh-and-degraded-fallback-behavior
# draft | active | blocked | closed
status: draft
# Relevant file or doc paths
references: []
# Task identifiers that must complete first
depends_on:
- task-formalize-the-marcado-adapter-interface
# Pill identifiers required
pills:
- desk/contexts/pill-decision-sldb-ui-orchestrates-while-marcado-and-sldb-keep-runtime-ownership.md
- desk/contexts/pill-index-read-the-current-spec-diagrams-and-runtime-bridge-before-refactoring.md
- desk/contexts/pill-guardrail-fallback-parsing-stays-degraded-and-runtime-refresh-stays-canonical.md
# Files expected to change
files: []
# Routine identifier for operations
routine: routine-task-preserve-runtime-refresh-and-degraded-fallback-behavior
# Checklist identifiers for verification
checklists:
- checklist-task-preserve-runtime-refresh-and-degraded-fallback-behavior-execution-ready
- checklist-task-preserve-runtime-refresh-and-degraded-fallback-behavior-testing-ready
- checklist-task-preserve-runtime-refresh-and-degraded-fallback-behavior-closeout-ready
# Active routine node
current_node: checklist-task-preserve-runtime-refresh-and-degraded-fallback-behavior-execution-ready
# Execution history references
history: []
# e.g., system:deskops, topic:cli
tags:
- workspace:desk
- artifact:task
---

# Preserve runtime refresh and degraded fallback behavior

## Rationale

_Explain why this task exists or the business driver behind it._

Refactoring the runtime boundary should not break the existing refresh path or the browser-only fallback that keeps the app usable.

## Goal

_Describe the concrete result this task must produce._

Keep runtime-backed refresh working while making fallback mode explicit and intentionally degraded.

## Scope

_State what is in scope and what is out of scope._

Refresh action behavior, fallback labeling/posture, and tests around interpreted document updates.

## Implementation Path

_Outline the expected implementation route or affected surface._

Rewire the existing runtime refresh through the new adapter and keep the lightweight parser only as a resilience path.

## Validation

_List the checks required before this task can close._

- npm test

## Done When

_Name the observable condition that makes the task complete._

Users can still refresh through the real runtime and the app still functions when only fallback parsing is available.
