---
# routine-xxx
id: routine-task-extract-the-workspace-shell-and-top-toolbar
# active | archived
status: active
# Initial node identifier
entrypoint: checklist-task-extract-the-workspace-shell-and-top-toolbar-execution-ready
# Ordered or grouped primitive identifiers
decomposition:
- checklist-task-extract-the-workspace-shell-and-top-toolbar-execution-ready
- operator-task-extract-the-workspace-shell-and-top-toolbar-activate
- checklist-task-extract-the-workspace-shell-and-top-toolbar-testing-ready
- operator-task-extract-the-workspace-shell-and-top-toolbar-ready-for-testing
- checklist-task-extract-the-workspace-shell-and-top-toolbar-closeout-ready
- operator-task-extract-the-workspace-shell-and-top-toolbar-close
# Edge identifiers composing the graph
edges:
- edge-task-extract-the-workspace-shell-and-top-toolbar-execution-to-activate
- edge-task-extract-the-workspace-shell-and-top-toolbar-activate-to-testing
- edge-task-extract-the-workspace-shell-and-top-toolbar-testing-to-ready
- edge-task-extract-the-workspace-shell-and-top-toolbar-ready-to-closeout
- edge-task-extract-the-workspace-shell-and-top-toolbar-closeout-to-close
- edge-task-extract-the-workspace-shell-and-top-toolbar-close-to-complete
# Terminal node identifiers
terminal_nodes:
- complete
# e.g., system:deskops
tags:
- workspace:desk
- primitive:routine
---

# Routine for Extract the workspace shell and top toolbar

## Summary

_Summarize what this routine does and how its nodes fit together._

Actionable routine for Extract the workspace shell and top toolbar.
