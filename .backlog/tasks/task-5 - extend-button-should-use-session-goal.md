---
id: TASK-5
title: Extend button should use session goal, not hardcoded 5min/100 words
status: To Do
assignee: []
created_date: '2026-05-21'
updated_date: '2026-05-21'
labels:
  - bug
dependencies: []
ordinal: 10000
---

## Description

The "Extend (+5 min / +100 words)" button in the completion UI always extends by 5 minutes or 100 words regardless of what the original session goal was. It should extend by whatever the original goal was (e.g. if the goal was 20 minutes, extend by 20 minutes; if the goal was 500 words, extend by 500 words).

Also update the button label dynamically to reflect the actual extension amount.
