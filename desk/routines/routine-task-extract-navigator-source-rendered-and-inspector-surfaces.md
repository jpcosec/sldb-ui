---
# routine-xxx
id: routine-task-extract-navigator-source-rendered-and-inspector-surfaces
# active | archived
status: active
# Initial node identifier
entrypoint: checklist-task-extract-navigator-source-rendered-and-inspector-surfaces-execution-ready
# Ordered or grouped primitive identifiers
decomposition:
- checklist-task-extract-navigator-source-rendered-and-inspector-surfaces-execution-ready
- operator-task-extract-navigator-source-rendered-and-inspector-surfaces-activate
- checklist-task-extract-navigator-source-rendered-and-inspector-surfaces-testing-ready
- operator-task-extract-navigator-source-rendered-and-inspector-surfaces-ready-for-testing
- checklist-task-extract-navigator-source-rendered-and-inspector-surfaces-closeout-ready
- operator-task-extract-navigator-source-rendered-and-inspector-surfaces-close
# Edge identifiers composing the graph
edges:
- edge-task-extract-navigator-source-rendered-and-inspector-surfaces-execution-to-activate
- edge-task-extract-navigator-source-rendered-and-inspector-surfaces-activate-to-testing
- edge-task-extract-navigator-source-rendered-and-inspector-surfaces-testing-to-ready
- edge-task-extract-navigator-source-rendered-and-inspector-surfaces-ready-to-closeout
- edge-task-extract-navigator-source-rendered-and-inspector-surfaces-closeout-to-close
- edge-task-extract-navigator-source-rendered-and-inspector-surfaces-close-to-complete
# Terminal node identifiers
terminal_nodes:
- complete
# e.g., system:deskops
tags:
- workspace:desk
- primitive:routine
---

# Routine for Extract navigator, source, rendered, and inspector surfaces

## Summary

_Summarize what this routine does and how its nodes fit together._

Actionable routine for Extract navigator, source, rendered, and inspector surfaces.
