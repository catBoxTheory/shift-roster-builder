import { describe, expect, test } from "vitest";
import { buildRosterCsv, buildRosterCsvFileName } from "./csvExport.js";

const employees = [
  {
    id: "emp-alex",
    name: "Alex Chen",
    roles: ["Cashier", "Supervisor"]
  },
  {
    id: "emp-blair",
    name: "Blair, Wong",
    roles: ["Cook"]
  }
];

const shifts = [
  {
    id: "shift-blair-tue",
    employeeId: "emp-blair",
    role: "Cook",
    day: 1,
    startTime: "10:00",
    endTime: "16:00"
  },
  {
    id: "shift-alex-mon",
    employeeId: "emp-alex",
    role: "Cashier",
    day: 0,
    startTime: "09:00",
    endTime: "17:00"
  }
];

describe("buildRosterCsv", () => {
  test("exports sorted shift rows with hours", () => {
    const csv = buildRosterCsv({ employees, shifts });

    expect(csv).toBe(
      [
        "Employee,Role,Day,Start,End,Hours",
        "Alex Chen,Cashier,Mon,09:00,17:00,8",
        '"Blair, Wong",Cook,Tue,10:00,16:00,6'
      ].join("\n")
    );
  });

  test("escapes quotes and newlines for spreadsheet-safe CSV", () => {
    const csv = buildRosterCsv({
      employees: [
        {
          id: "emp-quoted",
          name: 'Casey "CJ"\nLee',
          roles: ["Barista"]
        }
      ],
      shifts: [
        {
          id: "shift-quoted",
          employeeId: "emp-quoted",
          role: "Barista",
          day: 2,
          startTime: "08:30",
          endTime: "13:30"
        }
      ]
    });

    expect(csv).toContain('"Casey ""CJ"" Lee"');
  });

  test("exports only the header when there are no shifts", () => {
    expect(buildRosterCsv({ employees, shifts: [] })).toBe(
      "Employee,Role,Day,Start,End,Hours"
    );
  });
});

describe("buildRosterCsvFileName", () => {
  test("uses a stable date-based file name", () => {
    expect(buildRosterCsvFileName(new Date("2026-06-05T10:15:00Z"))).toBe(
      "shift-roster-2026-06-05.csv"
    );
  });
});
