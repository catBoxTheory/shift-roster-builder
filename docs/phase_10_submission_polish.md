# Phase 10: README and Submission Polish

## Status

- Status: Complete
- Date: 2026-06-06
- Commit: `3f9fdad` (`polish Optix roster UI/UX design`) plus final README/demo documentation push
- GitHub: [catBoxTheory/shift-roster-builder](https://github.com/catBoxTheory/shift-roster-builder)

## Goal

Make the work easy to review and strong for the Problem Decomposition score. Simplify the CSV export, document the UI/UX redesign decisions, and prepare the final README, screenshot, demo video link, and submission assets.

## Scope

In scope:

- Simplify CSV export by removing the conflict notes column.
- Redesign the app shell with Optix Solution Limited branding.
- Document the UI/UX design direction, dashboard layout, and interaction polish.
- Final README updates with feature summary, data model, architecture, AI tools, verification, screenshot, demo video link, and known limitations.
- Screenshot and short demo recording of the app running.
- Submission to Spencer's recruiter email.
- Scope a cross-panel validation-error leak so employee-form errors no longer appear in the shift editor.
- Behavior-preserving code-quality cleanup that removes duplicated helpers without changing the UI.

Out of scope:

- New roster features.
- Drag-and-drop or availability logic changes.
- Backend or persistence.
- Authentication, deployment, or database work.

## Thought Process

Phase 10 started as final submission polish, but the UI review showed that the app still looked too generic for an Optix Solution Limited assessment. The redesign therefore focused on making the product feel more aligned with Optix while preserving the practical roster-building workflow.

The chosen direction was a Light Ops Dashboard. A darker, more promotional visual direction was considered, but it would reduce readability for a scheduling tool with dense table data. The official circuit-board background is still used for brand recognition, but it is softened behind light panels so employees, shifts, hours, and actions remain easy to scan.

The layout follows the manager's workflow. Employee setup stays on the left because that is the main data-entry area. The roster grid sits at the top right because it is the primary scheduling canvas and needs the widest horizontal space for seven weekday columns. The review panel sits at the bottom right so totals, weekly hours, and export are close to the roster without interrupting shift assignment.

The CSV export was also simplified during this phase. Earlier versions could export conflict notes, but the current UI prevents normal users from adding overlapping or invalid shifts. Keeping a conflict notes column would usually produce empty data and make the export look more complicated than the current product behavior.

After the UI polish, the final documentation was updated to support review directly from GitHub. The README now includes a clickable YouTube thumbnail preview, a separate dashboard screenshot, and concise sections for setup, features, data model, validation rules, UI/UX decisions, AI tool usage, verification, and limitations.

A final self-review pass then caught one defect and a set of code-quality issues. The defect: opening the shift editor while an employee add/edit had failed would surface the employee-form errors (for example "Employee name is required." or "Select at least one role.") inside the shift edit card. The shift editor was being handed the shared global `lastErrors` from roster state, even though the grid already validates shifts locally before dispatching. The fix scopes the shift editor to its own local validation errors only, so each panel reports its own problems. Conflict prevention is unchanged, so the roster and CSV export stay correct.

The same pass removed duplicated logic that had accumulated across phases: the weekday label array and `dayLabel`, the `ErrorList` component, the `shiftConflictMessage` mapping, and the hour-rounding helper each existed in two or more files. These were consolidated into single shared modules so there is one source of truth per concern, with byte-identical output to the previous inline copies.

## Design Decisions

- Decision: Use the official Optix background and logo through the Vite asset pipeline.
  Reason: Importing the images from `src/assets` keeps production builds reliable and makes the brand assets part of the app bundle.
  Tradeoff: The background asset increases bundle size, but it gives the assessment a stronger Optix-specific visual identity.

- Decision: Use a light dashboard design instead of a dark full-screen branded design.
  Reason: Roster management is an operational workflow, so readability and repeat use matter more than dramatic presentation.
  Tradeoff: The branding is more subtle, but the scheduler remains easier to use.

- Decision: Keep a two-column desktop layout with Employees on the left and Roster/Review on the right.
  Reason: This keeps employee management, shift assignment, and review visible in one workspace.
  Tradeoff: The roster grid may require horizontal scrolling on narrower screens, but the main desktop view supports quick scanning.

- Decision: Place the Roster Grid at the top right.
  Reason: The grid is the primary scheduling canvas and benefits from the widest available horizontal space for weekday columns.
  Tradeoff: The employee panel becomes narrower, but employee editing is less horizontally demanding than the roster table.

- Decision: Place the Review panel at the bottom right.
  Reason: Summary totals, weekly hours, and CSV export are review actions that should sit near the roster after shifts are assigned.
  Tradeoff: Review information is secondary on first load, but it remains visible without opening a separate page.

- Decision: Structure the Review panel with Summary on the left, Weekly hours on the right, and Export CSV centered at the bottom.
  Reason: This separates high-level facts from per-employee comparison and makes export feel like the final review action.
  Tradeoff: The export button is slightly lower on the page, but it is visually centered across the whole review area.

- Decision: Remove low-value UI noise such as count pills, the long feature subtitle, the phase status label, and conflict detail text.
  Reason: These elements repeated information or described internal progress rather than helping users schedule shifts.
  Tradeoff: The interface is less explanatory, but it is cleaner and more focused.

- Decision: Center shift cards inside weekday cells and keep add-shift buttons above the cards.
  Reason: Centering creates a calmer roster rhythm, while moving the add button prevents it from covering shift information.
  Tradeoff: Cells are slightly taller and weekday columns are wider, but full shift times remain visible.

- Decision: Keep Optix red/orange as an accent and use slate/navy for primary functional controls.
  Reason: Restrained brand color helps the UI feel professional without turning every action into a high-alert control.
  Tradeoff: The app is less visually loud, but the core actions are easier to distinguish.

- Decision: Preserve accessibility basics during visual redesign.
  Reason: The logo has meaningful alt text, the H1 remains the page title, and existing form labels/button names continue to describe roster actions.
  Tradeoff: Some purely decorative styling stays CSS-based, but semantic UI content remains available to assistive technology.

- Decision: Present the demo video in the README as a clickable YouTube thumbnail preview.
  Reason: GitHub Markdown does not render playable YouTube iframes in repository READMEs, while a linked thumbnail is stable, recognizable, and reviewer-friendly.
  Tradeoff: The video does not play inline inside GitHub, but the demo is one click away and the app screenshot still shows the final UI.

- Decision: Scope the shift editor to its own local validation errors instead of the shared global `lastErrors`.
  Reason: Employee-form errors were leaking into the shift edit card; the grid already validates shifts before dispatching, so the global merge was both unnecessary and the source of the leak.
  Tradeoff: The shift editor no longer mirrors reducer-side errors, but those paths are blocked locally before dispatch, so no message is lost.

- Decision: Consolidate duplicated helpers into shared modules (`utils/days.js`, `components/ErrorList.jsx`, `shiftConflictMessage` in `utils/conflicts.js`, `roundHours` in `utils/time.js`).
  Reason: One source of truth per concern is easier to read, test, and review, which supports the Code Quality and Structure criterion.
  Tradeoff: A few more small modules and imports, but each removes copy-paste drift risk with identical output.

## AI Tools And Assistants Used

- Tool: Claude Code /mimo-v2.5-pro
  Used for: CSV simplification and supporting documentation.
  Human review: User and another AI model tested the roster behavior before this phase moved forward.

- Tool: Codex with Product Design workflow
  Used for: Optix-branded Light Ops redesign, layout refinements, UI/UX documentation, tests, and browser QA.
  Human review: User reviewed screenshots and requested layout, color, export placement, editor overlay, and shift-card visibility refinements.

- Tool: Codex with HyperFrames project workflow, local Whisper, and FFmpeg
  Used for: Demo video subtitle preparation, caption styling, final MP4 rendering, screenshot extraction, and README demo asset preparation.
  Human review: User reviewed the subtitle styling and requested removal of the red caption bar before finalizing.

- Tool: Cursor agent (Claude Opus)
  Used for: Final self-review that identified the error-scope leak, the behavior-preserving deduplication refactor, and this phase log update.
  Human review: User reported the shift-editor error bug and requested code-quality cleanup that does not change the website; changes were verified against the full test suite and a production build before acceptance.

## Verification

Commands run:

```bash
npm test -- src/App.test.jsx
npm test -- src/components/RosterGrid.test.jsx
npm test -- src/components/SummaryPanel.test.jsx
npm test
npm run build
```

Command results:

- Focused App header test passed.
- Focused RosterGrid test passed.
- Focused SummaryPanel layout test passed.
- Full test suite passed: 9 files, 68 tests.
- Production build passed.
- README screenshot was captured from the running Vite app with Playwright at a wide desktop viewport.
- Final subtitled demo MP4 was verified with `ffprobe` before the YouTube upload was linked.

Manual checks:

- Optix logo is visible in the top-left header area.
- Official circuit-board background is loaded and softened behind readable dashboard panels.
- Long feature-status subtitle and "Phase 10 in progress" status are absent.
- Employees panel stays on the left, Roster Grid sits at the top right, and Review sits at the bottom right on desktop.
- Review uses Summary on the left, Weekly hours on the right, and Export CSV centered along the bottom.
- Mobile layout stacks in workflow order without page-level horizontal overflow.
- Shift editor appears above the sticky weekday header.
- Shift cards are centered inside weekday cells and full shift times remain visible.
- Overlap validation still appears in the shift editor.
- Employee-form errors (name required, role required) now appear only in the employee panel, not in the shift editor.
- Export CSV remains present and enabled.
- README includes the GitHub-friendly YouTube thumbnail preview and direct demo link: [YouTube walkthrough](https://youtu.be/a7XEsMy2kfI).
- README includes the final dashboard screenshot at `screenshots/shift-roster-builder-dashboard.png`.

## Known Limitations And Follow-Up

- Final email submission still needs to be sent by the applicant.
- The app is still client-only; data does not persist after refresh.
- Availability remains day-level only; per-time-slot availability is not supported.
- Touch-device drag-and-drop support is not included.

## Reviewer Notes

This phase prepares the assessment for review by combining final documentation work with UI/UX polish. The app keeps the same roster logic, validation behavior, drag-and-drop reassignment, availability checks, weekly hours summary, and CSV export while making the product feel more aligned with Optix Solution Limited.

The final layout is intentionally operational rather than promotional: Employees on the left, Roster Grid top right, Review bottom right, and Export CSV as the final centered action inside the Review card. This supports the expected scheduling workflow without adding new product scope.

The root README now acts as the main reviewer handoff: it shows a YouTube demo preview, shows the app screenshot, explains how to run the app, and summarizes design decisions, validation rules, AI usage, and remaining limitations.
