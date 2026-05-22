---
id: TASK-30
title: 'Fix: onChange fires spuriously on no-op dispatches in state machine'
status: Done
assignee: []
created_date: '2026-05-22 19:38'
updated_date: '2026-05-22 19:40'
labels:
  - bug
dependencies: []
priority: medium
ordinal: 42000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
In `state.ts`, `dispatch()` unconditionally spreads `{ ...prev }` into `next` at the top of the function. The no-op guard `if (next !== prev)` then always evaluates to true (different object reference), so `onChange` is called after every dispatch — including invalid ones like TICK while paused, PAUSE while already paused, etc. This causes unnecessary re-renders on every spurious action.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 onChange is not called when a dispatched action is a no-op for the current status
- [x] #2 All 128 existing tests continue to pass
- [x] #3 Tests that previously had spurious-fire comments now assert onChange is not called on no-ops
<!-- AC:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Changed `let next = { ...prev }` to `let next: SessionState = prev` so the sentinel is the same reference. Each valid branch now creates a new spread only when it actually changes something. The `if (next !== prev)` guard now correctly suppresses onChange on no-ops. All 128 tests pass; no-op tests now assert onChange call counts rather than just state field values.
<!-- SECTION:FINAL_SUMMARY:END -->
