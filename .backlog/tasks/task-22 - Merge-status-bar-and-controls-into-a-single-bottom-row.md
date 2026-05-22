---
id: TASK-22
title: Merge status bar and controls into a single bottom row
status: To Do
assignee: []
created_date: '2026-05-22 16:05'
updated_date: '2026-05-22 16:07'
labels: []
dependencies: []
priority: medium
ordinal: 3000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Currently the sprint UI has two separate bottom elements: a status bar (time/word count) and a controls row (Pause/Resume + Exit). Combine them into a single row that shows the status info alongside the action buttons. The goal-completion overlay (Extend / Freewrite / Finish) stays as a floating overlay and is unaffected.

The combined row should be always visible but subtle (low opacity by default, fuller opacity on hover). 

Layout: status key and detail on one side, Pause/Resume and Exit buttons on the other (or inline — exact arrangement left to implementation).

State behaviour: 
- running: status info + Pause + Exit
- paused: \"Paused\" label + Resume + Exit
- freewriting: \"Freewriting\" label + Exit (no pause)
- completed: row hidden (floating overlay takes over)
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Single bottom row replaces the separate .dz-status and .dz-controls elements
- [ ] #2 Row shows correct content in each session state (running / paused / freewriting / completed)
- [ ] #3 Goal-completion overlay behaviour is unchanged
- [ ] #4 Row is visually subtle and does not distract from writing
<!-- AC:END -->
