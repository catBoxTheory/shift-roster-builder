# Phase 6: Conflict UI and Summary Panel

## Status

- Status: Complete
- Date: 2026-06-05
- Conflict summary commit: Pending
- GitHub: [catBoxTheory/shift-roster-builder](https://github.com/catBoxTheory/shift-roster-builder)

## Goal

Make roster correctness visible to the reviewer. The app now highlights conflicting shifts in the grid and replaces the placeholder summary with totals, weekly hours, and readable conflict explanations.

## Scope

In scope:

- Add `ConflictBadge`.
- Highlight conflicting shift cards in `RosterGrid`.
- Build `SummaryPanel`.
- Show employee count, shift count, total hours, and conflict count.
- Show weekly hours per employee sorted high-to-low.
- Show conflict explanations for same-day overlaps and more-than-5-consecutive-day conflicts.
- Wire conflict and summary state through `App`.
- Add component tests before implementation.
- Verify the rendered conflict flow in Browser on desktop and mobile-width viewports.

Out of scope:

- CSV export.
- Drag-and-drop scheduling.
- Availability preferences.
- Final README screenshot/demo capture.

## Thought Process

The reducer already computed `conflicts`, `conflictingShiftIds`, and `weeklyHoursByEmployee`, so this phase focused on presenting that derived state clearly. I kept the conflict UI close to the manager's workflow: the grid shows which shift cards need attention, while the summary panel explains why.

The summary panel is intentionally compact. It gives the reviewer quick counts first, then weekly hours sorted by workload, then conflict details. This supports the assessment's correctness requirement without adding a separate reporting view or extra navigation.

## Design Decisions

- Conflict cards use both a left accent and a text badge, so the signal is not color-only.
- `ConflictBadge` is a small reusable component because grid cards may have one or more conflict reasons.
- Summary rows sort by hours descending, then employee name, so the busiest employees are easiest to scan.
- Conflict explanations translate internal conflict metadata into reviewer-friendly text.
- The right panel width was increased slightly because the summary now contains real information, not only three counts.
- Browser QA created a real overlapping shift through the UI instead of relying only on static sample data.

## AI Tools And Assistants Used

- Codex / ChatGPT: implemented and reviewed conflict badges, summary panel, tests, styling, and documentation.
- `test-driven-development`: used for the new RosterGrid conflict behavior and SummaryPanel behavior.
- `frontend-design`: guided the restrained, operations-tool visual treatment for conflict states.
- `build-web-apps:react-best-practices`: used to keep derived data and rendering logic simple.
- Browser plugin: verified the rendered overlap workflow, summary text, console health, and mobile-width layout.
- Human review: user reported Phase 5 passed after their own testing and another model's testing before Phase 6 started.

## Verification

Commands run:

```bash
npm test -- src/components/SummaryPanel.test.jsx
npm test -- src/components/RosterGrid.test.jsx
npm test
npm run build
npm audit --audit-level=moderate
```

Results:

- Initial SummaryPanel focused test run failed as expected because `SummaryPanel.jsx` did not exist yet.
- Initial RosterGrid focused test run failed as expected because shift cards were not marked as conflicting yet.
- Focused SummaryPanel test run passed: 1 file, 3 tests.
- Focused RosterGrid test run passed: 1 file, 7 tests.
- Full test run passed: 7 files, 36 tests.
- Production build passed.
- Dependency audit passed with 0 vulnerabilities.

Browser checks:

- Browser target: `http://127.0.0.1:4174/`
- Page title: `Shift Roster Builder`
- Desktop interaction proof: added a `Supervisor` shift for Alex Chen on Monday from `12:00-18:00`, overlapping the existing `Cashier` shift from `09:00-17:00`.
- Desktop result: both overlapping cards showed `Conflict`, summary conflict count became `1`, total hours showed `25h`, and the conflict detail read `Alex Chen has overlapping shifts on Mon.`
- Mobile-width result at `390px`: body width did not overflow, the roster grid remained horizontally scrollable inside the panel, and the conflict cards/details remained present.
- Console warnings/errors: none.

Covered scenarios:

- Grid marks conflicting shift cards with a visible badge.
- Summary shows roster totals.
- Summary explains overlap conflicts.
- Summary explains more-than-5-consecutive-day conflicts.
- Summary sorts employee rows by weekly hours descending.
- Summary shows a clean empty state when there are no conflicts.

## Known Limitations And Follow-Up

- CSV export is still not implemented.
- Consecutive-day conflict UI is covered by component tests, but the browser QA focused on the overlap flow because it is faster to create manually.
- Final screenshot/demo capture still belongs in submission polish.
- No persistence is implemented; data resets on page reload.

## Reviewer Notes

Phase 6 completes the required correctness visibility: assignments are shown, invalid conflict states are highlighted, and the summary gives the reviewer enough context to trust the scheduling rules.
