# Phase 6: Conflict UI and Summary Panel

## Status

- Status: Complete
- Date: 2026-06-05
- Conflict summary commit: `c621a86 feat: add conflict summary panel`
- Conflict summary correction commit: `9dcea6b fix: simplify conflict summary flags`
- Conflict blocking correction commit: `d5978b0 fix: block conflicting shift changes`
- Scoped error and summary cleanup commit: `b9bd2f5 fix: scope shift errors to editor`
- GitHub: [catBoxTheory/shift-roster-builder](https://github.com/catBoxTheory/shift-roster-builder)

## Goal

Make roster correctness visible without adding noise to normal scheduling. The app blocks users from creating conflicting shifts through add/edit actions, keeps conflict errors inside the shift editor, and keeps the summary focused on totals, weekly hours, and CSV export.

## Scope

In scope:

- Add `ConflictBadge`.
- Highlight conflicting shift cards in `RosterGrid`.
- Build `SummaryPanel`.
- Show employee count, shift count, and total hours.
- Show weekly hours per employee sorted high-to-low.
- Keep invalid derived conflict states visually marked in the grid if they ever appear.
- Wire conflict and summary state through `App`.
- Add component tests before implementation.
- Verify the rendered conflict flow in Browser on desktop and mobile-width viewports.
- Add post-review reducer validation so conflicting shift add/edit attempts are rejected before they enter the roster.
- Remove the summary conflict-details section after review.

Out of scope:

- CSV export.
- Drag-and-drop scheduling.
- Availability preferences.
- Final README screenshot/demo capture.

## Thought Process

The reducer already computed `conflicts`, `conflictingShiftIds`, and `weeklyHoursByEmployee`, so this phase originally focused on presenting that derived state clearly. Later review showed that the better user experience is to prevent conflicts during shift entry instead of asking the manager to clean them up afterward.

The summary panel is intentionally compact. It gives the reviewer quick counts first, then weekly hours sorted by workload. Conflict details were removed after review because normal UI actions now block conflicts before they enter the roster.

After user and external-model testing, visible conflict counts were removed because they added noise without improving the scheduling decision.

After a later review, the interaction model changed again: the manager should not be allowed to save a shift that would create an overlap or schedule an employee for more than 5 consecutive days. The conflict display remains useful for derived or preloaded invalid states, but normal UI entry now prevents those states.

## Design Decisions

- Conflict cards use both a left accent and a text badge, so the signal is not color-only.
- `ConflictBadge` is a small reusable component because grid cards may have one or more conflict reasons.
- Summary rows sort by hours descending, then employee name, so the busiest employees are easiest to scan.
- Conflict explanations translate internal conflict metadata into reviewer-friendly text.
- The right panel width was increased slightly because the summary now contains real information, not only three counts.
- Browser QA created a real overlapping shift through the UI instead of relying only on static sample data.
- Conflict counts are not shown in the summary header, summary facts, employee rows, or conflict badges.
- Shift add/edit actions now validate the proposed roster before committing it.
- Overlap and consecutive-day conflicts return clear inline errors and leave the previous roster unchanged.
- Shift conflict errors stay inside the shift editor and do not appear in the employee form.
- Summary conflict details and the `No conflicts` empty state are not rendered.

## AI Tools And Assistants Used

- Codex / ChatGPT: implemented and reviewed conflict badges, summary panel, tests, styling, and documentation.
- `test-driven-development`: used for the new RosterGrid conflict behavior and SummaryPanel behavior.
- `frontend-design`: guided the restrained, operations-tool visual treatment for conflict states.
- `build-web-apps:react-best-practices`: used to keep derived data and rendering logic simple.
- Browser plugin: verified the rendered overlap workflow, summary text, console health, and mobile-width layout.
- Human review: user reported Phase 5 passed after their own testing and another model's testing before Phase 6 started.
- Post-review human and AI review: prompted the change from accepting-and-flagging conflicts to blocking conflicting shift changes.

## Verification

Commands run:

```bash
npm test -- src/components/SummaryPanel.test.jsx
npm test -- src/components/RosterGrid.test.jsx
npm test -- src/hooks/useRoster.test.js
npm test
npm run build
npm audit --audit-level=moderate
```

Results:

- Initial SummaryPanel focused test run failed as expected because `SummaryPanel.jsx` did not exist yet.
- Initial RosterGrid focused test run failed as expected because shift cards were not marked as conflicting yet.
- Post-review correction tests failed first because the summary still showed visible conflict counts and repeated overlap details.
- Focused SummaryPanel test run passed: 1 file, 5 tests.
- Focused RosterGrid test run passed: 1 file, 7 tests.
- Full test run passed: 7 files, 38 tests.
- Production build passed.
- Dependency audit passed with 0 vulnerabilities.
- Post-review conflict-blocking tests failed first because the reducer still accepted overlapping and 6-consecutive-day shift changes.
- Final conflict-blocking focused test run passed: 1 file, 11 tests.
- Scoped-error and summary-cleanup tests failed first because shift conflict errors leaked into `EmployeePanel` and `SummaryPanel` still rendered conflict details.
- Final focused component tests passed: EmployeePanel 6 tests, RosterGrid 8 tests, SummaryPanel 5 tests.
- Final full test run passed: 8 files, 47 tests.
- Final production build passed.

Browser checks:

- Browser target: `http://127.0.0.1:4174/`
- Page title: `Shift Roster Builder`
- Desktop interaction proof: added a `Supervisor` shift for Alex Chen on Monday from `12:00-18:00`, overlapping the existing `Cashier` shift from `09:00-17:00`.
- Desktop result: both overlapping cards showed `Conflict`, summary conflict count became `1`, total hours showed `25h`, and the conflict detail read `Alex Chen has overlapping shifts on Mon.`
- Mobile-width result at `390px`: body width did not overflow, the roster grid remained horizontally scrollable inside the panel, and the conflict cards/details remained present.
- Console warnings/errors: none.
- Correction proof at `http://127.0.0.1:4175/`: after creating the same overlap, the summary showed no conflict count pill, no `Conflicts` fact row, no conflict count in employee rows, and one detail item: `Alex Chen has overlapping shifts.`
- Conflict-blocking proof at `http://127.0.0.1:4177/`: attempted to add a second Monday shift for Alex Chen from `12:00-18:00`; the app showed `Employee already has an overlapping shift.`, kept the roster at 3 shifts, and logged no console errors.
- Scoped-error proof at `http://127.0.0.1:4178/`: attempted the same overlap; the shift editor stayed open with the error, the employee panel did not show the error, the summary showed no `Conflict details` or `No conflicts`, the roster stayed at 3 shifts, and console errors were empty.

Covered scenarios:

- Grid marks conflicting shift cards with a visible badge.
- Summary shows roster totals.
- Summary sorts employee rows by weekly hours descending.
- Summary does not render conflict details or a no-conflicts empty state.
- Reducer rejects adding an overlapping shift.
- Reducer rejects editing a shift into an overlap.
- Reducer rejects adding a shift that would exceed 5 consecutive days.
- RosterGrid rejects overlapping shift attempts before dispatch and keeps the editor open.
- EmployeePanel ignores shift-specific conflict errors.

## Known Limitations And Follow-Up

- At the end of Phase 6, CSV export was still pending; it was implemented later in Phase 7.
- Consecutive-day conflict blocking is covered by reducer tests, while browser QA focused on the overlap flow because it is faster to create manually.
- Final screenshot/demo capture still belongs in submission polish.
- No persistence is implemented; data resets on page reload.

## Reviewer Notes

Phase 6 completes the required correctness path: normal UI actions prevent invalid schedules, shift errors appear where the user is editing, and the summary stays focused on review metrics.
