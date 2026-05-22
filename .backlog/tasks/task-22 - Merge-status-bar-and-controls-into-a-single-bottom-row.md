---
id: TASK-22
title: Merge status bar and controls into a single bottom row
status: Done
assignee:
  - Allison
created_date: '2026-05-22 16:05'
updated_date: '2026-05-22 16:28'
labels: []
dependencies: []
modified_files:
  - obsidian-plugin/src/sprint-modal.ts
  - obsidian-plugin/styles.css
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
- [x] #1 Single bottom row replaces the separate .dz-status and .dz-controls elements
- [x] #2 Row shows correct content in each session state (running / paused / freewriting / completed)
- [x] #3 Goal-completion overlay behaviour is unchanged
- [x] #4 Row is visually subtle and does not distract from writing
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
Merge .dz-status and .dz-controls into a single .dz-bottom-row.

sprint-modal.ts:
- Replace statusEl/controlsEl fields with bottomRowEl
- Left side: dz-bottom-status span with statusKeyEl + statusDetailEl
- Right side: dz-bottom-actions span with Pause/Resume and Exit buttons
- Merge updateStatusBar() + updateControls() into updateBottomRow()
- Row is always visible; in completed state, show no buttons (just hide pauseBtn, hide exitBtn, or show status info only — TBD)
- Actually: row always visible; buttons hidden in completed state (floating overlay handles actions)

styles.css:
- Remove .dz-status and .dz-controls blocks
- Add .dz-bottom-row: flexbox row, space-between, low opacity by default, full opacity on hover
- Buttons keep subtle styling from current .dz-controls-btn
<!-- SECTION:PLAN:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Merged .dz-status and .dz-controls into a single .dz-bottom-row div. Left side holds status key + detail spans; right side holds Pause/Resume and Exit buttons. Row is always visible (including completed state) but subtle at 0.2 opacity, rising to full on hover. Pause button hidden in freewriting/completed states; Exit button hidden in completed state. Removed updateStatusBar() and updateControls() methods; replaced with updateBottomRow(). CSS updated to remove old .dz-status/.dz-controls blocks and add .dz-bottom-row, .dz-bottom-status, .dz-bottom-actions rules. Build passes cleanly."
<!-- SECTION:FINAL_SUMMARY:END -->
