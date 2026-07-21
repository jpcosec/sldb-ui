---
# routine-xxx
id: routine-task-formalize-the-marcado-adapter-interface
# active | archived
status: active
# Initial node identifier
entrypoint: checklist-task-formalize-the-marcado-adapter-interface-execution-ready
# Ordered or grouped primitive identifiers
decomposition:
- checklist-task-formalize-the-marcado-adapter-interface-execution-ready
- operator-task-formalize-the-marcado-adapter-interface-activate
- checklist-task-formalize-the-marcado-adapter-interface-testing-ready
- operator-task-formalize-the-marcado-adapter-interface-ready-for-testing
- checklist-task-formalize-the-marcado-adapter-interface-closeout-ready
- operator-task-formalize-the-marcado-adapter-interface-close
# Edge identifiers composing the graph
edges:
- edge-task-formalize-the-marcado-adapter-interface-execution-to-activate
- edge-task-formalize-the-marcado-adapter-interface-activate-to-testing
- edge-task-formalize-the-marcado-adapter-interface-testing-to-ready
- edge-task-formalize-the-marcado-adapter-interface-ready-to-closeout
- edge-task-formalize-the-marcado-adapter-interface-closeout-to-close
- edge-task-formalize-the-marcado-adapter-interface-close-to-complete
# Terminal node identifiers
terminal_nodes:
- complete
# e.g., system:deskops
tags:
- workspace:desk
- primitive:routine
---

# Routine for Formalize the Marcado adapter interface

## Summary

_Summarize what this routine does and how its nodes fit together._

Actionable routine for Formalize the Marcado adapter interface.
