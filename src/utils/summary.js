import { calculateShiftHours } from "./time.js";

export function calculateWeeklyHoursByEmployee(shifts) {
  return shifts.reduce((totals, shift) => {
    const currentTotal = totals[shift.employeeId] ?? 0;

    return {
      ...totals,
      [shift.employeeId]: currentTotal + calculateShiftHours(shift)
    };
  }, {});
}
