---
title: "Sprint Planning — Week 4"
tags: ["meeting", "sprint", "planning"]
date: "2025-01-20"
status: "published"
---

# Sprint Planning — Week 4

**Date:** January 20, 2025
**Attendees:** Alice, Bob, Carlos, Diana

## Sprint Goal

Deliver the **annotation system MVP** with core functionality.

## Sprint Backlog

### Priority 1 — Must Have
- [ ] Text selection handler in document viewer
- [ ] Annotation creation popup UI
- [ ] Local storage persistence
- [ ] Highlight rendering on document load

### Priority 2 — Should Have
- [ ] Annotation list sidebar
- [ ] Delete annotation functionality
- [ ] Dark theme polish

### Priority 3 — Nice to Have
- [ ] Search/filter annotations
- [ ] Export annotations as JSON
- [ ] Annotation categories/tags

## Team Assignments

| Member | Task | Est. Hours |
|--------|------|------------|
| Alice | Text selection + popup | 8h |
| Bob | Storage + highlight rendering | 6h |
| Carlos | Annotation list + deletion | 6h |
| Diana | Dark theme + polish | 4h |

> **Total estimated effort:** 24 hours

## Risks & Mitigations

1. **Risk:** Text selection across HTML elements may be error-prone
   - **Mitigation:** Build robust offset calculations early, test on varied content

2. **Risk:** localStorage limits (5MB) may be hit with large docs
   - **Mitigation:** Implement size check and alert user if approaching limit

## Action Items

- Alice: Set up the annotation workspace by EOD
- Bob: Research text offset calculation approaches
- Carlos: Review existing UI components for reuse
- Diana: Prepare dark theme color tokens

## Next Meeting

Friday, January 24 — Sprint Review & Retrospective