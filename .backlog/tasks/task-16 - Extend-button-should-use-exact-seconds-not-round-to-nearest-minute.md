---
id: TASK-16
title: 'Extend button should use exact seconds, not round to nearest minute'
status: To Do
assignee: []
created_date: '2026-05-22 15:37'
updated_date: '2026-05-22 18:18'
labels:
  - bug
dependencies: []
ordinal: 5812.5
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
The Extend button label rounds the goal duration to the nearest minute (e.g. "Extend (+1 min)" for a 30-second goal). It should display and extend by the exact number of seconds from the original goal, not a rounded minute value. 30 seconds ≠ 1 minute.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Extend button label shows exact time (e.g. '+30 sec', '+90 sec', '+5 min') rather than always rounding to minutes
- [ ] #2 Extending actually adds the correct number of seconds to the goal
- [ ] #3 Labels use 'sec' for durations under 60s, 'min' for whole minutes, and a sensible format for mixed values (e.g. '1 min 30 sec')
<!-- AC:END -->
