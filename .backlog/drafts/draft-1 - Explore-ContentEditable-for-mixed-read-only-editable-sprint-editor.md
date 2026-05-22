---
id: DRAFT-1
title: Explore ContentEditable for mixed read-only/editable sprint editor
status: Draft
assignee: []
created_date: '2026-05-22 18:57'
labels:
  - exploration
  - feature
dependencies: []
references:
  - TASK-17
priority: low
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
When seeding a sprint with existing note content, a `<textarea>` can't enforce mixed read-only regions without brittle boundary-tracking hacks. A `contenteditable` div with the seed span marked `contenteditable="false"` would give clean native mixed editability.

This is a design/feasibility exploration before committing to implementation. The current plan (TASK-17) uses a split layout (read-only div above editable textarea) as the pragmatic first pass. This task is about whether ContentEditable is worth doing instead or in addition.

Key questions to resolve:
- How does text capture work with contenteditable vs textarea (value vs innerText/textContent)?
- How do existing keydown handlers (no-delete challenge, invisible ink) translate?
- How does paste/drag-drop behave across the boundary?
- Is there a clean way to extract only the new text on finish?
- Does it degrade gracefully on mobile?
<!-- SECTION:DESCRIPTION:END -->
