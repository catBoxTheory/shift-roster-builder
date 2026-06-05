# Phase 8: Drag-and-Drop Shift Reassignment

## Status

- Status: Complete
- Date: 2026-06-05
- Bug fix commit: `fix: clear drag state on drop to prevent stuck transparency`
- GitHub: [catBoxTheory/shift-roster-builder](https://github.com/catBoxTheory/shift-roster-builder)

## Goal

Add drag-and-drop to reassign shifts between employees and days. Managers can now drag a shift card from one cell and drop it onto a different employee/day cell. The move is validated before committing: the target employee must have the shift's role, and the move must not create an overlap or exceed 5 consecutive days.

## Scope

In scope:

- Add `shift/move` action to the reducer with role, conflict, and existence validation.
- Make shift cards draggable using the native HTML5 Drag and Drop API.
- Make roster grid cells valid drop targets.
- Show visual feedback during drag (source card dimmed, target cell highlighted).
- Reject invalid drops with inline errors in the shift editor area.
- Add reducer tests for the move action.
- Add component tests for drag start, drop, and visual states.
- Browser verification on desktop.

Out of scope:

- Touch-device drag support.
- Drag-and-drop between the editor overlay and the grid.
- Availability preferences.
- CSV export changes.
- Final README screenshot capture.

## Thought Process

The existing reducer already owned shift validation and conflict detection. The new `shift/move` action reuses `validateNoProposedShiftConflict` to check the proposed roster after the move, the same pattern used by `shift/add` and `shift/edit`. This keeps conflict blocking consistent across all shift mutation paths.

The native HTML5 Drag and Drop API was chosen over a library to avoid adding dependencies. It works well for the desktop-first use case of this assessment. Shift cards are already `<button>` elements, so adding `draggable="true"` and the drag event handlers was straightforward.

The drop handler reads the shift ID from the data transfer, looks up the target employee and day from the cell, and delegates to `onMoveShift`. If the reducer rejects the move, the existing `lastErrors` mechanism surfaces the error in the shift editor overlay.

## Design Decisions

- `shift/move` is a dedicated reducer action rather than composing `shift/remove` + `shift/add`. This keeps the shift ID stable and avoids race conditions with conflict detection.
- Role validation happens before conflict validation because it is a cheaper check and produces a more specific error message.
- The drag source card gets an `is-dragging` class (reduced opacity) so the manager can see which card is being moved.
- The drop target cell gets an `is-drop-target` class (dashed outline + light blue background) so the manager can see where the card will land.
- The same cell as the source is still a valid drop target (no-op move) because rejecting it would require extra logic for no benefit.
- Drag events use `dataTransfer.setData/getData` with the shift ID as plain text.
- A `DragEvent` polyfill is added in tests because jsdom does not provide it.

## AI Tools And Assistants Used

- Claude Code with mimo-v2.5-pro: implemented the reducer action, drag-and-drop handlers, tests, styles, bug fix, and documentation.
- `test-driven-development`: guided the red-green flow for the reducer move action.
- `karpathy-guidelines`: kept the feature scoped to drag-and-drop only.
- `frontend-design`: guided the visual feedback treatment (dim source, highlight target).
- Human review: user tested the drag-and-drop interaction and reported a stuck transparency bug, which was fixed in a follow-up commit.

## Verification

Commands run:

```bash
npm test -- src/hooks/useRoster.test.js
npm test -- src/components/RosterGrid.test.jsx
npm test
npm run build
```

Results:

- Focused reducer test run passed: 1 file, 16 tests.
- Initial focused component test run failed because `DragEvent` was not defined in jsdom; added a polyfill.
- Focused RosterGrid test run passed: 1 file, 12 tests.
- Full test suite passed: 8 files, 56 tests.
- Production build passed.

Covered scenarios:

- Move a shift to a different employee and day.
- Reject move to an employee who lacks the shift's role.
- Reject move that would create an overlapping shift.
- Reject move that would exceed 5 consecutive days.
- Reject move to a nonexistent employee.
- Shift cards have `draggable="true"` attribute.
- Drop on a valid cell calls `onMoveShift` with correct arguments.
- Dragged card gets `is-dragging` visual class.

## Known Limitations And Follow-Up

- Touch devices do not support HTML5 Drag and Drop natively; this is acceptable for the desktop-focused assessment.
- The drop target highlight does not distinguish valid vs. invalid targets visually; the error appears after drop.
- No animation or transition on the card move.
- Final screenshot/demo capture still belongs in submission polish.
- Bug fix: after user testing, a stuck transparency issue was found. When a shift card was dragged and dropped onto a new cell, the card stayed semi-transparent because `dragState` was not cleared before React re-rendered. The fix clears `dragState` immediately in `handleDrop` after calling `onMoveShift`, so the new card in the target cell does not match any drag state.

## Reviewer Notes

This phase adds the first stretch goal from the assessment brief. The drag-and-drop implementation reuses the existing conflict-blocking infrastructure so the user experience is consistent: invalid moves are rejected with the same error messages as invalid form submissions.
