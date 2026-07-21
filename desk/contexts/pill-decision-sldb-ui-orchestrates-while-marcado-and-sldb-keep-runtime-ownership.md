---
# pill-xxx
id: pill-decision-sldb-ui-orchestrates-while-marcado-and-sldb-keep-runtime-ownership
# e.g., language:python, library:pydantic
tags:
- system:sldb-ui
- pill-type:decision
- topic:boundaries
- topic:architecture
---

# Decision: @sldb/ui orchestrates while Marcado and SLDB keep runtime ownership

## What

_Define the context or guardrail this pill carries._

@sldb/ui is the operator surface, @marcado/ is the canonical parse/render runtime, and @sldb/ is the tracked-document and semantic-operation layer.

## Why

_Explain why this context matters for safe execution._

This slice only stays coherent if UI, interpretation, and semantic operations do not collapse into one frontend blob.

## When

_Describe when an agent should apply this pill._

Bind when a task touches adapters, runtime refresh, validation actions, inspector semantics, or top-level product framing.

## Where

_Name the files, surfaces, or scope this pill applies to._

Marcado adapter work, future SldbAdapter work, workspace shell design, inspector behavior, and product docs.

## How

_Describe the correct way to apply this guidance._

Keep explicit adapter seams, call into runtimes instead of duplicating them, and describe product responsibilities consistently in code and docs.

## How Not

_Describe the shortcut or failure mode to avoid._

Do not turn the frontend into a second document runtime or leak SLDB semantic behavior into generic UI state management.
