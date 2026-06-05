import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, test, vi } from "vitest";
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
  test("shows roster totals without conflict details", () => {
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
    expect(container.textContent).toContain("Blair Wong");
    expect(container.textContent).not.toContain("Conflict details");
    expect(container.textContent).not.toContain("No conflicts");
    expect(container.textContent).not.toContain("has overlapping shifts");
    expect(container.textContent).not.toContain("more than 5 consecutive days");
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

  test("groups summary facts and weekly hours for a side-by-side review layout", () => {
    const { container } = renderSummary();

    const layout = container.querySelector(".review-layout");
    const overview = container.querySelector(".review-summary");
    const weeklyHours = container.querySelector(".review-weekly-hours");

    expect(layout).not.toBeNull();
    expect(overview?.querySelector(".summary-facts")).not.toBeNull();
    expect(weeklyHours?.textContent).toContain("Weekly hours");
  });

  test("places export action in a bottom row after summary and weekly hours", () => {
    const { container } = renderSummary({ onExportCsv: vi.fn() });

    const layoutChildren = [...container.querySelector(".review-layout").children];

    expect(layoutChildren[0].className).toBe("review-summary");
    expect(layoutChildren[1].className).toBe("review-weekly-hours");
    expect(layoutChildren[2].className).toBe("review-actions");
    expect(layoutChildren[2].textContent).toContain("Export CSV");
  });

  test("does not show an empty conflict state when the roster is clean", () => {
    const { container } = renderSummary();

    expect(container.textContent).not.toContain("Conflict details");
    expect(container.textContent).not.toContain("No conflicts");
  });

  test("calls the export action from the summary panel", () => {
    const onExportCsv = vi.fn();
    const { container } = renderSummary({ onExportCsv });

    click(getButton(container, "Export CSV"));

    expect(onExportCsv).toHaveBeenCalledTimes(1);
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
        onExportCsv={undefined}
        {...props}
      />
    );
  });

  roots.push({ root, container });
  return { container };
}

function getButton(container, label) {
  const button = [...container.querySelectorAll("button")].find(
    (item) => item.textContent.trim() === label
  );

  if (!button) {
    throw new Error(`Button not found: ${label}`);
  }

  return button;
}

function click(element) {
  act(() => {
    element.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  });
}
