---
id: TASK-6
title: Always show timer and word count — remove hover fade
status: Done
assignee: []
created_date: '2026-05-21'
updated_date: '2026-05-22 16:37'
labels:
  - enhancement
dependencies:
  - TASK-22
modified_files:
  - obsidian-plugin/styles.css
ordinal: 4500
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
The status bar currently fades the detail text (timer, word count) and only shows it on hover. Remove this behavior — always show the full status. The minimal/hover interaction is too subtle and makes the info feel hidden.
<!-- SECTION:DESCRIPTION:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Removed opacity:0 from .dz-status-detail and the hover rule that revealed it. Detail text now sits at 0.7 opacity always, so timer and word count are always readable without interaction.
<!-- SECTION:FINAL_SUMMARY:END -->
