---
id: TASK-14
title: Escape key should not close an active sprint session
status: Done
assignee: []
created_date: '2026-05-21'
updated_date: '2026-05-22 16:02'
labels:
  - bug
dependencies: []
ordinal: 15000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Pressing Escape while a sprint is active (running or paused) immediately closes the modal, discarding or abruptly ending the session. Escape should be intercepted and either ignored, or trigger a confirmation prompt before closing. Only allow Escape to close once the session has ended (completed, freewriting finished, or explicitly finished by the user).
<!-- SECTION:DESCRIPTION:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Overrode `Modal.close()` in `SprintModal` to return early when `status !== 'idle'`. Obsidian's built-in Escape handler calls `this.close()`, so this one guard covers all close paths (Escape, clicking outside, etc.) while the session is active. `finish()` dispatches `END` first which sets status to `idle`, so explicit finish always goes through. No new flags or event listeners needed."
<!-- SECTION:FINAL_SUMMARY:END -->
