---
id: task-v2-reduce-default-workspace-density
status: draft
references:
- src/App.tsx
- src/components/document-workspace.tsx
- src/components/workspace-navigator.tsx
- README.md
- src/__tests__/integration.test.tsx
- e2e/app.spec.ts
depends_on:
- task-v2-separate-marcado-workspace-from-sldb-context
pills:
- desk/contexts/pill-decision-evolve-the-existing-app-instead-of-rewriting-it.md
- desk/contexts/pill-pattern-the-first-useful-action-must-be-obvious.md
files:
- src/App.tsx
- src/components/document-workspace.tsx
- src/components/workspace-navigator.tsx
- README.md
- src/__tests__/integration.test.tsx
- e2e/app.spec.ts
routine: routine-task-v2-reduce-default-workspace-density
checklists:
- checklist-task-v2-reduce-default-workspace-density-execution-ready
- checklist-task-v2-reduce-default-workspace-density-testing-ready
- checklist-task-v2-reduce-default-workspace-density-closeout-ready
current_node: checklist-task-v2-reduce-default-workspace-density-execution-ready
history: []
tags:
- workspace:desk
- artifact:task
---

# Reduce default workspace density

## Rationale

Even after the Marcado/SLDB split, the default workspace must stop front-loading secondary metadata and technical detail.

## Goal

Reduce the default information density so the first screen and main workspace privilege one obvious action at a time.

## Scope

Sidebar simplification, navigator simplification, progressive disclosure for advanced document structure, and updated docs/tests.

## Validation

- npm test
- npm run build
- npm run e2e
