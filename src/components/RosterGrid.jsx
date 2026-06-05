import { useMemo, useState } from "react";
import { validateShiftInput } from "../hooks/useRoster.js";
import { detectRosterConflicts } from "../utils/conflicts.js";
import ConflictBadge from "./ConflictBadge.jsx";
import ShiftEditor from "./ShiftEditor.jsx";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const EMPTY_CONFLICTS = [];
const EMPTY_CONFLICTING_SHIFT_IDS = new Set();

export default function RosterGrid({
  employees,
  shifts,
  conflicts = EMPTY_CONFLICTS,
  conflictingShiftIds = EMPTY_CONFLICTING_SHIFT_IDS,
  lastErrors = {},
  onAddShift,
  onEditShift,
  onRemoveShift,
  onMoveShift
}) {
  const [editorContext, setEditorContext] = useState(null);
  const [editorErrors, setEditorErrors] = useState({});
  const [dragState, setDragState] = useState(null);
  const [dropTarget, setDropTarget] = useState(null);
  const shiftsByEmployeeDay = useMemo(() => groupShifts(shifts), [shifts]);
  const conflictCountsByShift = useMemo(
    () => countConflictsByShift(conflicts),
    [conflicts]
  );
  const editorEmployee = editorContext
    ? employees.find((employee) => employee.id === editorContext.employeeId)
    : null;

  function closeEditor() {
    setEditorContext(null);
    setEditorErrors({});
  }

  function openAddEditor(employeeId, day) {
    setEditorErrors({});
    setEditorContext({
      employeeId,
      day,
      shift: null
    });
  }

  function openEditEditor(employeeId, day, shift) {
    setEditorErrors({});
    setEditorContext({
      employeeId,
      day,
      shift
    });
  }

  function submitShift(payload) {
    const validation = validateShiftInput(payload, { employees });

    if (!validation.isValid) {
      setEditorErrors(validation.errors);
      return;
    }

    const nextShift = {
      id: editorContext?.shift?.id ?? "__pending-shift__",
      ...validation.value
    };
    const nextShifts = editorContext?.shift
      ? shifts.map((shift) => (shift.id === nextShift.id ? nextShift : shift))
      : [...shifts, nextShift];
    const conflict = detectRosterConflicts(nextShifts).find((item) =>
      item.shiftIds.includes(nextShift.id)
    );

    if (conflict) {
      setEditorErrors({ conflict: shiftConflictMessage(conflict.type) });
      return;
    }

    if (editorContext?.shift) {
      onEditShift(payload);
    } else {
      onAddShift(payload);
    }
    closeEditor();
  }

  function removeShift(shiftId) {
    onRemoveShift(shiftId);
    closeEditor();
  }

  function handleDragStart(event, shift) {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", shift.id);
    setDragState({ shiftId: shift.id, employeeId: shift.employeeId, day: shift.day });
  }

  function handleDragEnd() {
    setDragState(null);
    setDropTarget(null);
  }

  function handleDragOver(event) {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }

  function handleDragEnter(event, employeeId, dayIndex) {
    event.preventDefault();
    setDropTarget({ employeeId, day: dayIndex });
  }

  function handleDragLeave(event, employeeId, dayIndex) {
    if (dropTarget?.employeeId === employeeId && dropTarget?.day === dayIndex) {
      setDropTarget(null);
    }
  }

  function handleDrop(event, targetEmployeeId, targetDay) {
    event.preventDefault();
    setDropTarget(null);

    const shiftId = event.dataTransfer.getData("text/plain");
    if (!shiftId || !onMoveShift) return;

    onMoveShift(shiftId, targetEmployeeId, targetDay);
    setDragState(null);
  }

  return (
    <section className="panel roster-grid-panel" aria-labelledby="grid-title">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Week</p>
          <h2 id="grid-title">Roster Grid</h2>
        </div>
      </div>

      <div className="roster-table" role="table" aria-label="Weekly roster">
        <div className="roster-header" role="row">
          <div className="employee-column-heading" role="columnheader">
            Employee
          </div>
          {DAYS.map((day) => (
            <div className="day-heading" role="columnheader" key={day}>
              {day}
            </div>
          ))}
        </div>

        {employees.map((employee) => (
          <div className="roster-row" role="row" key={employee.id}>
            <div className="employee-cell" role="rowheader">
              <strong>{employee.name}</strong>
              <span>{employee.roles.join(", ")}</span>
            </div>
            {DAYS.map((day, dayIndex) => {
              const cellShifts =
                shiftsByEmployeeDay.get(cellKey(employee.id, dayIndex)) ?? [];
              const isDropTarget =
                dropTarget?.employeeId === employee.id &&
                dropTarget?.day === dayIndex;
              const isDropSource =
                dragState?.employeeId === employee.id &&
                dragState?.day === dayIndex;
              const isUnavailable = (employee.unavailableDays ?? []).includes(dayIndex);

              return (
                <div
                  className={[
                    "shift-cell",
                    isDropTarget && !isDropSource ? "is-drop-target" : "",
                    isUnavailable ? "is-unavailable" : ""
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  role="cell"
                  key={day}
                  onDragOver={handleDragOver}
                  onDragEnter={(event) => handleDragEnter(event, employee.id, dayIndex)}
                  onDragLeave={(event) => handleDragLeave(event, employee.id, dayIndex)}
                  onDrop={(event) => handleDrop(event, employee.id, dayIndex)}
                >
                  <button
                    className="add-shift-button"
                    type="button"
                    aria-label={`Add shift for ${employee.name} on ${day}`}
                    onClick={() => openAddEditor(employee.id, dayIndex)}
                  >
                    +
                  </button>

                  <div className="shift-card-list">
                    {cellShifts.map((shift) => {
                      const conflictCount =
                        conflictCountsByShift.get(shift.id) ??
                        (conflictingShiftIds.has(shift.id) ? 1 : 0);

                      return (
                        <button
                          className={[
                            "shift-card",
                            conflictCount > 0 ? "is-conflicting" : "",
                            dragState?.shiftId === shift.id ? "is-dragging" : ""
                          ]
                            .filter(Boolean)
                            .join(" ")}
                          type="button"
                          key={shift.id}
                          draggable="true"
                          aria-label={`Edit ${shift.role} shift for ${employee.name} on ${day}`}
                          onClick={() =>
                            openEditEditor(employee.id, dayIndex, shift)
                          }
                          onDragStart={(event) => handleDragStart(event, shift)}
                          onDragEnd={handleDragEnd}
                        >
                          <span className="shift-role">{shift.role}</span>
                          <span className="shift-time">
                            {shift.startTime}-{shift.endTime}
                          </span>
                          {conflictCount > 0 ? (
                            <ConflictBadge />
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {editorContext && editorEmployee ? (
        <div className="editor-overlay">
          <ShiftEditor
            employee={editorEmployee}
            day={editorContext.day}
            shift={editorContext.shift}
            lastErrors={{ ...lastErrors, ...editorErrors }}
            onSubmit={submitShift}
            onRemove={removeShift}
            onCancel={closeEditor}
          />
        </div>
      ) : null}
    </section>
  );
}

function groupShifts(shifts) {
  const grouped = new Map();

  for (const shift of shifts) {
    const key = cellKey(shift.employeeId, shift.day);
    const group = grouped.get(key) ?? [];
    group.push(shift);
    grouped.set(
      key,
      group.sort((a, b) => a.startTime.localeCompare(b.startTime))
    );
  }

  return grouped;
}

function cellKey(employeeId, day) {
  return `${employeeId}:${day}`;
}

function countConflictsByShift(conflicts) {
  const counts = new Map();

  for (const conflict of conflicts) {
    for (const shiftId of conflict.shiftIds) {
      counts.set(shiftId, (counts.get(shiftId) ?? 0) + 1);
    }
  }

  return counts;
}

function shiftConflictMessage(type) {
  if (type === "overlap") {
    return "Employee already has an overlapping shift.";
  }

  if (type === "consecutive-days") {
    return "Employee cannot be scheduled for more than 5 consecutive days.";
  }

  return "Shift conflicts with the existing roster.";
}
