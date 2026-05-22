---
id: TASK-15
title: Document CSS specificity patterns for Obsidian plugin styles
status: To Do
assignee: []
created_date: '2026-05-21'
updated_date: '2026-05-21'
labels:
  - docs
dependencies: []
ordinal: 30000
---

## Description

Obsidian themes and core styles create recurring specificity traps for plugin CSS. Document the patterns that work reliably, for future reference.

Known issues encountered:
- Textarea focus border/shadow requires `:focus` AND `:focus-visible` overrides, and may need `body` prepended for sufficient specificity
- Theme-level `!important` rules can still win if specificity is higher than the plugin rule
- Font variables: `var(--font-text)` is the correct universal variable; `var(--font-editor)` resolves to system sans-serif if the user hasn't set a font override
- All sprint modal rules should be prefixed with `.dz-sprint-modal` at minimum to avoid collisions

Document in `docs/css-obsidian-notes.md` once stable patterns are confirmed.
