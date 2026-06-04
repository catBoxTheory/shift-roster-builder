import { describe, expect, test } from "vitest";
import { calculateWeeklyHoursByEmployee } from "../utils/summary.js";

describe("calculateWeeklyHoursByEmployee", () => {
  test("totals assigned hours per employee", () => {
    const totals = calculateWeeklyHoursByEmployee([
      {
        id: "shift-1",
        employeeId: "emp-1",
        startTime: "09:00",
        endTime: "17:00"
      },
      {
        id: "shift-2",
        employeeId: "emp-1",
        startTime: "09:30",
        endTime: "13:00"
      },
      {
        id: "shift-3",
        employeeId: "emp-2",
        startTime: "10:00",
        endTime: "15:15"
      }
    ]);

    expect(totals).toEqual({
      "emp-1": 11.5,
      "emp-2": 5.25
    });
  });

  test("returns an empty object when there are no shifts", () => {
    expect(calculateWeeklyHoursByEmployee([])).toEqual({});
  });
});
