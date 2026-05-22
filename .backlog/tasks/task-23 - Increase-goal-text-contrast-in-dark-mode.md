---
id: TASK-23
title: Increase goal text contrast in dark mode
status: Done
assignee:
  - Allison
created_date: '2026-05-22 16:34'
updated_date: '2026-05-22 18:22'
labels: []
dependencies: []
priority: medium
ordinal: 5343.75
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
The goal text displayed during a sprint is too subtle in dark mode — it blends into the background too much to be comfortably readable. Increase its contrast/opacity so it's legible without being distracting.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Goal text is clearly readable in dark mode without straining
- [x] #2 Goal text remains unobtrusive in light mode
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
Add `.theme-dark` CSS overrides in `styles.css` to increase goal text contrast in dark mode:

1. Raise `.dz-bottom-row` opacity from 0.2 to 0.45 in dark mode
2. Change `.dz-bottom-status` color from `--text-faint` to `--text-muted` in dark mode

Light mode behavior is unchanged. Hover still brings opacity to 1 in both modes.
<!-- SECTION:PLAN:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Added `.theme-dark` CSS overrides in `styles.css`: raised `.dz-bottom-row` opacity from 0.2 to 0.45 and switched `.dz-bottom-status` color to `--text-muted` (from `--text-faint`) in dark mode. Light mode behavior is unchanged — the bottom row still defaults to 0.2 opacity and uses `--text-faint`.
<!-- SECTION:FINAL_SUMMARY:END -->
