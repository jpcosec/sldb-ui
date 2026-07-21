---
document:
  id: canonical-example
  type: design_note
  version: 0.1
  title: Semantic Markdown ASG — Canonical Example
format:
  name: semantic-markdown-asg
  version: 0.1
namespaces:
  struct:
    projection: tree
    allow_crossing: false
  sem:
    projection: taxonomy
    allow_crossing: true
  rhet:
    projection: graph
    allow_crossing: true
    requires_addressable_nodes: true
graphs:
  rhet:
    edges:
      - type: justifies
        from: rhet:rationale.tree_overlap_limitation
        to: rhet:decision.use_asg
---

# Semantic Markdown ASG

<!-- struct:intro -->
This example introduces semantic milestone markers for prose documents.
<!-- /struct:intro -->

<!-- sem:concept.semantic_markdown -->
Semantic Markdown ASG keeps Markdown as the authoring surface while
<!-- sem:function.definition -->
semantic markers define addressable ranges that can overlap.
<!-- /sem:concept.semantic_markdown -->
Those ranges are later normalized into canonical JSON.
<!-- /sem:function.definition -->

<!-- rhet:rationale.tree_overlap_limitation -->
Pure trees cannot represent crossing semantic ranges cleanly.
<!-- /rhet:rationale.tree_overlap_limitation -->

<!-- rhet:decision.use_asg -->
The canonical representation should therefore be an Abstract Semantic Graph.
<!-- /rhet:decision.use_asg -->
