# Shift Roster Builder

A weekly staff scheduling web app for the Optix Solutions Stage 2 take-home assignment.

## Setup

```bash
npm install
npm run dev
```

The Vite dev server will print the local URL after startup.

## Current Status

Phase 2 is complete: the project has a root-level React + Vite scaffold plus tested utility logic for time parsing, shift hours, conflict detection, and weekly totals.

Planned next phases:

1. Add roster state and validation.
2. Build employee management, weekly grid assignment, conflict UI, and summary panel.
3. Add CSV export or mobile polish if the core app is stable.
4. Add README screenshots or a short demo recording before submission.

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
