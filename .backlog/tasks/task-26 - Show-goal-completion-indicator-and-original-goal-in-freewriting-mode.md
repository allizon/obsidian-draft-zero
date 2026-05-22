---
id: TASK-26
title: Show goal completion indicator and original goal in freewriting mode
status: Done
assignee: []
created_date: '2026-05-22 16:42'
updated_date: '2026-05-22 19:14'
labels: []
dependencies: []
priority: medium
ordinal: 38000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
In freewriting mode, the bottom row should make it clear the original goal was completed. Show a check icon next to the original goal (e.g. "✓ 500 words" or "✓ 10:00") so the user can see what they achieved. The elapsed time and word count should continue to increment, reflecting total session progress beyond the goal.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Original goal is displayed with a completion indicator (e.g. ✓ 500 words) in freewriting mode
- [x] #2 Elapsed time and word count continue to increment past the goal
- [x] #3 Indicator is visually distinct but not distracting
<!-- AC:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Added goalIndicator to freewriting detail, reading originalGoal from machine state. Format: "✓ 10:00" for time goals, "✓ 500 words" for word goals. Full status reads: "Freewriting · ✓ 10:00 · 12:34 · 847 words". Elapsed time and word count continue incrementing as before.
<!-- SECTION:FINAL_SUMMARY:END -->
