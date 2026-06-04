import { useEffect, useState } from "react";

export default function ShiftEditor({
  employee,
  day,
  shift,
  lastErrors = {},
  onSubmit,
  onRemove,
  onCancel
}) {
  const [role, setRole] = useState(shift?.role ?? employee.roles[0] ?? "");
  const [startTime, setStartTime] = useState(shift?.startTime ?? "09:00");
  const [endTime, setEndTime] = useState(shift?.endTime ?? "17:00");
  const isEditing = Boolean(shift);

  useEffect(() => {
    setRole(shift?.role ?? employee.roles[0] ?? "");
    setStartTime(shift?.startTime ?? "09:00");
    setEndTime(shift?.endTime ?? "17:00");
  }, [employee, shift]);

  function submitShift(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const nextRole = formData.get("role")?.toString() ?? role;
    const nextStartTime = formData.get("startTime")?.toString() ?? startTime;
    const nextEndTime = formData.get("endTime")?.toString() ?? endTime;

    setRole(nextRole);
    setStartTime(nextStartTime);
    setEndTime(nextEndTime);

    onSubmit({
      ...(shift ? { id: shift.id } : {}),
      employeeId: employee.id,
      role: nextRole,
      day,
      startTime: nextStartTime,
      endTime: nextEndTime
    });
  }

  return (
    <form className="shift-editor" onSubmit={submitShift}>
      <div className="shift-editor-heading">
        <h3>{isEditing ? "Edit shift" : "Add shift"}</h3>
        <p>
          {employee.name} · {dayLabel(day)}
        </p>
      </div>

      <label className="field-label" htmlFor="shift-role">
        Role
      </label>
      <select
        id="shift-role"
        name="role"
        aria-label="Shift role"
        className="select-input"
        value={role}
        onChange={(event) => setRole(event.target.value)}
      >
        {employee.roles.map((employeeRole) => (
          <option key={employeeRole} value={employeeRole}>
            {employeeRole}
          </option>
        ))}
      </select>

      <div className="time-fields">
        <label>
          <span className="field-label">Start</span>
          <input
            aria-label="Start time"
            className="text-input"
            name="startTime"
            type="time"
            value={startTime}
            onChange={(event) => setStartTime(event.target.value)}
          />
        </label>
        <label>
          <span className="field-label">End</span>
          <input
            aria-label="End time"
            className="text-input"
            name="endTime"
            type="time"
            value={endTime}
            onChange={(event) => setEndTime(event.target.value)}
          />
        </label>
      </div>

      <ErrorList errors={lastErrors} />

      <div className="row-actions">
        <button className="primary-button small" type="submit">
          {isEditing ? "Save shift" : "Add shift"}
        </button>
        {isEditing ? (
          <button
            className="ghost-danger-button small"
            type="button"
            onClick={() => onRemove(shift.id)}
          >
            Remove shift
          </button>
        ) : null}
        <button className="secondary-button small" type="button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}

function ErrorList({ errors }) {
  const messages = Object.values(errors);

  if (messages.length === 0) {
    return null;
  }

  return (
    <div className="error-list" role="alert">
      {messages.map((message) => (
        <p key={message}>{message}</p>
      ))}
    </div>
  );
}

function dayLabel(day) {
  return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][day] ?? "Day";
}
