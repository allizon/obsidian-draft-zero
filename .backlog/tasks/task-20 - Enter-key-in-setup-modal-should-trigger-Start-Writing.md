---
id: TASK-20
title: Enter key in setup modal should trigger Start Writing
status: Done
assignee:
  - Alix Holt
created_date: '2026-05-22 15:54'
updated_date: '2026-05-23 00:27'
labels: []
dependencies: []
priority: low
ordinal: 5449.21875
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Pressing Enter on the sprint setup modal should submit the form, equivalent to clicking the "Start Writing" button. This allows keyboard-driven flow without reaching for the mouse.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Pressing Enter anywhere in the setup modal triggers onSubmit with the current form values
- [x] #2 Enter key does not trigger submit when a non-Enter key is pressed
- [x] #3 All existing 128 tests continue to pass
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
## Implementation Plan

### Approach
- Install jsdom devDependency for DOM-level testing
- Add vitest.config.ts with jsdom environment + obsidian module alias
- Create src/tests/__mocks__/obsidian.ts with minimal stubs (App, Modal, Setting)
- Follow TDD: write failing test first, then implement

### Steps
1. `npm install --save-dev jsdom` in obsidian-plugin/
2. Create `obsidian-plugin/vitest.config.ts` (jsdom env + obsidian alias)
3. Create `obsidian-plugin/src/tests/__mocks__/obsidian.ts`
4. RED: write `src/tests/setup-modal.test.ts` — Enter key calls onSubmit
5. GREEN: extract `submit()` from button onClick; add keydown listener on contentEl
6. Verify all 128 existing tests still pass

### Key files
- `obsidian-plugin/src/setup-modal.ts` — add `submit()` + keydown listener
- `obsidian-plugin/src/tests/setup-modal.test.ts` — new test file
- `obsidian-plugin/src/tests/__mocks__/obsidian.ts` — new obsidian stub
- `obsidian-plugin/vitest.config.ts` — new vitest config
<!-- SECTION:PLAN:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Added Enter key support to the setup modal via a `keydown` listener on `contentEl`. Extracted the inline button callback into a `private submit()` method that both the button's onClick and the keydown handler call. Also set up the test infrastructure needed to unit-test Modal behavior: installed jsdom, added vitest.config.ts with jsdom environment and an obsidian module alias, and created a minimal obsidian stub (`__mocks__/obsidian.ts`) with fluent-proxy stubs for Modal, App, and Setting. Two new tests cover the Enter-key path and the non-Enter key no-op. All 130 tests pass.
<!-- SECTION:FINAL_SUMMARY:END -->
