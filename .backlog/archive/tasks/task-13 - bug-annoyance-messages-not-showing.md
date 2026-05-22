---
id: TASK-13
title: Annoyance messages/elements not appearing
status: To Do
assignee: []
created_date: "2026-05-21"
updated_date: '2026-05-22 13:47'
labels:
  - bug
priority: high
dependencies: []
ordinal: 26000
---
## Description

Annoyance badge ("Keep writing...", "Don't stop!", "WRITE!") is not appearing when the user stops typing. The annoyance interval and level logic may be running but the element is not rendering visibly — possibly a z-index, display, or positioning issue introduced during the full-screen modal refactor (TASK-1).
