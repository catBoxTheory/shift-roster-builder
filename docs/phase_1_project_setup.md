# Phase 1: Project Setup

## Status

- Status: Complete
- Date: 2026-06-04
- Local commit: `a69c91f chore: scaffold phase 1 roster app`
- Status update commit: `7fe3fcc docs: update phase 1 status`
- GitHub: [catBoxTheory/shift-roster-builder](https://github.com/catBoxTheory/shift-roster-builder)

## Goal

Create a root-level React + Vite scaffold that satisfies the assessment requirement of running locally with no more than two terminal commands:

```bash
npm install
npm run dev
```

No roster business logic was added in this phase.

## Scope

In scope:

- Initialize a root-level Vite + React app.
- Add package scripts for development, build, preview, and tests.
- Add baseline styling and a placeholder app shell.
- Add a starter README with setup instructions and project status.
- Verify the scaffold runs and builds.
- Commit and push Phase 1 to GitHub.

Out of scope:

- Employee management.
- Shift creation or editing.
- Conflict detection.
- Summary calculations.
- CSV export.
- Production UI polish.

## Thought Process

The assessment brief says the app must run locally with no more than two commands. Because of that, the app was created at the repository root instead of inside a nested `code/` directory. This avoids asking the reviewer to `cd` into a subfolder before running the project.

The first phase intentionally focused on a boring but reliable foundation: scripts, dependencies, Vite config, React entrypoint, CSS reset, README, and GitHub publishing. This keeps later feature work clean and makes the project easy to review from the beginning.

## Design Decisions

- Root-level app structure: chosen to match the two-command setup requirement.
- React + Vite: chosen because the task brief recommends it for complex state and because it keeps local development fast.
- No roster logic yet: keeps Phase 1 scoped to setup only and avoids untested behavior.
- Minimal dependencies: React, React DOM, Vite, Vitest, jsdom, and the Vite React plugin.
- `crypto.randomUUID()` planned for later IDs instead of adding a UUID package.
- Placeholder app shell: shows the project is wired correctly while making clear that behavior begins in later phases.

## AI Tools And Assistants Used

- Codex / ChatGPT: reviewed the assessment brief, revised the implementation plan, created the scaffold, and verified the setup.
- Codex skills referenced:
  - `using-superpowers` for skill-aware workflow.
  - `karpathy-guidelines` for simple, scoped implementation decisions.
  - `build-web-apps:frontend-app-builder` for React + Vite frontend structure.
  - `document-generate` for the documentation approach.
- Human review: the plan was reviewed and approved before Phase 1 implementation started.

## Verification

Commands run:

```bash
npm install
npm run build
npm test
npm audit
```

Results:

- `npm run build` passed.
- `npm test` passed with no test files yet, using `--passWithNoTests`.
- `npm audit` found 0 vulnerabilities after updating the Vite/Vitest dev toolchain.
- Vite dev server responded with HTTP 200 at `http://127.0.0.1:5173/`.
- GitHub push succeeded to `main`.

## Known Limitations And Follow-Up

- No app behavior exists yet beyond the placeholder shell.
- No screenshots are included yet because the UI is not final.
- Tests begin in Phase 2 with time parsing, conflict detection, and summary calculations.
- The final README still needs richer design decisions, AI usage notes, screenshot/demo media, and known limitations after the app is functional.

## Reviewer Notes

This phase proves the project is easy to install, run, build, test, and publish. It deliberately avoids product behavior so the next phase can begin with test-driven domain logic.
