import EmployeePanel from "./components/EmployeePanel.jsx";
import RosterGrid from "./components/RosterGrid.jsx";
import SummaryPanel from "./components/SummaryPanel.jsx";
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
            Employee management, weekly shift assignment, conflict checks, and
            hour summaries are active.
          </p>
        </div>
        <div className="status-card" aria-label="Project status">
          <span className="status-dot" aria-hidden="true" />
          <span>Phase 6 complete</span>
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
          conflicts={roster.conflicts}
          conflictingShiftIds={roster.conflictingShiftIds}
          lastErrors={roster.lastErrors}
          onAddShift={roster.addShift}
          onEditShift={roster.editShift}
          onRemoveShift={roster.removeShift}
        />

        <SummaryPanel
          employees={roster.employees}
          shifts={roster.shifts}
          conflicts={roster.conflicts}
          weeklyHoursByEmployee={roster.weeklyHoursByEmployee}
        />
      </section>
    </main>
  );
}
