---
id: TASK-24
title: Use editor font from Minimal Theme Settings when active
status: Done
assignee: []
created_date: '2026-05-22 16:35'
updated_date: '2026-05-22 18:50'
labels: []
dependencies: []
priority: medium
ordinal: 5390.625
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
The sprint textarea does not respect the user's chosen editor font when the Minimal Theme Settings plugin is active. Minimal Theme Settings stores its font choice separately from Obsidian's built-in font setting. The plugin should detect when Minimal Theme Settings is active and read the editor font from it (e.g. via its saved data or CSS variable) so the sprint textarea renders in the correct font (currently set to Lilex).
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Sprint textarea uses the font set in Minimal Theme Settings when that plugin is active
- [x] #2 Falls back to Obsidian's default editor font when Minimal Theme Settings is not active
- [x] #3 No visible font change when neither custom font source is configured
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
One-line CSS fix: change the textarea's font-family to use `var(--font-editor-override, var(--font-editor))` so it picks up the Minimal Theme Settings font (--font-editor-override) when active, and falls back to Obsidian's built-in --font-editor otherwise.
<!-- SECTION:PLAN:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Changed `font-family` in `.dz-textarea` from `var(--font-editor)` to `var(--font-editor-override, var(--font-editor))` in styles.css. Minimal Theme Settings sets `--font-editor-override` on the document body when active, so this single CSS cascade change picks it up. Falls back to Obsidian's own `--font-editor` when the plugin is absent. No JS required.
<!-- SECTION:FINAL_SUMMARY:END -->
