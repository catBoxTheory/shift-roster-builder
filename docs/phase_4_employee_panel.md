# Phase 4: Employee Panel

## Status

- Status: Complete
- Date: 2026-06-05
- Employee panel commit: `29d88c6 feat: add employee management panel`
- GitHub: [catBoxTheory/shift-roster-builder](https://github.com/catBoxTheory/shift-roster-builder)

## Goal

Build the first real user-facing workflow: employee management. Managers can now view employees, add a new employee with roles, edit employee name/roles, and remove employees with confirmation.

## Scope

In scope:

- Build `EmployeePanel`.
- Wire `EmployeePanel` into `App` through `useRoster`.
- Render employees and role tags.
- Add employee form with role checkboxes.
- Inline employee editing.
- Remove employee confirmation.
- Show roster validation messages from `lastErrors`.
- Add component tests before implementation.
- Replace the scaffold hero with a compact app workspace.

Out of scope:

- Shift creation.
- Weekly roster grid behavior.
- Conflict display details.
- Full summary panel.
- CSV export.
- Screenshot capture.

## Thought Process

This phase focuses on the first core requirement from the assessment brief: add, edit, and remove employees, where each employee has one or more roles. The existing reducer already owned the business rules, so the component only needed to collect user input and call the hook actions.

The app shell was changed from a Phase 1 placeholder into a practical workspace. The employee panel is active on the left, while roster grid and summary areas remain explicit placeholders for later phases. This keeps the first screen aligned with the final product without pretending unfinished features are complete.

## Design Decisions

- Role selection uses checkboxes because roles are binary selections.
- Employee rows show role tags for fast scanning.
- Editing is inline to keep the workflow lightweight.
- Remove uses a second confirmation click instead of deleting immediately.
- Validation messages are rendered from `lastErrors`, keeping validation centralized in `useRoster`.
- Tests are colocated with the component instead of using a separate `src/test` folder.
- The layout remains restrained and work-focused, matching a scheduling tool rather than a marketing page.

## AI Tools And Assistants Used

- Codex / ChatGPT: implemented and reviewed the EmployeePanel component, app shell update, tests, and documentation.
- `frontend-design`: guided the practical, manager-focused UI direction.
- `test-driven-development`: guided the component test-first flow.
- `karpathy-guidelines`: kept the feature scoped to employee management only.
- External model and Chrome DevTools check, user-reported: the user reviewed the employee panel and used another model with Chrome DevTools to check the functions. The reported result was that all Phase 4 functions passed. Raw external output is not stored in this repository, so this is supporting review evidence rather than the primary verification source.

## Verification

Commands run:

```bash
npm test -- src/components/EmployeePanel.test.jsx
npm test
npm run build
```

Results:

- Initial focused component test run failed as expected because `EmployeePanel.jsx` did not exist yet.
- Focused EmployeePanel test run passed: 1 file, 5 tests.
- Full test run passed: 5 files, 26 tests.
- Production build passed.
- Additional user-reported validation: manual review plus another model using Chrome DevTools found all Phase 4 functions passed.

Covered scenarios:

- Employees render with roles.
- Add employee submits name and selected roles.
- Edit employee submits updated name and roles.
- Remove employee requires confirmation.
- Validation messages from roster state are shown.

## Known Limitations And Follow-Up

- Roster grid assignment is still a placeholder until Phase 5.
- Summary panel is still a placeholder until Phase 6.
- Employee form does not yet use browser screenshots in documentation because the final UI is still evolving.
- Valid submissions do not yet show toast/success feedback.

## Reviewer Notes

This phase completes the employee-management requirement and wires the first real UI workflow to the reducer-backed state layer.
