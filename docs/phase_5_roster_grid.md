# Phase 5: Weekly Roster Grid and Shift Editor

## Status

- Status: Complete
- Date: 2026-06-05
- Roster grid commit: Pending
- GitHub: [catBoxTheory/shift-roster-builder](https://github.com/catBoxTheory/shift-roster-builder)

## Goal

Build the weekly assignment workflow. Managers can now see employees as rows, days as columns, create shifts from a cell, and edit or remove existing shift cards.

## Scope

In scope:

- Build `RosterGrid`.
- Build `ShiftEditor`.
- Wire shift add, edit, and remove actions through `useRoster`.
- Show shift cards in employee/day cells.
- Support multiple shifts in the same cell.
- Show the shift role as a visible badge.
- Keep validation feedback visible when a shift submission is invalid.
- Add component tests before implementation.
- Use browser validation for the rendered add-shift flow.

Out of scope:

- Conflict highlighting inside the grid.
- Detailed summary rows.
- CSV export.
- Drag-and-drop scheduling.
- Final README screenshot capture.

## Thought Process

This phase completes the second core workflow after employee management: assigning employees to day/time shifts. The existing reducer already owns shift validation and derived conflict data, so the UI was kept as a thin interaction layer around the state actions.

The grid uses employees as rows and weekdays as columns because that matches the assessment brief and is easy for a small-team manager to scan. Each cell has a small add control, while existing shifts are clickable cards. The editor is a compact overlay inside the grid panel, which keeps the user in context rather than navigating away.

During browser validation, the add-shift flow showed that the browser automation changed the visible time input values but the original submit handler was relying only on React state. The editor now reads current form values on submit as well, so the submitted data matches the fields the user can see.

## Design Decisions

- Use a grid/table-like layout so weekdays and employees remain visually aligned.
- Use shift cards instead of dense plain text so each assignment is a clear clickable target.
- Keep the add control in each cell small and consistent to avoid visual clutter.
- Sort shifts within each cell by start time for predictable scanning.
- Reuse reducer validation before dispatching from the editor so invalid shift times keep the editor open with an inline error.
- Read form values on submit to avoid stale controlled-state submissions and to better match visible UI state.
- Keep conflict styling for Phase 6 because this phase is focused on creation/edit/removal mechanics.

## AI Tools And Assistants Used

- Codex / ChatGPT: implemented and reviewed the grid, editor, tests, styling, and documentation.
- `build-web-apps:react-best-practices`: checked React component structure, derived data, and event handling.
- `build-web-apps:frontend-testing-debugging`: guided rendered UI validation and interaction checks.
- Browser plugin: opened the local Vite app, verified page identity, console health, and the add-shift interaction.
- `test-driven-development`: guided the component test-first flow.
- Human review: user approved Phase 4 and reported additional Chrome DevTools testing before Phase 5 started.

## Verification

Commands run:

```bash
npm test -- src/components/RosterGrid.test.jsx
npm test
npm run build
npm audit --audit-level=moderate
```

Results:

- Initial focused component test run failed as expected because `RosterGrid.jsx` did not exist yet.
- Focused RosterGrid test run passed: 1 file, 6 tests.
- Full test run passed: 6 files, 32 tests.
- Production build passed.
- Dependency audit passed with 0 vulnerabilities.
- Browser smoke tests passed at `http://127.0.0.1:4173/`.

Browser checks:

- Page URL: `http://127.0.0.1:4173/`
- Page title: `Shift Roster Builder`
- DOM snapshot contained meaningful `Roster Grid` content.
- No Vite/framework error overlay was present.
- Console warnings/errors: none.
- Interaction proof: added a `Cook` shift for Blair Wong on Tuesday from `10:00-15:30`; the editor closed and the new shift card appeared in the grid.
- Mobile-width proof: at `390px` wide, the app stacked into one column, the page body did not horizontally overflow, and the roster table remained horizontally scrollable inside its panel.

Covered scenarios:

- Grid renders day headers, employee rows, and existing shifts.
- Empty cell creates a shift.
- Existing shift card opens editing.
- Existing shift can be removed.
- Invalid shift times keep the editor open and show validation.
- Current form time values are submitted even if React state has not re-rendered.

## Known Limitations And Follow-Up

- Conflicting shifts are detected in state but are not yet visually highlighted in the grid.
- Summary panel currently shows high-level counts only.
- No CSV export yet.
- The grid is horizontally scrollable on narrow screens, but mobile polish is not final.

## Reviewer Notes

This phase completes shift assignment mechanics and keeps the code aligned with the reducer-backed data model. Phase 6 should focus on making correctness visible: conflict badges, conflict explanations, and weekly hour summaries.
