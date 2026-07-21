---
# pill-xxx
id: pill-decision-evolve-the-existing-app-instead-of-rewriting-it
# e.g., language:python, library:pydantic
tags:
- system:sldb-ui
- pill-type:decision
- topic:refactor
- topic:reuse
---

# Decision: evolve the existing app instead of rewriting it

## What

_Define the context or guardrail this pill carries._

The current app is the starting asset for @sldb/ui and should be evolved incrementally instead of replaced with a clean-room rewrite.

## Why

_Explain why this context matters for safe execution._

Open/upload/source/render/marker/runtime flows already exist and should be preserved while architecture and naming are clarified.

## When

_Describe when an agent should apply this pill._

Bind when a task changes top-level structure, naming, component boundaries, or workspace flow.

## Where

_Name the files, surfaces, or scope this pill applies to._

src/App.tsx, existing components/hooks, runtime bridge files, README, spec, and workspace shell refactors.

## How

_Describe the correct way to apply this guidance._

Inventory the working behavior first, extract boundaries incrementally, and reuse current code paths unless a narrow replacement is clearly safer.

## How Not

_Describe the shortcut or failure mode to avoid._

Do not restart from an empty shell or throw away working source/render/edit behavior just to achieve cleaner architecture.
