import EmployeePanel from "./components/EmployeePanel.jsx";
import RosterGrid from "./components/RosterGrid.jsx";
import SummaryPanel from "./components/SummaryPanel.jsx";
import optixLogo from "./assets/optix-logo.png";
import { useRoster } from "./hooks/useRoster.js";
import { buildRosterCsv, buildRosterCsvFileName } from "./utils/csvExport.js";

export default function App() {
  const roster = useRoster();

  function exportRosterCsv() {
    const csv = buildRosterCsv({
      employees: roster.employees,
      shifts: roster.shifts
    });
    downloadTextFile(csv, buildRosterCsvFileName());
  }

  return (
    <main className="app-shell">
      <header className="app-header" aria-labelledby="app-title">
        <div className="brand-lockup">
          <img
            className="brand-logo"
            src={optixLogo}
            alt="Optix Solutions Limited logo"
          />
          <div>
            <p className="stage-label">Optix Stage 2 Assessment</p>
            <h1 id="app-title">Shift Roster Builder</h1>
          </div>
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
          onMoveShift={roster.moveShift}
        />

        <SummaryPanel
          employees={roster.employees}
          shifts={roster.shifts}
          conflicts={roster.conflicts}
          weeklyHoursByEmployee={roster.weeklyHoursByEmployee}
          onExportCsv={exportRosterCsv}
        />
      </section>
    </main>
  );
}

function downloadTextFile(text, fileName) {
  const blob = new Blob([text], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = fileName;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
