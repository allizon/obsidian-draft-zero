---
id: TASK-12
title: Show timer and goal beneath textarea in freewriting mode
status: Done
assignee: []
created_date: '2026-05-21'
updated_date: '2026-05-22 16:37'
labels:
  - enhancement
dependencies:
  - TASK-22
modified_files:
  - obsidian-plugin/src/sprint-modal.ts
ordinal: 5250
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
The status bar (timer, word count) should remain visible beneath the textarea during freewriting mode, just as it is during normal running mode. Currently it may be hidden or showing a static "Freewriting" label without the live stats.
<!-- SECTION:DESCRIPTION:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
In freewriting mode, key is now the live elapsed time (e.g. "2:34") and detail shows "· Freewriting · N words", mirroring the running-mode layout. Combined with task-6 (always-visible detail), live stats are now fully readable during freewriting.
<!-- SECTION:FINAL_SUMMARY:END -->
