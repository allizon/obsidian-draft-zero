---
id: TASK-21
title: Replace window.confirm on exit with an Obsidian modal offering save or discard
status: Done
assignee: []
created_date: '2026-05-22 16:05'
updated_date: '2026-05-22 20:26'
labels: []
dependencies: []
priority: medium
ordinal: 1453.125
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
The current exit flow uses window.confirm(), which is jarring and doesn't fit Obsidian's UI. Replace it with a proper Obsidian Modal that gives the user two explicit choices: save progress (equivalent to the current finish() path) or discard and close without saving.

The modal should also display sprint stats (elapsed time, word count, goal) so the user can see what they've written before deciding whether to save or discard.

This modal may need a grill-me session to work out the right UX — what stats to show, how to handle the goal-not-yet-met vs goal-completed cases, whether the discard path needs a confirmation of its own, etc.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Clicking Exit opens an Obsidian modal instead of a browser confirm dialog
- [x] #2 Modal shows elapsed time and word count (no goal progress)
- [x] #3 If word count > 0: modal offers Save (mod-cta) and Discard buttons; if word count is 0: only Discard is shown
- [x] #4 Save calls finish() — modal has no knowledge of save destination
- [x] #5 Discard closes without saving, no nested confirmation
- [x] #6 Discard is a plain secondary button (no red/warning styling)
- [x] #7 Modal has no heading — stats lead, then buttons
- [x] #8 Sprint timer auto-pauses when exit modal opens; resumes if modal is cancelled
- [x] #9 Escape or clicking outside the exit modal cancels and returns to the sprint
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Grill-me decisions (2026-05-22):
- Exit button only (not Finish)
- Modal calls finish() dumbly — no save destination logic
- Stats: elapsed time + word count only
- No nested discard confirmation
- Discard: plain secondary button, no red
- No modal heading
- Timer auto-pauses on open, resumes on cancel
- Zero words: show Discard only
- Buttons: Save (mod-cta) and Discard
<!-- SECTION:NOTES:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Added ExitConfirmModal (src/exit-modal.ts) — shows elapsed time + word count, Save (mod-cta, hidden if 0 words) and Discard buttons. buttonClicked flag distinguishes button-driven close from Escape/outside-click, which calls onCancel. Sprint-modal dispatches PAUSE before opening the modal and RESUME on cancel (only if it was the one that paused). Discard path dispatches END then calls super.close() to bypass the close() guard. Finish path unchanged — modal has no save destination knowledge.
<!-- SECTION:FINAL_SUMMARY:END -->
