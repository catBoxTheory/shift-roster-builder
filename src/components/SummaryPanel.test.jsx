import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, test } from "vitest";
import SummaryPanel from "./SummaryPanel.jsx";

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const employees = [
  {
    id: "emp-alex",
    name: "Alex Chen",
    roles: ["Cashier", "Supervisor"]
  },
  {
    id: "emp-blair",
    name: "Blair Wong",
    roles: ["Cook"]
  },
  {
    id: "emp-casey",
    name: "Casey Lee",
    roles: ["Barista"]
  }
];

const shifts = [
  { id: "shift-alex-1", employeeId: "emp-alex" },
  { id: "shift-alex-2", employeeId: "emp-alex" },
  { id: "shift-blair-1", employeeId: "emp-blair" },
  { id: "shift-casey-1", employeeId: "emp-casey" }
];

const conflicts = [
  {
    type: "overlap",
    employeeId: "emp-alex",
    day: 0,
    shiftIds: ["shift-alex-1", "shift-alex-2"],
    message: "Employee has overlapping shifts on the same day."
  },
  {
    type: "consecutive-days",
    employeeId: "emp-blair",
    days: [0, 1, 2, 3, 4, 5],
    shiftIds: ["shift-blair-1"],
    message: "Employee is scheduled for more than 5 consecutive days."
  }
];

const roots = [];

afterEach(() => {
  while (roots.length > 0) {
    const { root, container } = roots.pop();
    act(() => root.unmount());
    container.remove();
  }
});

describe("SummaryPanel", () => {
  test("shows roster totals and conflict explanations", () => {
    const { container } = renderSummary({
      conflicts,
      weeklyHoursByEmployee: {
        "emp-alex": 8,
        "emp-blair": 12.5,
        "emp-casey": 5.25
      }
    });

    expect(container.textContent).toContain("Employees");
    expect(container.textContent).toContain("3");
    expect(container.textContent).toContain("Shifts");
    expect(container.textContent).toContain("4");
    expect(container.textContent).toContain("Total hours");
    expect(container.textContent).toContain("25.75h");
    expect(container.textContent).toContain("Alex Chen");
    expect(container.textContent).toContain("has overlapping shifts");
    expect(container.textContent).toContain("Blair Wong");
    expect(container.textContent).toContain("more than 5 consecutive days");
  });

  test("does not show conflict counts in the summary", () => {
    const { container } = renderSummary({
      conflicts,
      weeklyHoursByEmployee: {
        "emp-alex": 8,
        "emp-blair": 12.5,
        "emp-casey": 5.25
      }
    });

    const factLabels = [...container.querySelectorAll(".summary-facts dt")].map(
      (item) => item.textContent
    );
    const rows = [...container.querySelectorAll(".summary-employee-row")].map(
      (row) => row.textContent
    );

    expect(container.querySelector(".summary-panel .count-pill")).toBeNull();
    expect(factLabels).not.toContain("Conflicts");
    expect(rows.every((row) => !row.includes("conflict"))).toBe(true);
  });

  test("flags each employee once per conflict type in conflict details", () => {
    const repeatedConflicts = [
      {
        type: "overlap",
        employeeId: "emp-alex",
        day: 0,
        shiftIds: ["shift-alex-1", "shift-alex-2"],
        message: "Employee has overlapping shifts on the same day."
      },
      {
        type: "overlap",
        employeeId: "emp-alex",
        day: 1,
        shiftIds: ["shift-alex-3", "shift-alex-4"],
        message: "Employee has overlapping shifts on the same day."
      },
      {
        type: "consecutive-days",
        employeeId: "emp-alex",
        days: [0, 1, 2, 3, 4, 5],
        shiftIds: ["shift-alex-1"],
        message: "Employee is scheduled for more than 5 consecutive days."
      }
    ];

    const { container } = renderSummary({ conflicts: repeatedConflicts });
    const details = [...container.querySelectorAll(".conflict-list li")].map(
      (item) => item.textContent
    );

    expect(details).toHaveLength(2);
    expect(details[0]).toContain("Alex Chen has overlapping shifts.");
    expect(details[1]).toContain(
      "Alex Chen is scheduled for more than 5 consecutive days."
    );
  });

  test("sorts employees by weekly hours descending", () => {
    const { container } = renderSummary({
      weeklyHoursByEmployee: {
        "emp-alex": 8,
        "emp-blair": 12.5,
        "emp-casey": 5.25
      }
    });

    const rows = [...container.querySelectorAll(".summary-employee-row")].map(
      (row) => row.textContent
    );

    expect(rows[0]).toContain("Blair Wong");
    expect(rows[0]).toContain("12.5h");
    expect(rows[1]).toContain("Alex Chen");
    expect(rows[1]).toContain("8h");
    expect(rows[2]).toContain("Casey Lee");
    expect(rows[2]).toContain("5.25h");
  });

  test("shows an empty conflict state when the roster is clean", () => {
    const { container } = renderSummary();

    expect(container.textContent).toContain("No conflicts");
  });
});

function renderSummary(props = {}) {
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);

  act(() => {
    root.render(
      <SummaryPanel
        employees={employees}
        shifts={shifts}
        conflicts={[]}
        weeklyHoursByEmployee={{}}
        {...props}
      />
    );
  });

  roots.push({ root, container });
  return { container };
}
