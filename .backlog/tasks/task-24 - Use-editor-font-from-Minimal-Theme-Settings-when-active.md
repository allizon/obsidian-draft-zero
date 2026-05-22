---
id: TASK-24
title: Use editor font from Minimal Theme Settings when active
status: To Do
assignee: []
created_date: '2026-05-22 16:35'
updated_date: '2026-05-22 16:36'
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
- [ ] #1 Sprint textarea uses the font set in Minimal Theme Settings when that plugin is active
- [ ] #2 Falls back to Obsidian's default editor font when Minimal Theme Settings is not active
- [ ] #3 No visible font change when neither custom font source is configured
<!-- AC:END -->
