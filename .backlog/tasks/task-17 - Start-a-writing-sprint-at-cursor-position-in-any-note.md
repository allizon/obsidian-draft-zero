---
id: TASK-17
title: Start a writing sprint at cursor position in any note
status: Done
assignee: []
created_date: '2026-05-22 15:37'
updated_date: '2026-05-22 19:03'
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
- [x] #1 A command (e.g. 'Draft Zero: Sprint at cursor') is available from the command palette when a note is open in the editor
- [x] #2 When invoked, the sprint modal opens normally (goal/challenge setup, then writing)
- [x] #3 On finish, the sprint text is inserted at the current cursor position in the active note
- [x] #4 If no note is active or the cursor position is unavailable, the command is either hidden or falls back gracefully with a notice
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
Split layout implementation:

1. main.ts: Add `sprint-at-cursor` command via `editorCallback`. Capture cursor before setup modal. Seed = content before cursor. On finish, insert sprint text at original cursor position. Extract `recordSession` from `saveSprint` so both commands share stats/storage logic.

2. sprint-modal.ts: Add optional `seedText?: string` as 5th constructor param. If present, render a `.dz-seed-text` div above the textarea.

3. styles.css: Style `.dz-seed-text` — same font as textarea, --text-muted color, max-height 30vh, overflow-y auto, subtle bottom border separator, user-select none.
<!-- SECTION:PLAN:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Added `sprint-at-cursor` command via `editorCallback` (auto-hidden when no editor is active). Captures cursor position before setup modal opens. Seed text = everything before the cursor, shown in a read-only `.dz-seed-text` div above the textarea (same font, muted color, max-height 30vh, scrollable). On finish, inserts sprint text at original cursor with `editor.replaceRange`. Extracted `recordSession` from `saveSprint` so stats/storage logic is shared. TASK-11 merged into this task.
<!-- SECTION:FINAL_SUMMARY:END -->
