---
id: TASK-14
title: Escape key should not close an active sprint session
status: To Do
assignee: []
created_date: '2026-05-21'
updated_date: '2026-05-21'
labels:
  - bug
dependencies: []
ordinal: 28000
---

## Description

Pressing Escape while a sprint is active (running or paused) immediately closes the modal, discarding or abruptly ending the session. Escape should be intercepted and either ignored, or trigger a confirmation prompt before closing. Only allow Escape to close once the session has ended (completed, freewriting finished, or explicitly finished by the user).
