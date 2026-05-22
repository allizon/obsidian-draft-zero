---
id: TASK-25
title: Move "Freewriting" label to start of bottom row status
status: Done
assignee: []
created_date: '2026-05-22 16:42'
updated_date: '2026-05-22 19:14'
labels: []
dependencies: []
priority: low
ordinal: 37000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
In freewriting mode, the "Freewriting" label currently appears after the elapsed time (e.g. "2:34 · Freewriting · N words"). It should appear at the beginning of the status, before the time, so the mode label is the first thing seen.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 In freewriting mode, the status reads "Freewriting" first, followed by elapsed time and word count
<!-- AC:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Changed freewriting branch in updateBottomRow: key is now "Freewriting" (was the elapsed time string).
<!-- SECTION:FINAL_SUMMARY:END -->
