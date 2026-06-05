# Phase 10: README and Submission Polish

## Status

- Status: In progress
- Date: 2026-06-05
- GitHub: [catBoxTheory/shift-roster-builder](https://github.com/catBoxTheory/shift-roster-builder)

## Goal

Make the work easy to review and strong for the Problem Decomposition score. Simplify the CSV export and prepare the final README, screenshots, and submission.

## Scope

In scope:

- Simplify CSV export by removing the conflict notes column.
- Redesign the app shell with Optix Solution Limited branding.
- Final README updates with feature summary, data model, architecture, AI tools, and known limitations.
- Screenshot or short demo recording of the app running.
- Submission to Spencer's recruiter email.

Out of scope:

- New features or behavior changes.
- Drag-and-drop or availability changes.
- Backend or persistence.

## Changes Made

### CSV Export Simplification

Removed the "Conflict Notes" column from the CSV export. The exported CSV now has 6 columns: Employee, Role, Day, Start, End, Hours.

Reasoning: normal UI actions now prevent conflicts before they enter the roster (Phase 6), so the conflict notes column would always be empty in practice. Removing it keeps the export clean and avoids confusion.

Files changed:

- `src/utils/csvExport.js`: removed `HEADERS` conflict column, removed `buildConflictNotesByShift` and `conflictLabel` helpers, simplified `buildRosterCsv` signature (no longer takes `conflicts`).
- `src/utils/csvExport.test.js`: updated tests to match new 6-column format.
- `src/App.jsx`: removed `conflicts` argument from `buildRosterCsv` call.

### Optix-Branded Light Ops Redesign

Selected the Light Ops Dashboard direction after reviewing the Optix visual assets. The official circuit-board background is used as a subtle, softened page backdrop, while the roster workspace stays light and readable.

Files changed:

- `src/assets/optix-background.png`: official Optix circuit-board background moved into the Vite asset pipeline.
- `src/assets/optix-logo.png`: official Optix logo moved into the Vite asset pipeline.
- `src/App.jsx`: added the Optix logo in the top-left header, removed the long feature-status subtitle, and removed the "Phase 10 in progress" status card.
- `src/styles.css`: updated the page background, header lockup, panels, buttons, shift cards, focus states, and accents to use a light operational dashboard style with Optix red/orange highlights.
- `src/App.test.jsx`: added a header regression test for the logo, retained H1, and removed status copy.

Reasoning: the app should still feel like a practical scheduling tool, but the first impression now ties back to Optix Solution Limited through real brand assets instead of generic dashboard styling.

Follow-up layout refinement:

- Removed the top-right count pills from the Employees panel and Roster Grid panel.
- Reworked the desktop workspace so Employees stays on the left, Roster Grid sits at the top right, and the Review panel sits at the bottom right.
- Reworked the Review panel so Summary/facts sit on the left and Weekly hours sits on the right.
- Tuned card ratios so the left Employees card aligns with the bottom of the right-side Review card.
- Moved the Export CSV action into a bottom-centered row spanning the whole Review card.
- Fixed roster editor stacking so the sticky weekday header no longer appears above the add/edit shift dialog.
- Centered shift cards vertically inside each weekday cell for a cleaner roster-grid rhythm.
- Repositioned add-shift buttons above centered cards and widened weekday columns so full shift-card times remain visible.
- Softened the UI palette after design review: slate/navy is now used for primary actions, white is used for Review surfaces, and Optix red/orange is reserved for restrained brand accents.
- Increased visibility of the official circuit-board background while keeping light panel readability.
- Tightened shift-card spacing and text sizing so shift times remain readable in the right-side roster grid.

## AI Tools And Assistants Used

- Claude Code with mimo-v2.5-pro: implemented the CSV simplification and documentation.
- Codex with Product Design workflow: planned and implemented the Optix-branded Light Ops redesign using the provided official background and logo assets.

## Verification

Commands run:

```bash
npm test -- src/App.test.jsx
npm test -- src/components/RosterGrid.test.jsx
npm test -- src/components/SummaryPanel.test.jsx
npm test
npm run build
```

Results:

- Focused App header test passed.
- Focused RosterGrid test passed.
- Focused SummaryPanel layout test passed.
- Full test suite passed: 9 files, 68 tests.
- Production build passed.
- Browser QA passed on desktop and mobile: Optix logo is visible, official background is loaded, long feature-status subtitle is absent, "Phase 10 in progress" is absent, Employees/Roster Grid count pills are absent, Roster Grid is top right, Review is bottom right, Review uses left Summary and right Weekly hours columns on desktop, Export CSV is bottom-centered across the whole Review card, panels remain readable, mobile layout stacks without page-level horizontal overflow, overlap validation still appears in the shift editor, the shift editor appears above the sticky weekday header, shift cards are centered inside weekday cells with full times visible, and the export control is present and enabled.

## Known Limitations And Follow-Up

- Screenshot or demo recording still needed before submission.
- Final README polish still in progress.

## Reviewer Notes

This phase simplifies the CSV export to match the current conflict-prevention design. The export now focuses on scheduling data only.
