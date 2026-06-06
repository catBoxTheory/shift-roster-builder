import { calculateShiftHours, roundHours } from "./time.js";
import { dayLabel } from "./days.js";

const HEADERS = ["Employee", "Role", "Day", "Start", "End", "Hours"];

export function buildRosterCsv({ employees, shifts }) {
  const employeesById = new Map(
    employees.map((employee) => [employee.id, employee])
  );
  const rows = [...shifts]
    .sort(compareShifts(employeesById))
    .map((shift) => {
      const employee = employeesById.get(shift.employeeId);

      return [
        employee?.name ?? "Unassigned",
        shift.role,
        dayLabel(shift.day),
        shift.startTime,
        shift.endTime,
        roundHours(calculateShiftHours(shift))
      ];
    });

  return [HEADERS, ...rows].map(formatCsvRow).join("\n");
}

export function buildRosterCsvFileName(date = new Date()) {
  return `shift-roster-${date.toISOString().slice(0, 10)}.csv`;
}

function compareShifts(employeesById) {
  return (first, second) => {
    const dayDifference = Number(first.day) - Number(second.day);

    if (dayDifference !== 0) {
      return dayDifference;
    }

    const firstEmployee = employeesById.get(first.employeeId)?.name ?? "";
    const secondEmployee = employeesById.get(second.employeeId)?.name ?? "";
    const employeeDifference = firstEmployee.localeCompare(secondEmployee);

    if (employeeDifference !== 0) {
      return employeeDifference;
    }

    return first.startTime.localeCompare(second.startTime);
  };
}

function formatCsvRow(values) {
  return values.map(formatCsvCell).join(",");
}

function formatCsvCell(value) {
  const text = String(value).replace(/\r?\n/g, " ");

  if (!/[",\n]/.test(text)) {
    return text;
  }

  return `"${text.replaceAll('"', '""')}"`;
}
