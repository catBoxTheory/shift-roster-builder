# Phase 2: Data Model, Tests, and Core Logic

## Status

- Status: Complete
- Date: 2026-06-05
- Core logic commit: `253b15c feat: add roster core logic tests`
- GitHub: [catBoxTheory/shift-roster-builder](https://github.com/catBoxTheory/shift-roster-builder)

## Goal

Implement the pure scheduling utilities that future UI phases will depend on: time parsing, shift hour calculation, conflict detection, and weekly hour totals.

## Scope

In scope:

- Add tests before implementation.
- Parse strict `HH:MM` time strings.
- Calculate same-day shift hours.
- Detect same-day overlapping shifts for the same employee.
- Detect employees scheduled for more than 5 consecutive days.
- Calculate weekly total hours per employee.
- Add a documentation log for the phase.

Out of scope:

- React state management.
- Employee forms.
- Shift editor UI.
- Conflict display UI.
- CSV export.
- Overnight shifts.

## Thought Process

The scheduling rules are the highest-risk part of the assignment because UI polish cannot compensate for incorrect roster logic. Phase 2 therefore keeps the logic isolated from React components and verifies it with unit tests before any UI depends on it.

The tests were written first and initially failed because the utility modules did not exist. That confirmed the tests were exercising new behavior rather than merely passing against existing code. The implementation then stayed small: plain functions, arrays, objects, and no scheduling libraries.

## Design Decisions

- Strict `HH:MM` parsing: avoids ambiguous inputs like `9:00` and keeps form validation predictable.
- Same-day shifts only: `endTime` must be after `startTime`, matching the v1 scope in the plan.
- Half-open time ranges: `[startTime, endTime)` means `09:00-12:00` and `12:00-17:00` are adjacent, not overlapping.
- Conflict objects include metadata: type, employee, day/days, shift IDs, and a human-readable message so the UI can explain conflicts later.
- Consecutive-day detection uses unique scheduled days per employee. Multiple shifts on one day do not artificially increase the consecutive-day count.
- Weekly totals are returned as a plain object keyed by employee ID, which is simple for React state and rendering.

## AI Tools And Assistants Used

- Codex / ChatGPT: implemented the test-first utility layer and checked edge cases against the assessment brief.
- `test-driven-development`: guided the red-green workflow for the pure logic.
- `karpathy-guidelines`: kept the implementation small and avoided speculative scheduling features.
- `document-generate`: guided this phase log structure.
- External AI model check, user-reported: another model reviewed/tested the Phase 2 functionality and reported that 3 core functions passed. The exact model name and raw output were not retained in this repository, so this is recorded as supporting review evidence rather than the primary verification source.

Human review remains important before UI phases because the conflict metadata shape will affect component design.

## Verification

Commands run:

```bash
npm test
```

Results:

- Initial test run failed as expected because `time.js`, `conflicts.js`, and `summary.js` did not exist yet.
- Final test run passed: 3 test files, 13 tests.
- Additional user-reported external model check: 3 functions passed.

Covered scenarios:

- Valid `HH:MM` parsing.
- Invalid time strings.
- Decimal shift hour calculations.
- Zero-length and overnight shift rejection.
- Same-employee same-day overlap detection.
- Adjacent shift non-conflict.
- Different employee and different day non-conflicts.
- Exactly 5 consecutive days allowed.
- 6 consecutive days flagged.
- 6 non-consecutive days allowed.
- Weekly totals by employee.

## Known Limitations And Follow-Up

- The UI does not consume these utilities yet.
- Form-level validation will be added in Phase 3.
- Conflict display and summary presentation will be added in later UI phases.
- Overnight shifts are intentionally unsupported for v1.

## Reviewer Notes

This phase creates the business-logic foundation required by the brief without relying on any third-party scheduling or roster library.
