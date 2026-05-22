---
id: TASK-17
title: Start a writing sprint at cursor position in any note
status: To Do
assignee: []
created_date: '2026-05-22 15:37'
updated_date: '2026-05-22 18:25'
labels:
  - feature
dependencies: []
ordinal: 5414.0625
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Allow the user to start a sprint that appends to (or inserts at) the cursor position in the currently active note, rather than always creating a new file or using the plugin's default save destination. This makes Draft Zero feel native to the editing workflow — you're in a note, you want a focused writing burst, and the output lands right where you are.

This might be fundamentally similar to TASK-11 -- probably worth a grill-me session.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 A command (e.g. 'Draft Zero: Sprint at cursor') is available from the command palette when a note is open in the editor
- [ ] #2 When invoked, the sprint modal opens normally (goal/challenge setup, then writing)
- [ ] #3 On finish, the sprint text is inserted at the current cursor position in the active note
- [ ] #4 If no note is active or the cursor position is unavailable, the command is either hidden or falls back gracefully with a notice
<!-- AC:END -->
