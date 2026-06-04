# Plan: Optix Stage 2 - Shift Roster Builder

## Context

Passed Stage 1 interview with Spencer Fung, CEO of Optix Solutions. Stage 2 is a take-home vibe coding assignment to build a **Shift Roster Builder**: a weekly staff scheduling web app for a small team.

- Deadline: Sunday, 7 June 2026, 9:00 AM HKT
- Submission: reply to Spencer's recruiter email with a public GitHub repository link, or ZIP fallback if needed
- Assessment weights: Code Quality and Structure 30%, UI/UX Design 30%, Problem Decomposition 25%, Functionality and Correctness 15%
- AI tools are expected and encouraged, but the README should document how they were used and how outputs were reviewed

The most important strategy is to ship a clean, working core with clear reasoning. Stretch goals are only attempted after the required workflow is solid.

---

## Current Status

- Phase 1 project setup is complete.
- Local commit: `a69c91f chore: scaffold phase 1 roster app`
- GitHub repository: [catBoxTheory/shift-roster-builder](https://github.com/catBoxTheory/shift-roster-builder)
- Remote branch: `main` tracking `origin/main`
- Verified checks: `npm run build`, `npm test`, `npm audit`, and Vite dev server HTTP 200
- Next phase: Phase 2, Data Model, Tests, and Core Logic

Phase 2 has not started yet.

---

## Codex Skills and Workflow Guardrails

Use these Codex skills during implementation:

- `using-superpowers`: start each implementation session by checking relevant skills before acting.
- `karpathy-guidelines`: keep the solution simple, avoid speculative abstractions, state assumptions, and verify each change.
- `test-driven-development`: use for business logic and behavior changes, especially time calculation, validation, conflict detection, and summary totals.
- `build-web-apps:frontend-app-builder` / React guidance: use React + Vite structure and browser verification.
- `frontend-design`: use for the roster UI design system and interaction polish.
- Browser or Playwright: verify the app locally after UI work.

Codex equivalents for Claude-style mechanics:

- Use `update_plan` for execution tracking when implementing.
- Use native shell tools for commands.
- Use `apply_patch` or native file editing tools for edits.
- Do not rely on Claude-only tool names in the implementation plan.

---

## Project Structure

Create the React + Vite app at the repository root, not inside a `code/` folder. The task brief requires the app to run locally with no more than two terminal commands, so the reviewer should be able to run:

```bash
npm install
npm run dev
```

Planned structure:

```text
Shift Roster Builder/
├── src/
│   ├── components/
│   │   ├── EmployeePanel.jsx       # Add, edit, remove employees and roles
│   │   ├── RosterGrid.jsx          # Weekly grid: days as columns, employees as rows
│   │   ├── ShiftEditor.jsx         # Create/edit shift form or modal
│   │   ├── SummaryPanel.jsx        # Weekly totals, conflicts, export action
│   │   └── ConflictBadge.jsx       # Visual conflict indicator
│   ├── hooks/
│   │   └── useRoster.js            # Roster reducer/actions and derived state
│   ├── utils/
│   │   ├── time.js                 # HH:MM parsing and hour calculations
│   │   ├── conflicts.js            # Overlap and consecutive-day detection
│   │   └── csvExport.js            # Optional CSV export
│   ├── test/
│   │   ├── time.test.js
│   │   └── conflicts.test.js
│   ├── App.jsx
│   ├── main.jsx
│   └── styles.css
├── screenshots/
│   └── roster_builder.png          # Add after UI is ready
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

Avoid multiple documentation files unless there is extra time. A strong root `README.md` is more valuable for this assessment than scattered notes.

---

## Technical Decisions

### Stack: React + Vite

React + Vite matches the brief recommendation for complex state while staying small and easy to run locally. There is no backend, database, auth, routing, or deployment requirement.

### State Management

Use a custom `useRoster` hook backed by `useReducer`.

Reasoning:

- The domain state is small: employees, shifts, and UI selection.
- A reducer makes actions explicit and easy to review.
- Redux/Zustand would be unnecessary overhead.
- All scheduling logic remains hand-written, satisfying the "no third-party scheduling or roster SaaS libraries" rule.

### Dependencies

Use the minimum needed:

- Runtime: `react`, `react-dom`
- Tooling: `vite`, `@vitejs/plugin-react`
- Tests: `vitest`, `jsdom`

Do not install `uuid`; use `crypto.randomUUID()` for IDs. Do not install scheduling, calendar, or roster libraries.

### Data Model

```ts
Employee = {
  id: string,
  name: string,
  roles: string[]
}

Shift = {
  id: string,
  employeeId: string,
  role: string,
  day: 0 | 1 | 2 | 3 | 4 | 5 | 6,
  startTime: "HH:MM",
  endTime: "HH:MM"
}
```

Design reasoning:

- Shifts reference employees by ID so employee edits do not duplicate data.
- A shift stores its assigned `role`, because employees may have multiple roles and each shift needs a clear duty.
- Times are same-day `HH:MM` strings, converted to minutes only inside utility functions.
- Overnight shifts are out of scope for v1; validate `endTime > startTime`.
- Use sample starter data so reviewers can see the workflow immediately.

### Conflict Detection

Implement exactly the conflict types required by the brief:

1. **Same-day overlap:** the same employee has two shifts on the same day whose half-open time ranges overlap.
2. **More than 5 consecutive days:** the same employee is scheduled on 6 or 7 consecutive days in the week.

Important details:

- Use half-open intervals: `[startTime, endTime)`.
- `09:00-12:00` and `12:00-17:00` are adjacent, not overlapping.
- Exactly 5 consecutive scheduled days is allowed.
- Conflict detection should return enough metadata for UI messages, not only booleans.

---

## UI/UX Direction

The app should feel like a practical manager tool: clear, calm, and fast to scan.

Planned layout:

- Left panel: employee list, role tags, add/edit/remove controls
- Center: weekly roster grid, days as columns and employees as rows
- Right panel: weekly summary, total hours per employee, conflict count, CSV export

Interaction model:

- Click an employee/day cell to create a shift.
- Click an existing shift card to edit or remove it.
- Shift editor includes employee, role, day, start time, and end time.
- Conflicting shifts show a visible badge and an explanation.
- Inline validation explains invalid employee names, empty role selections, invalid shift times, and invalid shift roles.

Visual standards:

- Avoid a marketing landing page; the roster builder is the first screen.
- Use restrained professional colors with semantic red/amber/green states.
- Do not rely only on color for conflicts; include icons/text/badges.
- Keep responsive behavior practical: stack panels on mobile and allow horizontal scrolling for the grid if needed.

Before heavy UI implementation, use the frontend design skill to lock a compact design system: colors, spacing, typography, panels, shift cards, form controls, badges, and responsive behavior.

---

## Implementation Plan

### Phase 1: Project Setup - Complete

Goal: create a runnable root-level React + Vite app with no roster features yet.

Completed steps:

1. Initialize `package.json`, Vite config, React entrypoint, root `index.html`, and base CSS.
2. Add scripts: `dev`, `build`, `preview`, and `test`.
3. Add minimal dependencies: React, Vite, React plugin, Vitest, jsdom.
4. Create placeholder app shell with the product name and three empty workspace regions.
5. Add a short `README.md` with setup commands, project purpose, current status, and planned features.
6. Verify `npm install`, `npm run dev`, `npm run build`, and `npm test`.

Phase 1 was committed and pushed to GitHub. Stop here until Phase 2 is approved before adding roster behavior.

### Phase 2: Data Model, Tests, and Core Logic

Goal: implement the business logic with tests before UI complexity.

Steps:

1. Add tests for `parseTimeToMinutes`, `calculateShiftHours`, and invalid time strings.
2. Implement `src/utils/time.js`.
3. Add tests for overlap detection:
   - same employee, same day, overlapping times conflict
   - adjacent shifts do not conflict
   - different employee does not conflict
   - different day does not conflict
4. Add tests for consecutive days:
   - exactly 5 days is allowed
   - 6 consecutive days is a conflict
   - non-consecutive 6 days is not a consecutive-day conflict
5. Implement `src/utils/conflicts.js`.
6. Add summary total tests and implement weekly hour calculations.

### Phase 3: Roster State and Validation

Goal: make all required actions explicit and predictable.

Steps:

1. Implement `useRoster` with reducer actions:
   - add, edit, remove employee
   - add, edit, remove shift
   - reset sample data
2. Validate employee name required, unique employee names, and at least one role.
3. Validate shift employee exists, role belongs to employee, day is valid, and `endTime > startTime`.
4. Recalculate derived data from state: conflicts and weekly totals.
5. Preserve small, readable action names and avoid generic abstraction.

### Phase 4: Employee Panel

Goal: satisfy employee management requirement.

Steps:

1. Build list of employees with name and role tags.
2. Add an employee form with predefined role options: Cashier, Supervisor, Cook, Barista, Cleaner.
3. Support inline edit for name and roles.
4. Support remove with a lightweight confirmation.
5. When removing an employee, remove or clearly handle that employee's shifts.

### Phase 5: Weekly Roster Grid and Shift Editor

Goal: satisfy assignment and grid display requirements.

Steps:

1. Build a grid with days as columns and employees as rows.
2. Show shift cards inside employee/day cells.
3. Add shift creation from an empty cell.
4. Add shift editing/removal from an existing shift card.
5. Use the shift's assigned role as a visible badge.
6. Keep the grid usable with multiple shifts in the same cell.

### Phase 6: Conflict UI and Summary Panel

Goal: make correctness visible to the reviewer.

Steps:

1. Highlight overlapping shifts and consecutive-day conflicts.
2. Add `ConflictBadge` with a readable explanation.
3. Show total weekly hours per employee.
4. Show conflict counts in the summary panel.
5. Sort summary rows by total hours descending, with conflicts easy to spot.

### Phase 7: Stretch Goals

Attempt only after the core is stable and verified.

Priority:

1. CSV export of the weekly roster.
2. Mobile-responsive polish.
3. Availability preferences.
4. Drag-and-drop only if time remains.

CSV export is the preferred stretch because it is useful, small, and easy to verify. Drag-and-drop is lowest priority because it can consume time without improving the required scoring areas as much.

### Phase 8: README and Submission Polish

Goal: make the work easy to review and strong for the Problem Decomposition score.

README should include:

- Two-command setup instructions.
- Feature summary.
- Screenshot or short recording of the app running.
- Data model explanation.
- Architecture and state-management decisions.
- Conflict-detection explanation.
- AI tools used, including Codex/ChatGPT and any other assistants.
- How AI output was reviewed and modified.
- Known limitations, including no backend and no overnight shifts.

Submission steps:

1. Run final checks: `npm run build`, `npm test`, and browser QA.
2. Take screenshot or record a 60-90 second demo.
3. Push to a public GitHub repository.
4. Reply to Spencer's email with the repository link and demo/screenshot note.

---

## Assessment Alignment

| Assessment Area | Weight | Plan Alignment |
| --- | ---: | --- |
| Code Quality and Structure | 30% | Small components, reducer-based state, utility tests, minimal dependencies, clear names |
| UI/UX Design | 30% | Manager-focused app screen, clear grid, visible conflicts, summary panel, responsive behavior |
| Problem Decomposition | 25% | README explains data model, architecture, tradeoffs, AI usage, and limitations |
| Functionality and Correctness | 15% | All five core requirements implemented and verified with tests/browser QA |

---

## Timeline

| Phase | Estimate | Cumulative |
| --- | ---: | ---: |
| Phase 1: Project setup | Complete | 0:30 |
| Phase 2: Core logic/tests | 1 hr | 1:30 |
| Phase 3: State/validation | 1 hr | 2:30 |
| Phase 4: Employee panel | 1 hr | 3:30 |
| Phase 5: Roster grid/editor | 2 hr | 5:30 |
| Phase 6: Conflicts/summary | 1 hr | 6:30 |
| Phase 7: Stretch goals | 1 hr | 7:30 |
| Phase 8: README/submission polish | 1 hr | 8:30 |

Total target: about 8.5 hours.

---

## Verification Checklist

Functional checks:

1. Add, edit, and remove employees.
2. Assign employees to day/time shifts.
3. Display all assignments in the weekly grid.
4. Flag overlapping same-day shifts.
5. Flag more than 5 consecutive scheduled days.
6. Show correct weekly total hours per employee.
7. Export CSV if the stretch goal is implemented.

Command checks:

```bash
npm install
npm run dev
npm run build
npm test
```

Browser checks:

1. Desktop layout is readable and no text overlaps.
2. Mobile layout is usable.
3. Shift editor works from empty cells and existing shift cards.
4. Conflict indicators are visible and understandable.
5. README screenshot or demo accurately reflects the final app.

---

## Explicit Assumptions

- Data is stored in memory only.
- No backend, database, login, deployment, or persistence is required.
- Same-day shifts only; overnight shifts are intentionally out of scope.
- Public GitHub repository is preferred; ZIP is only a fallback.
- Phase 1 should be reviewed before implementation continues into roster behavior.
