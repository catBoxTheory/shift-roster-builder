import { describe, expect, test } from "vitest";
import {
  detectConsecutiveDayConflicts,
  detectOverlapConflicts,
  detectRosterConflicts,
  getConflictingShiftIds
} from "./conflicts.js";

const shift = (id, overrides = {}) => ({
  id,
  employeeId: "emp-1",
  role: "Cashier",
  day: 0,
  startTime: "09:00",
  endTime: "12:00",
  ...overrides
});

describe("detectOverlapConflicts", () => {
  test("flags overlapping same-day shifts for the same employee", () => {
    const conflicts = detectOverlapConflicts([
      shift("morning", { startTime: "09:00", endTime: "13:00" }),
      shift("midday", { startTime: "12:00", endTime: "16:00" })
    ]);

    expect(conflicts).toHaveLength(1);
    expect(conflicts[0]).toMatchObject({
      type: "overlap",
      employeeId: "emp-1",
      day: 0
    });
    expect(conflicts[0].shiftIds).toEqual(["morning", "midday"]);
  });

  test("allows adjacent same-day shifts", () => {
    const conflicts = detectOverlapConflicts([
      shift("morning", { startTime: "09:00", endTime: "12:00" }),
      shift("afternoon", { startTime: "12:00", endTime: "17:00" })
    ]);

    expect(conflicts).toEqual([]);
  });

  test("ignores overlaps across different employees or days", () => {
    const conflicts = detectOverlapConflicts([
      shift("emp-1-morning", { startTime: "09:00", endTime: "13:00" }),
      shift("emp-2-midday", {
        employeeId: "emp-2",
        startTime: "12:00",
        endTime: "16:00"
      }),
      shift("emp-1-tuesday", {
        day: 1,
        startTime: "12:00",
        endTime: "16:00"
      })
    ]);

    expect(conflicts).toEqual([]);
  });
});

describe("detectConsecutiveDayConflicts", () => {
  test("allows exactly 5 consecutive scheduled days", () => {
    const shifts = [0, 1, 2, 3, 4].map((day) => shift(`day-${day}`, { day }));

    expect(detectConsecutiveDayConflicts(shifts)).toEqual([]);
  });

  test("flags 6 consecutive scheduled days", () => {
    const shifts = [0, 1, 2, 3, 4, 5].map((day) =>
      shift(`day-${day}`, { day })
    );

    const conflicts = detectConsecutiveDayConflicts(shifts);

    expect(conflicts).toHaveLength(1);
    expect(conflicts[0]).toMatchObject({
      type: "consecutive-days",
      employeeId: "emp-1",
      days: [0, 1, 2, 3, 4, 5]
    });
    expect(conflicts[0].shiftIds).toEqual([
      "day-0",
      "day-1",
      "day-2",
      "day-3",
      "day-4",
      "day-5"
    ]);
  });

  test("does not flag 6 non-consecutive scheduled days", () => {
    const shifts = [0, 1, 2, 3, 4, 6].map((day) =>
      shift(`day-${day}`, { day })
    );

    expect(detectConsecutiveDayConflicts(shifts)).toEqual([]);
  });
});

describe("detectRosterConflicts", () => {
  test("combines conflict types and exposes conflicting shift ids", () => {
    const shifts = [
      shift("overlap-a", { day: 0, startTime: "09:00", endTime: "13:00" }),
      shift("overlap-b", { day: 0, startTime: "12:00", endTime: "16:00" }),
      ...[1, 2, 3, 4, 5, 6].map((day) => shift(`day-${day}`, { day }))
    ];

    const conflicts = detectRosterConflicts(shifts);

    expect(conflicts.map((conflict) => conflict.type)).toEqual([
      "overlap",
      "consecutive-days"
    ]);
    expect(getConflictingShiftIds(conflicts)).toEqual(
      new Set([
        "overlap-a",
        "overlap-b",
        "day-1",
        "day-2",
        "day-3",
        "day-4",
        "day-5",
        "day-6"
      ])
    );
  });
});
