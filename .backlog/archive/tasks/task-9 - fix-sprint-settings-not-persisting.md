---
id: TASK-9
title: Fix sprint settings not persisting between sessions
status: To Do
assignee: []
created_date: '2026-05-21'
updated_date: '2026-05-21'
labels:
  - bug
priority: high
dependencies: []
ordinal: 18000
---

## Description

Sprint settings (goal type, goal value, challenge config) are not persisting between plugin reloads / Obsidian restarts. The plugin remembers the last-used settings within a session but they are lost on reload.
