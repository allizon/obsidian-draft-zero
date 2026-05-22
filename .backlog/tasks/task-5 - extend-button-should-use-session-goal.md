---
id: TASK-5
title: Extend button should use session goal, not hardcoded 5min/100 words
status: Done
assignee: []
created_date: '2026-05-21'
updated_date: '2026-05-22'
labels:
  - bug
dependencies: []
ordinal: 10000
---

## Description

The "Extend (+5 min / +100 words)" button in the completion UI always extends by 5 minutes or 100 words regardless of what the original session goal was. It should extend by whatever the original goal was (e.g. if the goal was 20 minutes, extend by 20 minutes; if the goal was 500 words, extend by 500 words).

Also update the button label dynamically to reflect the actual extension amount.

## Implementation

**PR:** https://github.com/allizon/obsidian-draft-zero/pull/4

**Changes:**

- `state.ts`: Added `originalGoal: Goal | null` to `SessionState`, set on `START`, preserved through `EXTEND`. The `EXTEND` action now uses `originalGoal.value` as the extension amount instead of hardcoded 300s/100 words. For time goals, resets `elapsedSeconds = 0` and sets `goal.value = originalGoal.value`. For word goals, sets `goal.value = currentWordCount + originalGoal.value`.
- `sprint-modal.ts`: Button label is now generated dynamically — e.g. "Extend (+10 min)" or "Extend (+500 words)" — based on `originalGoal`.
- `state.test.ts`: Added 3 new tests covering time extension amount, word extension amount, and that `originalGoal` is preserved across multiple sequential extensions.
