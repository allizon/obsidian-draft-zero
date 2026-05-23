---
id: TASK-32
title: Quick start sprint with previous settings
status: Done
assignee:
  - Alix Holt
created_date: '2026-05-22 19:55'
updated_date: '2026-05-23 15:29'
labels:
  - feature
  - ux
dependencies: []
priority: medium
ordinal: 2906.25
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Add a way to skip the setup modal and immediately start a sprint using the last-used goal, challenge config, and save destination. Should be available for both the standard "Start Sprint" command and the "Sprint at cursor" command. Could be implemented as additional commands (e.g. "Draft Zero: Quick Sprint" / "Draft Zero: Quick Sprint at cursor") that bypass SetupModal entirely and go straight to SprintModal with the previous settings.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 A 'Quick Sprint' command is available from the command palette
- [x] #2 A 'Quick Sprint at cursor' command is available from the command palette when an editor is active (editorCallback)
- [x] #3 Both commands skip the setup modal and use last-used goal type, goal value, and challenge config
- [x] #4 If no previous settings exist, falls back to plugin defaults
- [x] #5 When saveDestination is 'ask', quick-start uses 'new-file'
- [x] #6 A notice is shown on launch: goal always shown, challenges appended only when active (e.g. 'Quick sprint: 10:00 · no-delete', 'Quick sprint: 500 words')
- [x] #7 Quick Sprint at cursor behaves identically to Sprint at cursor — seed text, cursor insertion, stats notice
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
## Implementation Plan

### Approach
Extract testable pure helpers into quick-sprint.ts, wire up two new commands + ribbon in main.ts.

UI decisions for first cut (iterate after seeing it):
- Notice: 8s duration, two-line structured HTML (goal bold, challenges + save-dest dim below)
- No 30-second in-modal summary (keep simple, revisit after feedback)
- Ribbon icon: zap, "Quick Sprint"
- Save destination callout only when settings.saveDestination === 'ask'

### Steps
1. RED: write quick-sprint.test.ts covering buildQuickSprintResult + formatQuickSprintNotice
2. Create src/quick-sprint.ts with those two pure helpers
3. GREEN: confirm tests pass
4. Update main.ts: quickStart(), quickStartAtCursor(), two commands, ribbon icon
5. Deploy and let user evaluate

### Key files
- obsidian-plugin/src/quick-sprint.ts (new)
- obsidian-plugin/src/tests/quick-sprint.test.ts (new)
- obsidian-plugin/src/main.ts (add commands + ribbon)
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Grill-me decisions (2026-05-22):
- Two new commands: 'Quick Sprint' and 'Quick Sprint at cursor'
- saveDestination='ask' falls back to 'new-file'
- Launch notice always shown: goal + active challenges only
- At-cursor: identical to regular sprint-at-cursor (seed text, cursor insertion)
- Launch and finish notices don't overlap — timing is sufficient distinction
<!-- SECTION:NOTES:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Added Quick Sprint and Quick Sprint at cursor commands that bypass the setup modal and use last-used settings (falling back to defaults). Ribbon zap icon triggers at-cursor if an editor is active, new-file sprint otherwise. Launch notice uses structured two-line HTML (bold goal, dim challenges/save-dest) with 8s duration. Pure helpers (buildQuickSprintResult, formatQuickSprintNoticeLines) extracted to quick-sprint.ts and covered by 18 tests. Total suite: 148 tests passing.
<!-- SECTION:FINAL_SUMMARY:END -->
