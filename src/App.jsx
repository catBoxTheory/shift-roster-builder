import EmployeePanel from "./components/EmployeePanel.jsx";
import { useRoster } from "./hooks/useRoster.js";

export default function App() {
  const roster = useRoster();

  return (
    <main className="app-shell">
      <header className="app-header" aria-labelledby="app-title">
        <div>
          <p className="stage-label">Optix Stage 2 Assessment</p>
          <h1 id="app-title">Shift Roster Builder</h1>
          <p className="app-subtitle">
            Employee management is active. Roster assignment and summaries are
            staged for the next phases.
          </p>
        </div>
        <div className="status-card" aria-label="Project status">
          <span className="status-dot" aria-hidden="true" />
          <span>Phase 4 complete</span>
        </div>
      </header>

      <section className="workspace-grid" aria-label="Roster workspace">
        <EmployeePanel
          employees={roster.employees}
          lastErrors={roster.lastErrors}
          onAddEmployee={roster.addEmployee}
          onEditEmployee={roster.editEmployee}
          onRemoveEmployee={roster.removeEmployee}
        />

        <section className="panel roster-placeholder" aria-labelledby="grid-title">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Week</p>
              <h2 id="grid-title">Roster Grid</h2>
            </div>
          </div>
          <div className="placeholder-board">
            <span>Phase 5</span>
            <p>Day-by-day shift assignment will use the employees managed here.</p>
          </div>
        </section>

        <aside className="panel summary-placeholder" aria-labelledby="summary-title">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Review</p>
              <h2 id="summary-title">Summary</h2>
            </div>
          </div>
          <dl className="summary-facts">
            <div>
              <dt>Employees</dt>
              <dd>{roster.employees.length}</dd>
            </div>
            <div>
              <dt>Shifts</dt>
              <dd>{roster.shifts.length}</dd>
            </div>
            <div>
              <dt>Conflicts</dt>
              <dd>{roster.conflicts.length}</dd>
            </div>
          </dl>
        </aside>
      </section>
    </main>
  );
}
