---
# pill-xxx
id: pill-model-workspace-state-separates-source-interpreted-document-origin-and-persistence
# e.g., language:python, library:pydantic
tags:
- system:sldb-ui
- pill-type:model
- topic:state-model
- topic:workspace
---

# Model: workspace state separates source, interpreted document, origin, and persistence

## What

_Define the context or guardrail this pill carries._

The workspace state should distinguish document source text, interpreted document model, document origin metadata, and persistence/draft state.

## Why

_Explain why this context matters for safe execution._

Those concerns already exist in the prototype and become fragile if they remain implicit while the UI is split into clearer surfaces.

## When

_Describe when an agent should apply this pill._

Bind when a task changes top-level state, workspace shell composition, save/load flows, or source/render coordination.

## Where

_Name the files, surfaces, or scope this pill applies to._

src/App.tsx, future workspace shell/state modules, file open/save flows, and draft persistence behavior.

## How

_Describe the correct way to apply this guidance._

Make state boundaries explicit before deeper extraction, and keep source-of-truth transitions readable across editor, rendered view, and inspector surfaces.

## How Not

_Describe the shortcut or failure mode to avoid._

Do not hide source, interpreted model, draft state, and origin metadata inside one ambiguous blob of component-local state.
