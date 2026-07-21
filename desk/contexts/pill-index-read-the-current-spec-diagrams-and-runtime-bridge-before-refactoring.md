---
# pill-xxx
id: pill-index-read-the-current-spec-diagrams-and-runtime-bridge-before-refactoring
# e.g., language:python, library:pydantic
tags:
- system:sldb-ui
- pill-type:index
- topic:orientation
- topic:refactor
---

# Index: read the current spec, diagrams, and runtime bridge before refactoring

## What

_Define the context or guardrail this pill carries._

The current product spec, diagrams, and runtime bridge files are the required orientation set before changing the workspace shell or adapters.

## Why

_Explain why this context matters for safe execution._

This slice is explicitly about reusing and reshaping what already exists, so implementation should start from the declared product model and current bridge code.

## When

_Describe when an agent should apply this pill._

Bind when a task changes workspace structure, adapter boundaries, rendered/source behavior, or product-facing documentation.

## Where

_Name the files, surfaces, or scope this pill applies to._

desk/SPEC.md, desk/DIAGRAM.md, docs/diagrams/, src/App.tsx, src/lib/marcado-runtime.ts, src/lib/marcado.ts, and related tests/components.

## How

_Describe the correct way to apply this guidance._

Read the spec and diagrams first, inspect the current runtime bridge and UI flow, then refactor with those assets in view.

## How Not

_Describe the shortcut or failure mode to avoid._

Do not refactor the shell or adapters from memory alone or ignore the already-declared product boundaries and existing runtime integration.
