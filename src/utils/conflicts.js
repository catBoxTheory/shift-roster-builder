import { parseTimeToMinutes } from "./time.js";

const CONSECUTIVE_DAY_LIMIT = 5;

export function detectOverlapConflicts(shifts) {
  const conflicts = [];
  const shiftsByEmployeeDay = groupBy(shifts, (shift) =>
    [shift.employeeId, shift.day].join(":")
  );

  for (const dayShifts of shiftsByEmployeeDay.values()) {
    const sortedShifts = [...dayShifts].sort(
      (a, b) => parseTimeToMinutes(a.startTime) - parseTimeToMinutes(b.startTime)
    );

    for (let i = 0; i < sortedShifts.length; i += 1) {
      for (let j = i + 1; j < sortedShifts.length; j += 1) {
        const first = sortedShifts[i];
        const second = sortedShifts[j];

        if (!timeRangesOverlap(first, second)) {
          break;
        }

        conflicts.push({
          type: "overlap",
          employeeId: first.employeeId,
          day: first.day,
          shiftIds: [first.id, second.id],
          message: "Employee has overlapping shifts on the same day."
        });
      }
    }
  }

  return conflicts;
}

export function detectConsecutiveDayConflicts(shifts) {
  const conflicts = [];
  const shiftsByEmployee = groupBy(shifts, (shift) => shift.employeeId);

  for (const [employeeId, employeeShifts] of shiftsByEmployee.entries()) {
    const days = uniqueSorted(employeeShifts.map((shift) => shift.day));
    const runs = findConsecutiveRuns(days);

    for (const run of runs) {
      if (run.length <= CONSECUTIVE_DAY_LIMIT) {
        continue;
      }

      const shiftIds = employeeShifts
        .filter((shift) => run.includes(shift.day))
        .map((shift) => shift.id);

      conflicts.push({
        type: "consecutive-days",
        employeeId,
        days: run,
        shiftIds,
        message: "Employee is scheduled for more than 5 consecutive days."
      });
    }
  }

  return conflicts;
}

export function detectRosterConflicts(shifts) {
  return [
    ...detectOverlapConflicts(shifts),
    ...detectConsecutiveDayConflicts(shifts)
  ];
}

export function getConflictingShiftIds(conflicts) {
  return new Set(conflicts.flatMap((conflict) => conflict.shiftIds));
}

function timeRangesOverlap(first, second) {
  const firstStart = parseTimeToMinutes(first.startTime);
  const firstEnd = parseTimeToMinutes(first.endTime);
  const secondStart = parseTimeToMinutes(second.startTime);
  const secondEnd = parseTimeToMinutes(second.endTime);

  return firstStart < secondEnd && secondStart < firstEnd;
}

function groupBy(items, getKey) {
  const grouped = new Map();

  for (const item of items) {
    const key = getKey(item);
    const group = grouped.get(key) ?? [];
    group.push(item);
    grouped.set(key, group);
  }

  return grouped;
}

function uniqueSorted(values) {
  return [...new Set(values)].sort((a, b) => a - b);
}

function findConsecutiveRuns(days) {
  if (days.length === 0) {
    return [];
  }

  const runs = [];
  let currentRun = [days[0]];

  for (let index = 1; index < days.length; index += 1) {
    const day = days[index];
    const previousDay = days[index - 1];

    if (day === previousDay + 1) {
      currentRun.push(day);
    } else {
      runs.push(currentRun);
      currentRun = [day];
    }
  }

  runs.push(currentRun);
  return runs;
}
