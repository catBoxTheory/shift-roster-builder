# Phase 7: Stretch Goals

## Status

- Status: Complete
- Date: 2026-06-05
- CSV export commit: `6239b54 feat: add roster csv export`
- GitHub: [catBoxTheory/shift-roster-builder](https://github.com/catBoxTheory/shift-roster-builder)

## Goal

Add one useful stretch feature after the required roster workflow had passed user and AI-assisted review. The selected stretch was CSV export because it improves reviewability and is small enough to verify without risking the stable core.

## Scope

In scope:

- Export the current weekly roster as CSV.
- Include employee, role, day, start, end, hours, and conflict notes.
- Escape commas, quotes, and newline-like values safely for spreadsheet import.
- Add an `Export CSV` action to the summary panel.
- Add tests for CSV generation and summary-panel export wiring.
- Verify the rendered app in Browser.

Out of scope:

- Drag-and-drop scheduling.
- Availability preferences.
- Mobile redesign beyond preserving the existing responsive layout.
- Backend persistence or saved roster files.
- Final screenshot/demo capture for submission.

## Thought Process

The required app was already stable after Phase 6 and the post-review correction, so this phase needed a low-risk stretch. CSV export was chosen over drag-and-drop because it is directly useful to a shift manager and does not disturb the scheduling interactions that had already been tested.

The export logic lives in a utility instead of inside the component. That keeps the data transformation testable and leaves the React code responsible only for wiring the current roster state to a file download action.

The CSV includes conflict notes per shift. This gives exported data the same correctness context shown in the UI without reintroducing visible conflict counts into the app.

## Design Decisions

- `buildRosterCsv` accepts plain `employees`, `shifts`, and `conflicts` so it can be tested without rendering React.
- Rows are sorted by day, employee name, and start time to make exports predictable.
- Hours are derived with the existing `calculateShiftHours` helper so exported totals follow the same domain rules as the summary UI.
- Conflict notes are attached to affected shifts and deduplicated per note type.
- The `Export CSV` button sits at the bottom of the summary panel because exporting is a review action, not part of shift entry.
- The download helper stays small and browser-only in `App.jsx`; it creates a CSV Blob and clicks a temporary anchor with a dated filename.

## AI Tools And Assistants Used

- Codex / ChatGPT: planned and implemented the CSV utility, export wiring, tests, styling, and documentation.
- `test-driven-development`: used to write failing CSV utility and SummaryPanel export tests before implementation.
- `build-web-apps:react-best-practices`: used to keep the feature as a small utility plus simple component wiring.
- `build-web-apps:frontend-testing-debugging`: used for the verification flow.
- Browser plugin: verified the rendered Phase 7 UI at `http://127.0.0.1:4176/`.
- Human review: Phase 7 started after the user and another AI model reviewed the previous phase and approved moving forward.

## Verification

Commands run:

```bash
npm test -- src/utils/csvExport.test.js
npm test -- src/components/SummaryPanel.test.jsx
npm test
npm run build
npm audit --audit-level=moderate
git diff --check
```

Results:

- Initial focused CSV test failed as expected because `csvExport.js` did not exist yet.
- Initial SummaryPanel export test failed as expected because the export button was not rendered yet.
- Focused CSV tests passed.
- Focused SummaryPanel tests passed.
- Full test suite passed: 8 files, 43 tests.
- Production build passed.
- Dependency audit passed with 0 vulnerabilities.
- `git diff --check` passed.

Browser checks:

- Browser target: `http://127.0.0.1:4176/`
- Page title: `Shift Roster Builder`
- Phase status rendered as `Phase 7 complete`.
- Exactly one `Export CSV` button was present.
- The export button was visible and enabled.
- Console errors: none.

## Known Limitations And Follow-Up

- The in-app Browser does not support direct download-event validation, so the file-save behavior is covered by unit tests for CSV generation and component tests for button wiring.
- No roster persistence is implemented; the export captures the current in-memory roster.
- Drag-and-drop and availability preferences remain intentionally skipped.
- Final README screenshot or demo capture remains for Phase 8.

## Reviewer Notes

Phase 7 is deliberately small. It adds a practical stretch feature while protecting the stable scheduling workflow that the reviewer will evaluate.
