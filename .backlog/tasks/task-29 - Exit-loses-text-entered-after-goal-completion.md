---
id: TASK-29
title: Exit loses text entered after goal completion
status: Done
assignee: []
created_date: '2026-05-22 19:28'
updated_date: '2026-05-22 19:28'
labels:
  - bug
dependencies: []
priority: high
ordinal: 41000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Text written after the goal is reached (in freewriting mode or the completion prompt) is lost when the user clicks Exit. The finish() method reads text from machine state, but the textarea's last keystrokes may not have been flushed to state yet. Exit should always read directly from the textarea's current value to ensure nothing is dropped.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 All text visible in the textarea at the moment Exit is clicked is included in the saved output
- [x] #2 Regression: existing sprint text is still saved correctly on normal finish
<!-- AC:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
In finish(), read finalText from this.textarea?.value rather than machine state text. Machine state can lag behind the textarea by one or more keystrokes; reading the DOM value directly ensures nothing is dropped. Falls back to machine state text if textarea is unavailable.
<!-- SECTION:FINAL_SUMMARY:END -->
