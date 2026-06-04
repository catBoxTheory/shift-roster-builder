import EmployeePanel from "./components/EmployeePanel.jsx";
import RosterGrid from "./components/RosterGrid.jsx";
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
            Employee management and weekly shift assignment are active.
            Conflicts and summaries will be polished in the next phase.
          </p>
        </div>
        <div className="status-card" aria-label="Project status">
          <span className="status-dot" aria-hidden="true" />
          <span>Phase 5 complete</span>
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

        <RosterGrid
          employees={roster.employees}
          shifts={roster.shifts}
          lastErrors={roster.lastErrors}
          onAddShift={roster.addShift}
          onEditShift={roster.editShift}
          onRemoveShift={roster.removeShift}
        />

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
