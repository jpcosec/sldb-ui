---
# pill-xxx
id: pill-pattern-the-first-useful-action-must-be-obvious
# e.g., language:python, library:pydantic
tags:
- system:sldb-ui
- pill-type:pattern
- topic:ux
- topic:onboarding
---

# Pattern: the first useful action must be obvious

## What

_Define the context or guardrail this pill carries._

The UI should foreground the simplest first useful actions instead of making users infer the product model from a dense prototype shell.

## Why

_Explain why this context matters for safe execution._

Ease of use is a core product goal for this slice, and first-use confusion will undercut every later architecture improvement.

## When

_Describe when an agent should apply this pill._

Bind when a task touches entry copy, welcome actions, first-screen layout, or top-toolbar affordances.

## Where

_Name the files, surfaces, or scope this pill applies to._

Entry surface, workspace shell framing, top toolbar, README examples, and user-facing product copy.

## How

_Describe the correct way to apply this guidance._

Make open/upload/sample/resume actions explicit, use human language, and keep the path into the main workspace short and obvious.

## How Not

_Describe the shortcut or failure mode to avoid._

Do not present the first screen as an internal tool surface that assumes the user already understands Marcado, SLDB, or adapter internals.
