---
id: TASK-1
title: Textarea needs to be much larger
status: To Do
assignee: []
created_date: '2026-05-21 22:51'
updated_date: '2026-05-22 01:27'
labels:
  - enhancement
dependencies: []
ordinal: 2000
---

## Description

Make the sprint modal full-screen and distraction-free. Decisions:

- **Full-screen modal** — 100% viewport, fully opaque background matching `--background-primary` (no scrim)
- **Status bar moves to bottom** — minimal by default, showing only the key number (time remaining or word count progress); full detail on hover
- **Max-width ~700px centered** — applies to both the textarea and the status bar, keeping line lengths readable
- **Annoyance badge** — centered overlay on the writing surface (see TASK-4 to revisit if too obnoxious)
- **Completion UI** — centered overlay with written text visible behind it
