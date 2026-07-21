---
# routine-xxx
id: routine-task-align-product-copy-docs-and-test-narrative
# active | archived
status: active
# Initial node identifier
entrypoint: checklist-task-align-product-copy-docs-and-test-narrative-execution-ready
# Ordered or grouped primitive identifiers
decomposition:
- checklist-task-align-product-copy-docs-and-test-narrative-execution-ready
- operator-task-align-product-copy-docs-and-test-narrative-activate
- checklist-task-align-product-copy-docs-and-test-narrative-testing-ready
- operator-task-align-product-copy-docs-and-test-narrative-ready-for-testing
- checklist-task-align-product-copy-docs-and-test-narrative-closeout-ready
- operator-task-align-product-copy-docs-and-test-narrative-close
# Edge identifiers composing the graph
edges:
- edge-task-align-product-copy-docs-and-test-narrative-execution-to-activate
- edge-task-align-product-copy-docs-and-test-narrative-activate-to-testing
- edge-task-align-product-copy-docs-and-test-narrative-testing-to-ready
- edge-task-align-product-copy-docs-and-test-narrative-ready-to-closeout
- edge-task-align-product-copy-docs-and-test-narrative-closeout-to-close
- edge-task-align-product-copy-docs-and-test-narrative-close-to-complete
# Terminal node identifiers
terminal_nodes:
- complete
# e.g., system:deskops
tags:
- workspace:desk
- primitive:routine
---

# Routine for Align product copy, docs, and test narrative

## Summary

_Summarize what this routine does and how its nodes fit together._

Actionable routine for Align product copy, docs, and test narrative.
