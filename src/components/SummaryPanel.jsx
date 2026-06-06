import { roundHours } from "../utils/time.js";

export default function SummaryPanel({
  employees,
  shifts,
  weeklyHoursByEmployee,
  onExportCsv
}) {
  const totalHours = Object.values(weeklyHoursByEmployee).reduce(
    (sum, hours) => sum + hours,
    0
  );
  const shiftCountsByEmployee = countShiftsByEmployee(shifts);
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
      <div className="review-layout">
        <section className="review-summary" aria-labelledby="summary-title">
          <p className="eyebrow">Review</p>
          <h2 id="summary-title">Summary</h2>

          <dl className="summary-facts">
            <SummaryFact label="Employees" value={employees.length} />
            <SummaryFact label="Shifts" value={shifts.length} />
            <SummaryFact label="Total hours" value={formatHours(totalHours)} />
          </dl>
        </section>

        <section
          className="review-weekly-hours"
          aria-labelledby="hours-title"
        >
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

        {onExportCsv ? (
          <section className="review-actions" aria-label="Review actions">
            <button
              className="primary-button small"
              type="button"
              onClick={onExportCsv}
            >
              Export CSV
            </button>
          </section>
        ) : null}
      </div>
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

function formatHours(hours) {
  return `${roundHours(hours)}h`;
}
