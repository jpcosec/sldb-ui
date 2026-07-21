---
# routine-xxx
id: routine-task-define-workspace-state-model-and-entry-actions
# active | archived
status: active
# Initial node identifier
entrypoint: checklist-task-define-workspace-state-model-and-entry-actions-execution-ready
# Ordered or grouped primitive identifiers
decomposition:
- checklist-task-define-workspace-state-model-and-entry-actions-execution-ready
- operator-task-define-workspace-state-model-and-entry-actions-activate
- checklist-task-define-workspace-state-model-and-entry-actions-testing-ready
- operator-task-define-workspace-state-model-and-entry-actions-ready-for-testing
- checklist-task-define-workspace-state-model-and-entry-actions-closeout-ready
- operator-task-define-workspace-state-model-and-entry-actions-close
# Edge identifiers composing the graph
edges:
- edge-task-define-workspace-state-model-and-entry-actions-execution-to-activate
- edge-task-define-workspace-state-model-and-entry-actions-activate-to-testing
- edge-task-define-workspace-state-model-and-entry-actions-testing-to-ready
- edge-task-define-workspace-state-model-and-entry-actions-ready-to-closeout
- edge-task-define-workspace-state-model-and-entry-actions-closeout-to-close
- edge-task-define-workspace-state-model-and-entry-actions-close-to-complete
# Terminal node identifiers
terminal_nodes:
- complete
# e.g., system:deskops
tags:
- workspace:desk
- primitive:routine
---

# Routine for Define workspace state model and entry actions

## Summary

_Summarize what this routine does and how its nodes fit together._

Actionable routine for Define workspace state model and entry actions.
