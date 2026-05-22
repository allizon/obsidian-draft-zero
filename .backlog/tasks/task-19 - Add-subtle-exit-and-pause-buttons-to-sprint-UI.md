---
id: TASK-19
title: Add subtle exit and pause buttons to sprint UI
status: Done
assignee: []
created_date: '2026-05-22 15:49'
updated_date: '2026-05-22 16:02'
labels: []
dependencies: []
priority: medium
ordinal: 34000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Add unobtrusive exit and pause buttons to the sprint view. Exit should show a confirmation dialog before quitting to prevent accidental data loss. Pause should suspend the sprint timer without closing.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Exit button shows a confirmation prompt before exiting
- [x] #2 Pause button suspends the sprint without losing progress
- [x] #3 Buttons are visually subtle and don't distract from writing
<!-- AC:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Added a `.dz-controls` row below the status bar with Pause/Resume and Exit buttons. Controls are 20% opacity by default and fade to full on hover, so they don't distract during writing. Pause dispatches PAUSE/RESUME to the state machine; Exit shows a native confirm dialog before calling finish(). During freewriting the Pause button is hidden (state machine doesn't support pausing from freewriting). Controls hide entirely during the completion UI.
<!-- SECTION:FINAL_SUMMARY:END -->
