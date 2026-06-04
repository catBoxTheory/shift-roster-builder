import { describe, expect, test } from "vitest";
import { calculateShiftHours, parseTimeToMinutes } from "./time.js";

describe("parseTimeToMinutes", () => {
  test("converts HH:MM strings to minutes after midnight", () => {
    expect(parseTimeToMinutes("00:00")).toBe(0);
    expect(parseTimeToMinutes("09:30")).toBe(570);
    expect(parseTimeToMinutes("17:45")).toBe(1065);
  });

  test("rejects malformed or out-of-range time strings", () => {
    expect(() => parseTimeToMinutes("9:00")).toThrow("Invalid time");
    expect(() => parseTimeToMinutes("24:00")).toThrow("Invalid time");
    expect(() => parseTimeToMinutes("09:60")).toThrow("Invalid time");
    expect(() => parseTimeToMinutes("close")).toThrow("Invalid time");
  });
});

describe("calculateShiftHours", () => {
  test("calculates decimal hours for a same-day shift", () => {
    expect(
      calculateShiftHours({ startTime: "09:00", endTime: "17:00" })
    ).toBe(8);
    expect(
      calculateShiftHours({ startTime: "09:30", endTime: "13:00" })
    ).toBe(3.5);
  });

  test("rejects zero-length and overnight shifts", () => {
    expect(() =>
      calculateShiftHours({ startTime: "09:00", endTime: "09:00" })
    ).toThrow("End time must be after start time");
    expect(() =>
      calculateShiftHours({ startTime: "17:00", endTime: "09:00" })
    ).toThrow("End time must be after start time");
  });
});
