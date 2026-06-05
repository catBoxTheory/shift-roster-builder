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
  const conflictDetails = summarizeConflicts(conflicts, employees);
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
      </div>

      <dl className="summary-facts">
        <SummaryFact label="Employees" value={employees.length} />
        <SummaryFact label="Shifts" value={shifts.length} />
        <SummaryFact label="Total hours" value={formatHours(totalHours)} />
      </dl>

      <section className="summary-section" aria-labelledby="hours-title">
        <h3 id="hours-title">Weekly hours</h3>
        <div className="summary-employee-list">
          {sortedEmployees.map((employee) => {
            const hours = weeklyHoursByEmployee[employee.id] ?? 0;
            const shiftCount = shiftCountsByEmployee.get(employee.id) ?? 0;

            return (
              <div className="summary-employee-row" key={employee.id}>
                <div>
                  <strong>{employee.name}</strong>
                  <span>
                    {shiftCount} {shiftCount === 1 ? "shift" : "shifts"}
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
        {conflictDetails.length > 0 ? (
          <ul className="conflict-list">
            {conflictDetails.map((detail) => (
              <li key={detail.key}>{detail.message}</li>
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

function summarizeConflicts(conflicts, employees) {
  const summaries = [];
  const seen = new Set();

  for (const conflict of conflicts) {
    const key = `${conflict.employeeId}:${conflict.type}`;

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);

    const employeeName =
      employees.find((employee) => employee.id === conflict.employeeId)?.name ??
      "Employee";

    summaries.push({
      key,
      message: formatConflictSummary(
        conflict.type,
        employeeName,
        conflict.message
      )
    });
  }

  return summaries;
}

function formatConflictSummary(type, employeeName, fallbackMessage) {
  if (type === "overlap") {
    return `${employeeName} has overlapping shifts.`;
  }

  if (type === "consecutive-days") {
    return `${employeeName} is scheduled for more than 5 consecutive days.`;
  }

  return `${employeeName}: ${fallbackMessage}`;
}

function formatHours(hours) {
  return `${Number(hours.toFixed(2))}h`;
}
