# Phase 9: Employee Availability Preferences

## Status

- Status: Complete
- Date: 2026-06-05
- GitHub: [catBoxTheory/shift-roster-builder](https://github.com/catBoxTheory/shift-roster-builder)

## Goal

Let managers set per-employee availability constraints. Employees can be marked as unavailable on specific days of the week. Shift assignments on unavailable days are blocked at the reducer level with an inline error, using the same pattern as conflict blocking in Phase 6.

## Scope

In scope:

- Extend the employee model with `unavailableDays: number[]` (day indices 0-6).
- Add day toggle checkboxes in the new employee form and edit form.
- Show availability indicators ("Off: Mon, Sun") in the employee info view.
- Add visual hatching on unavailable grid cells in the roster grid.
- Add availability validation to `shift/add`, `shift/edit`, and `shift/move` in the reducer.
- Block assignments on unavailable days with an inline error message.
- Update sample data to include `unavailableDays` defaults.
- Add reducer tests for availability validation.
- Add EmployeePanel tests for availability toggles and display.
- Update existing tests to account for the new `unavailableDays` field.

Out of scope:

- Availability-based filtering or suggestions.
- Per-time-slot availability (only full-day unavailability).
- CSV export changes for availability.
- Drag-and-drop changes.
- Final README screenshot capture.

## Thought Process

The assessment brief mentions availability preferences as a stretch goal: "Alex cannot work Mondays." The simplest model is an array of day indices where the employee is unavailable. This is stored on the employee object and checked during shift validation.

The validation happens at the reducer boundary, before conflict detection. This is the same layering used for role validation and conflict blocking: cheap checks first, expensive checks second. If the employee is unavailable on the target day, the shift is rejected with a specific error message and the roster state is unchanged.

The UI uses the same checkbox pattern as role selection, reusing the `toggleValue` helper. The grid cells show a hatched background for unavailable days so the manager can see at a glance which days are restricted.

## Design Decisions

- `unavailableDays` is an array of integer day indices (0=Mon, 6=Sun), matching the `day` field on shifts. This avoids string-to-index conversion.
- The `validateEmployeeInput` function sanitizes `unavailableDays`: filters to valid integers 0-6, defaults to `[]` if missing or not an array.
- Availability validation runs after `validateShiftInput` passes but before conflict detection. This keeps the validation order logical: schema → availability → scheduling conflicts.
- The same `validateAvailability` helper is used by `shift/add`, `shift/edit`, and `shift/move`.
- Grid cells use a CSS hatched background (`repeating-linear-gradient`) for unavailable days, which is visually distinct without being alarming.
- The "Off: Mon, Sun" tag in the employee info view uses day names for readability.
- Sample employee Blair Wong has `unavailableDays: [6]` (Sunday) to demonstrate the feature without blocking existing sample shifts.

## AI Tools And Assistants Used

- Claude Code /mimo-v2.5-pro: implemented the availability validation, UI toggles, grid indicators, tests, styles, and documentation.
- `test-driven-development`: guided the red-green flow for reducer availability validation.
- `karpathy-guidelines`: kept the feature scoped to day-level unavailability only.
- `frontend-design`: guided the hatched cell treatment and availability tag styling.

## Verification

Commands run:

```bash
npm test -- src/hooks/useRoster.test.js
npm test -- src/components/EmployeePanel.test.jsx
npm test
npm run build
```

Results:

- Focused reducer test run passed: 1 file, 20 tests.
- Focused EmployeePanel test run passed: 1 file, 9 tests.
- Full test suite passed: 8 files, 63 tests.
- Production build passed.

Covered scenarios:

- Reject adding a shift on an unavailable day.
- Reject editing a shift to an unavailable day.
- Reject moving a shift to an unavailable day.
- Allow shifts on available days when some days are unavailable.
- Submit new employee with unavailable days.
- Edit employee unavailable days.
- Show availability tags in employee info view.

## Known Limitations And Follow-Up

- Availability is day-level only; per-time-slot availability is not supported.
- Availability is not included in CSV export.
- No visual distinction between "unavailable day with shifts" and "unavailable day without shifts" in the grid.
- The hatched background is subtle; a more prominent indicator could be added if needed.

## Reviewer Notes

This phase completes the second stretch goal from the assessment brief. The availability system is lightweight: an array of day indices on the employee object, checked during shift validation. It reuses the existing error-blocking pattern so the user experience is consistent.
