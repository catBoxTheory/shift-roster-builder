# Phase 3: Roster State and Validation

## Status

- Status: Complete
- Date: 2026-06-05
- Core state commit: `dc1a8d1 feat: add roster state validation`
- GitHub: [catBoxTheory/shift-roster-builder](https://github.com/catBoxTheory/shift-roster-builder)

## Goal

Add the reducer-backed roster state layer that future UI components will use for employee management, shift management, validation, and derived data.

## Scope

In scope:

- Implement a `useRoster` hook backed by `useReducer`.
- Add sample employees and shifts.
- Add reducer actions for add/edit/remove employee.
- Add reducer actions for add/edit/remove shift.
- Add reset action for sample data.
- Validate employee inputs.
- Validate shift inputs.
- Recalculate conflicts and weekly totals after state changes.
- Add tests before implementation.

Out of scope:

- Employee panel UI.
- Shift editor UI.
- Roster grid rendering.
- Browser interactions.
- Persistence or localStorage.
- Backend/database integration.

## Thought Process

The app will eventually have several UI surfaces editing the same roster data. A reducer keeps those state transitions explicit and easy to inspect. The hook returns state plus action helpers for React components, while the reducer and validation functions are exported separately so the core behavior can be tested without rendering React.

Validation lives at the state boundary instead of inside UI components. This keeps future forms simpler and ensures invalid employee or shift records do not enter the roster state.

## Design Decisions

- `useReducer` over a larger state library: the state is still small enough for local React state.
- Exported reducer and validators: supports direct unit tests and makes future UI work safer.
- `createRosterState`: centralizes derived values so conflicts and totals stay consistent after every action.
- `lastErrors`: invalid actions preserve existing state and expose validation messages for future forms.
- Employee removal also removes that employee's shifts: avoids orphaned shifts and keeps the summary grid valid.
- Shift validation checks employee existence, role membership, valid day, and same-day time range.
- Sample data has no intentional conflicts so the first UI state starts clean.

## AI Tools And Assistants Used

- Codex / ChatGPT: implemented and reviewed the reducer, validators, tests, and documentation.
- `test-driven-development`: guided the red-green implementation flow.
- `karpathy-guidelines`: kept the state layer small and avoided premature persistence or UI abstractions.
- External AI model check, user-reported: the user tested `useRoster.js` and also asked another model to test the functionality. The reported result was that `useRoster.js` can run and has no known logical error. Raw external output is not stored in this repository, so this is supporting review evidence rather than the primary verification source.

## Verification

Commands run:

```bash
npm test -- src/hooks/useRoster.test.js
npm test
npm run build
```

Results:

- Initial Phase 3 test run failed as expected because `src/hooks/useRoster.js` did not exist yet.
- Focused Phase 3 test run passed: 1 file, 8 tests.
- Full test run passed: 4 files, 21 tests.
- Production build passed.
- Additional user-reported validation: `useRoster.js` was tested manually and by another model with no logical errors reported.

Covered scenarios:

- Employee name required.
- Employee names must be unique.
- Employee must have at least one role.
- Existing employee can keep their own name when editing.
- Shift employee must exist.
- Shift role must belong to selected employee.
- Shift day must be valid.
- Shift end time must be after start time.
- Add/edit/remove employee.
- Removing an employee removes that employee's shifts.
- Add/edit/remove shift.
- Derived conflict metadata and weekly totals are recalculated.
- Reset returns to sample data.

## Known Limitations And Follow-Up

- The UI does not consume `useRoster` yet.
- Validation messages are available in state but not displayed yet.
- No persistence is implemented; data remains in memory.
- Phase 4 should connect employee forms to this hook.

## Reviewer Notes

This phase creates the application state boundary. Later UI phases should mostly call the hook actions instead of duplicating business rules in components.
