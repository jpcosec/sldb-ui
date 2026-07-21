---
# pill-xxx
id: pill-guardrail-fallback-parsing-stays-degraded-and-runtime-refresh-stays-canonical
# e.g., language:python, library:pydantic
tags:
- system:sldb-ui
- pill-type:guardrail
- topic:marcado
- topic:fallback
---

# Guardrail: fallback parsing stays degraded and runtime refresh stays canonical

## What

_Define the context or guardrail this pill carries._

The frontend fallback parser may keep the app usable, but runtime-backed refresh remains the canonical interpretation path whenever available.

## Why

_Explain why this context matters for safe execution._

Without this guardrail, refactors can silently drift into treating the fallback parser as equal to the real Marcado runtime.

## When

_Describe when an agent should apply this pill._

Bind when a task changes parsing, refresh behavior, interpreted model updates, or runtime/fallback integration.

## Where

_Name the files, surfaces, or scope this pill applies to._

src/lib/marcado-runtime.ts, src/lib/marcado.ts, refresh actions, rendered/source synchronization, and related tests.

## How

_Describe the correct way to apply this guidance._

Keep runtime refresh explicit, preserve fallback behavior only as degraded resilience, and reflect that posture in code structure and tests.

## How Not

_Describe the shortcut or failure mode to avoid._

Do not optimize the UI around the fallback parser as if it were the canonical semantic authority when the real runtime is available.
