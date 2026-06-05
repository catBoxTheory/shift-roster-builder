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
  onRemoveShift
}) {
  const [editorContext, setEditorContext] = useState(null);
  const [editorErrors, setEditorErrors] = useState({});
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

  return (
    <section className="panel roster-grid-panel" aria-labelledby="grid-title">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Week</p>
          <h2 id="grid-title">Roster Grid</h2>
        </div>
        <span className="count-pill">{shifts.length}</span>
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

              return (
                <div className="shift-cell" role="cell" key={day}>
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
                            conflictCount > 0 ? "is-conflicting" : ""
                          ]
                            .filter(Boolean)
                            .join(" ")}
                          type="button"
                          key={shift.id}
                          aria-label={`Edit ${shift.role} shift for ${employee.name} on ${day}`}
                          onClick={() =>
                            openEditEditor(employee.id, dayIndex, shift)
                          }
                        >
                          <span className="shift-role">{shift.role}</span>
                          <span>
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
