# Shift Roster Builder

A weekly staff scheduling web app for the Optix Solutions Stage 2 take-home assignment.

## Setup

```bash
npm install
npm run dev
```

The Vite dev server will print the local URL after startup.

## Current Status

Phase 9 is complete: the project has a root-level React + Vite scaffold, tested scheduling utilities, reducer-backed roster state, employee management with availability preferences, a weekly roster grid with shift add/edit/remove workflows, drag-and-drop shift reassignment, conflict prevention, conflict badges for invalid derived states, a detailed summary panel, and CSV export.

Planned next phases:

1. Add README screenshots or a short demo recording before submission.
2. Final README and submission polish.
3. Reply to the assessment email with the public GitHub repository link.

## Development Documentation

Stage-by-stage documentation lives in [docs/](./docs/). Each phase records thought process, design decisions, AI tools used, verification, and follow-up work so the final submission has a clear development trail.

## Scripts

```bash
npm run dev
npm run build
npm run preview
npm test
```

## Design Notes

The implementation will keep all data in memory and use hand-written scheduling logic. No backend, database, auth, or third-party scheduling libraries are planned for this assessment.

AI assistance is being used for planning, implementation, and review. The final README will document which tools were used and how generated output was checked.
