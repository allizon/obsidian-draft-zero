---
id: TASK-32
title: Quick start sprint with previous settings
status: To Do
assignee: []
created_date: '2026-05-22 19:55'
updated_date: '2026-05-22 20:21'
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
- [ ] #1 A 'Quick Sprint' command is available from the command palette
- [ ] #2 A 'Quick Sprint at cursor' command is available from the command palette when an editor is active (editorCallback)
- [ ] #3 Both commands skip the setup modal and use last-used goal type, goal value, and challenge config
- [ ] #4 If no previous settings exist, falls back to plugin defaults
- [ ] #5 When saveDestination is 'ask', quick-start uses 'new-file'
- [ ] #6 A notice is shown on launch: goal always shown, challenges appended only when active (e.g. 'Quick sprint: 10:00 · no-delete', 'Quick sprint: 500 words')
- [ ] #7 Quick Sprint at cursor behaves identically to Sprint at cursor — seed text, cursor insertion, stats notice
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Grill-me decisions (2026-05-22):
- Two new commands: 'Quick Sprint' and 'Quick Sprint at cursor'
- saveDestination='ask' falls back to 'new-file'
- Launch notice always shown: goal + active challenges only
- At-cursor: identical to regular sprint-at-cursor (seed text, cursor insertion)
- Launch and finish notices don't overlap — timing is sufficient distinction
<!-- SECTION:NOTES:END -->
