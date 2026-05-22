---
id: TASK-8
title: Default textarea font to current theme's editor font
status: Done
assignee: []
created_date: '2026-05-21'
updated_date: '2026-05-22 15:34'
labels:
  - enhancement
dependencies: []
modified_files:
  - obsidian-plugin/styles.css
ordinal: 16000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
The textarea currently uses `var(--font-text)` (the UI/reading font). It should default to `var(--font-editor)` (the editor/monospace font from the current theme), so the sprint writing surface matches what the user sees when editing notes normally in Obsidian. It should be the same size, also -- it should be as close to the user's regular editing experience as possible.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Textarea font family uses var(--font-editor), not var(--font-text)
- [x] #2 Textarea font size uses var(--font-text-size), not the hardcoded 1rem
- [x] #3 Textarea line height uses var(--line-height-normal), not the hardcoded 1.6
- [x] #4 Visual match: sprint surface looks like typing in an Obsidian editor pane
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
## Implementation Plan

### Overview
Three CSS variable swaps in `obsidian-plugin/styles.css` — no TypeScript changes needed.

Obsidian exposes the user's editor surface via three CSS variables:
- `--font-editor` — the editor font family (respects the user's "Editor font" setting)
- `--font-text-size` — the base font size (shared by editor and reading views)
- `--line-height-normal` — Obsidian's standard line height token

### Changes

**File: `obsidian-plugin/styles.css`, lines 52–54**

| Line | Before | After |
|------|--------|-------|
| 52 | `font-size: 1rem;` | `font-size: var(--font-text-size);` |
| 53 | `font-family: var(--font-text) !important;` | `font-family: var(--font-editor) !important;` |
| 54 | `line-height: 1.6;` | `line-height: var(--line-height-normal);` |

### Verification
After build + deploy + plugin reload:
1. Open a sprint modal
2. Confirm the textarea font matches the editor font in a regular note (especially visible when the theme sets a custom editor font like iA Writer Mono or similar)
3. Confirm font size feels the same as in the editor
<!-- SECTION:PLAN:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Swapped three hardcoded values in `.dz-sprint-modal textarea.dz-textarea` for Obsidian CSS variables: `--font-editor` (family), `--font-text-size` (size), and `--line-height-normal` (line height). Verified via computed styles in the live plugin — font stack resolves to the user's custom editor fonts (CommitMonoAlli, 0xProto Nerd Font), size 13px, line height 22.75px.
<!-- SECTION:FINAL_SUMMARY:END -->
