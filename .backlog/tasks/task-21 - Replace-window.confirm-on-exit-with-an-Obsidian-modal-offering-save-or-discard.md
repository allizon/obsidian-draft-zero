---
id: TASK-21
title: Replace window.confirm on exit with an Obsidian modal offering save or discard
status: To Do
assignee: []
created_date: '2026-05-22 16:05'
labels: []
dependencies: []
priority: medium
ordinal: 36000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
The current exit flow uses window.confirm(), which is jarring and doesn't fit Obsidian's UI. Replace it with a proper Obsidian Modal that gives the user two explicit choices: save progress (equivalent to the current finish() path) or discard and close without saving.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Clicking Exit opens an Obsidian modal instead of a browser confirm dialog
- [ ] #2 Modal offers a Save progress button (writes the session result) and a Discard button (closes without saving)
- [ ] #3 Modal can be cancelled (Escape or close button) to return to the sprint
<!-- AC:END -->
