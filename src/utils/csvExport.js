import { calculateShiftHours } from "./time.js";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const HEADERS = [
  "Employee",
  "Role",
  "Day",
  "Start",
  "End",
  "Hours",
  "Conflict Notes"
];

export function buildRosterCsv({ employees, shifts, conflicts }) {
  const employeesById = new Map(
    employees.map((employee) => [employee.id, employee])
  );
  const conflictNotesByShift = buildConflictNotesByShift(conflicts);
  const rows = [...shifts]
    .sort(compareShifts(employeesById))
    .map((shift) => {
      const employee = employeesById.get(shift.employeeId);
      const conflictNotes = conflictNotesByShift.get(shift.id) ?? [];

      return [
        employee?.name ?? "Unassigned",
        shift.role,
        dayLabel(shift.day),
        shift.startTime,
        shift.endTime,
        formatHours(calculateShiftHours(shift)),
        conflictNotes.join("; ")
      ];
    });

  return [HEADERS, ...rows].map(formatCsvRow).join("\n");
}

export function buildRosterCsvFileName(date = new Date()) {
  return `shift-roster-${date.toISOString().slice(0, 10)}.csv`;
}

function buildConflictNotesByShift(conflicts) {
  const notesByShift = new Map();

  for (const conflict of conflicts) {
    const note = conflictLabel(conflict.type);

    for (const shiftId of conflict.shiftIds) {
      const notes = notesByShift.get(shiftId) ?? [];

      if (!notes.includes(note)) {
        notes.push(note);
      }

      notesByShift.set(shiftId, notes);
    }
  }

  return notesByShift;
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

function dayLabel(day) {
  return DAYS[day] ?? "Day";
}

function formatHours(hours) {
  return String(Number(hours.toFixed(2)));
}

function conflictLabel(type) {
  if (type === "overlap") {
    return "Overlapping shifts";
  }

  if (type === "consecutive-days") {
    return "More than 5 consecutive days";
  }

  return "Conflict";
}
