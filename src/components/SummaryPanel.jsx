const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function SummaryPanel({
  employees,
  shifts,
  conflicts,
  weeklyHoursByEmployee
}) {
  const totalHours = Object.values(weeklyHoursByEmployee).reduce(
    (sum, hours) => sum + hours,
    0
  );
  const shiftCountsByEmployee = countShiftsByEmployee(shifts);
  const conflictCountsByEmployee = countConflictsByEmployee(conflicts);
  const sortedEmployees = [...employees].sort((first, second) => {
    const hourDifference =
      (weeklyHoursByEmployee[second.id] ?? 0) -
      (weeklyHoursByEmployee[first.id] ?? 0);

    if (hourDifference !== 0) {
      return hourDifference;
    }

    return first.name.localeCompare(second.name);
  });

  return (
    <aside className="panel summary-panel" aria-labelledby="summary-title">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Review</p>
          <h2 id="summary-title">Summary</h2>
        </div>
        <span className={conflicts.length > 0 ? "count-pill warning" : "count-pill"}>
          {conflicts.length}
        </span>
      </div>

      <dl className="summary-facts">
        <SummaryFact label="Employees" value={employees.length} />
        <SummaryFact label="Shifts" value={shifts.length} />
        <SummaryFact label="Total hours" value={formatHours(totalHours)} />
        <SummaryFact label="Conflicts" value={conflicts.length} />
      </dl>

      <section className="summary-section" aria-labelledby="hours-title">
        <h3 id="hours-title">Weekly hours</h3>
        <div className="summary-employee-list">
          {sortedEmployees.map((employee) => {
            const hours = weeklyHoursByEmployee[employee.id] ?? 0;
            const shiftCount = shiftCountsByEmployee.get(employee.id) ?? 0;
            const conflictCount = conflictCountsByEmployee.get(employee.id) ?? 0;

            return (
              <div className="summary-employee-row" key={employee.id}>
                <div>
                  <strong>{employee.name}</strong>
                  <span>
                    {shiftCount} {shiftCount === 1 ? "shift" : "shifts"}
                    {conflictCount > 0
                      ? ` · ${conflictCount} ${
                          conflictCount === 1 ? "conflict" : "conflicts"
                        }`
                      : ""}
                  </span>
                </div>
                <strong>{formatHours(hours)}</strong>
              </div>
            );
          })}
        </div>
      </section>

      <section className="summary-section" aria-labelledby="conflicts-title">
        <h3 id="conflicts-title">Conflict details</h3>
        {conflicts.length > 0 ? (
          <ul className="conflict-list">
            {conflicts.map((conflict) => (
              <li key={conflictKey(conflict)}>
                {formatConflict(conflict, employees)}
              </li>
            ))}
          </ul>
        ) : (
          <p className="empty-note">No conflicts</p>
        )}
      </section>
    </aside>
  );
}

function SummaryFact({ label, value }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function countShiftsByEmployee(shifts) {
  const counts = new Map();

  for (const shift of shifts) {
    counts.set(shift.employeeId, (counts.get(shift.employeeId) ?? 0) + 1);
  }

  return counts;
}

function countConflictsByEmployee(conflicts) {
  const counts = new Map();

  for (const conflict of conflicts) {
    counts.set(conflict.employeeId, (counts.get(conflict.employeeId) ?? 0) + 1);
  }

  return counts;
}

function formatConflict(conflict, employees) {
  const employeeName =
    employees.find((employee) => employee.id === conflict.employeeId)?.name ??
    "Employee";

  if (conflict.type === "overlap") {
    return `${employeeName} has overlapping shifts on ${dayLabel(conflict.day)}.`;
  }

  if (conflict.type === "consecutive-days") {
    return `${employeeName} is scheduled for more than 5 consecutive days (${formatDayRange(
      conflict.days
    )}).`;
  }

  return `${employeeName}: ${conflict.message}`;
}

function formatDayRange(days) {
  if (!Array.isArray(days) || days.length === 0) {
    return "Unknown days";
  }

  return `${dayLabel(days[0])}-${dayLabel(days[days.length - 1])}`;
}

function dayLabel(day) {
  return DAYS[day] ?? "Day";
}

function formatHours(hours) {
  return `${Number(hours.toFixed(2))}h`;
}

function conflictKey(conflict) {
  return `${conflict.type}:${conflict.employeeId}:${conflict.shiftIds.join(",")}`;
}
