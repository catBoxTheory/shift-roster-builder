import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, test, vi } from "vitest";
import RosterGrid from "./RosterGrid.jsx";

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

class DragEvent extends Event {
  constructor(type, options = {}) {
    super(type, options);
    this.dataTransfer = options.dataTransfer ?? null;
  }
}

globalThis.DragEvent = DragEvent;

const employees = [
  {
    id: "emp-1",
    name: "Alex Chen",
    roles: ["Cashier", "Supervisor"]
  },
  {
    id: "emp-2",
    name: "Blair Wong",
    roles: ["Cook"]
  }
];

const shifts = [
  {
    id: "shift-1",
    employeeId: "emp-1",
    role: "Cashier",
    day: 0,
    startTime: "09:00",
    endTime: "17:00"
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

describe("RosterGrid", () => {
  test("renders day headers, employee rows, and existing shift cards", () => {
    const { container } = renderGrid();

    expect(container.textContent).toContain("Mon");
    expect(container.textContent).toContain("Sun");
    expect(container.textContent).toContain("Alex Chen");
    expect(container.textContent).toContain("Blair Wong");
    expect(container.textContent).toContain("Cashier");
    expect(container.textContent).toContain("09:00-17:00");
  });

  test("does not show a header count pill", () => {
    const { container } = renderGrid();

    expect(container.querySelector(".roster-grid-panel .count-pill")).toBeNull();
  });

  test("marks conflicting shift cards with a visible badge", () => {
    const conflictShifts = [
      ...shifts,
      {
        id: "shift-2",
        employeeId: "emp-1",
        role: "Supervisor",
        day: 0,
        startTime: "12:00",
        endTime: "18:00"
      }
    ];

    const { container } = renderGrid({
      shifts: conflictShifts,
      conflictingShiftIds: new Set(["shift-1", "shift-2"]),
      conflicts: [
        {
          type: "overlap",
          employeeId: "emp-1",
          day: 0,
          shiftIds: ["shift-1", "shift-2"],
          message: "Employee has overlapping shifts on the same day."
        },
        {
          type: "consecutive-days",
          employeeId: "emp-1",
          days: [0, 1, 2, 3, 4, 5],
          shiftIds: ["shift-1"],
          message: "Employee is scheduled for more than 5 consecutive days."
        }
      ]
    });

    const cashierShift = getButton(
      container,
      "Edit Cashier shift for Alex Chen on Mon"
    );
    const supervisorShift = getButton(
      container,
      "Edit Supervisor shift for Alex Chen on Mon"
    );

    expect(cashierShift.className).toContain("is-conflicting");
    expect(supervisorShift.className).toContain("is-conflicting");
    expect(container.textContent).toContain("Conflict");
    expect(container.textContent).not.toContain("2 conflicts");
  });

  test("creates a shift from an empty employee/day cell", () => {
    const onAddShift = vi.fn();
    const { container } = renderGrid({ onAddShift });

    click(getButton(container, "Add shift for Blair Wong on Tue"));
    selectValue(getSelect(container, "Shift role"), "Cook");
    setInputValue(getInput(container, "Start time"), "10:00");
    setInputValue(getInput(container, "End time"), "15:30");
    click(getButton(container, "Add shift"));

    expect(onAddShift).toHaveBeenCalledWith({
      employeeId: "emp-2",
      role: "Cook",
      day: 1,
      startTime: "10:00",
      endTime: "15:30"
    });
  });

  test("submits the current form time values", () => {
    const onAddShift = vi.fn();
    const { container } = renderGrid({ onAddShift });

    click(getButton(container, "Add shift for Blair Wong on Thu"));
    setInputDomValue(getInput(container, "Start time"), "12:15");
    setInputDomValue(getInput(container, "End time"), "18:45");
    click(getButton(container, "Add shift"));

    expect(onAddShift).toHaveBeenCalledWith({
      employeeId: "emp-2",
      role: "Cook",
      day: 3,
      startTime: "12:15",
      endTime: "18:45"
    });
  });

  test("edits an existing shift", () => {
    const onEditShift = vi.fn();
    const { container } = renderGrid({ onEditShift });

    click(getButton(container, "Edit Cashier shift for Alex Chen on Mon"));
    selectValue(getSelect(container, "Shift role"), "Supervisor");
    setInputValue(getInput(container, "Start time"), "11:00");
    setInputValue(getInput(container, "End time"), "18:00");
    click(getButton(container, "Save shift"));

    expect(onEditShift).toHaveBeenCalledWith({
      id: "shift-1",
      employeeId: "emp-1",
      role: "Supervisor",
      day: 0,
      startTime: "11:00",
      endTime: "18:00"
    });
  });

  test("removes an existing shift", () => {
    const onRemoveShift = vi.fn();
    const { container } = renderGrid({ onRemoveShift });

    click(getButton(container, "Edit Cashier shift for Alex Chen on Mon"));
    click(getButton(container, "Remove shift"));

    expect(onRemoveShift).toHaveBeenCalledWith("shift-1");
  });

  test("keeps the editor open and shows validation for invalid shift times", () => {
    const onAddShift = vi.fn();
    const { container } = renderGrid({ onAddShift });

    click(getButton(container, "Add shift for Blair Wong on Tue"));
    selectValue(getSelect(container, "Shift role"), "Cook");
    setInputValue(getInput(container, "Start time"), "17:00");
    setInputValue(getInput(container, "End time"), "09:00");
    click(getButton(container, "Add shift"));

    expect(onAddShift).not.toHaveBeenCalled();
    expect(container.textContent).toContain("End time must be after start time.");
    expect(container.textContent).toContain("Add shift");
  });

  test("keeps the editor open and shows validation for overlapping shifts", () => {
    const onAddShift = vi.fn();
    const { container } = renderGrid({ onAddShift });

    click(getButton(container, "Add shift for Alex Chen on Mon"));
    selectValue(getSelect(container, "Shift role"), "Supervisor");
    setInputValue(getInput(container, "Start time"), "12:00");
    setInputValue(getInput(container, "End time"), "18:00");
    click(getButton(container, "Add shift"));

    expect(onAddShift).not.toHaveBeenCalled();
    expect(container.textContent).toContain(
      "Employee already has an overlapping shift."
    );
    expect(container.textContent).toContain("Add shift");
  });

  test("shift cards are draggable", () => {
    const { container } = renderGrid();

    const card = getButton(container, "Edit Cashier shift for Alex Chen on Mon");
    expect(card.getAttribute("draggable")).toBe("true");
  });

  test("drop on a valid cell calls onMoveShift", () => {
    const onMoveShift = vi.fn();
    const { container } = renderGrid({ onMoveShift });
    const card = getButton(container, "Edit Cashier shift for Alex Chen on Mon");

    const dataTransfer = createDataTransfer("shift-1");
    dispatchDragStart(card, dataTransfer);

    const targetCell = getShiftCell(container, "emp-2", 1);
    dispatchDrop(targetCell, dataTransfer);

    expect(onMoveShift).toHaveBeenCalledWith("shift-1", "emp-2", 1);
  });

  test("drop on the same cell does not call onMoveShift", () => {
    const onMoveShift = vi.fn();
    const { container } = renderGrid({ onMoveShift });
    const card = getButton(container, "Edit Cashier shift for Alex Chen on Mon");

    const dataTransfer = createDataTransfer("shift-1");
    dispatchDragStart(card, dataTransfer);

    const sourceCell = getShiftCell(container, "emp-1", 0);
    dispatchDrop(sourceCell, dataTransfer);

    expect(onMoveShift).toHaveBeenCalledWith("shift-1", "emp-1", 0);
  });

  test("dragged card gets is-dragging class", () => {
    const { container } = renderGrid();
    const card = getButton(container, "Edit Cashier shift for Alex Chen on Mon");

    const dataTransfer = createDataTransfer("shift-1");
    dispatchDragStart(card, dataTransfer);

    expect(card.className).toContain("is-dragging");
  });
});

function renderGrid(props = {}) {
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);

  act(() => {
    root.render(
      <RosterGrid
        employees={employees}
        shifts={shifts}
        lastErrors={{}}
        onAddShift={vi.fn()}
        onEditShift={vi.fn()}
        onRemoveShift={vi.fn()}
        {...props}
      />
    );
  });

  roots.push({ root, container });
  return { container };
}

function getButton(container, label) {
  const button = [...container.querySelectorAll("button")].find(
    (item) =>
      item.textContent.trim() === label || item.getAttribute("aria-label") === label
  );

  if (!button) {
    throw new Error(`Button not found: ${label}`);
  }

  return button;
}

function getInput(container, labelText) {
  const input = [...container.querySelectorAll("input")].find(
    (item) => item.getAttribute("aria-label") === labelText
  );

  if (!input) {
    throw new Error(`Input not found: ${labelText}`);
  }

  return input;
}

function getSelect(container, labelText) {
  const select = [...container.querySelectorAll("select")].find(
    (item) => item.getAttribute("aria-label") === labelText
  );

  if (!select) {
    throw new Error(`Select not found: ${labelText}`);
  }

  return select;
}

function setInputValue(input, value) {
  const valueSetter = Object.getOwnPropertyDescriptor(
    HTMLInputElement.prototype,
    "value"
  ).set;

  act(() => {
    valueSetter.call(input, value);
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
}

function setInputDomValue(input, value) {
  const valueSetter = Object.getOwnPropertyDescriptor(
    HTMLInputElement.prototype,
    "value"
  ).set;

  act(() => {
    valueSetter.call(input, value);
  });
}

function selectValue(select, value) {
  const valueSetter = Object.getOwnPropertyDescriptor(
    HTMLSelectElement.prototype,
    "value"
  ).set;

  act(() => {
    valueSetter.call(select, value);
    select.dispatchEvent(new Event("change", { bubbles: true }));
  });
}

function click(element) {
  act(() => {
    element.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  });
}

function createDataTransfer(data) {
  const store = new Map();
  return {
    effectAllowed: "",
    dropEffect: "",
    setData: (type, value) => store.set(type, value),
    getData: (type) => store.get(type) ?? ""
  };
}

function dispatchDragStart(element, dataTransfer) {
  act(() => {
    element.dispatchEvent(
      new DragEvent("dragstart", { bubbles: true, dataTransfer })
    );
  });
}

function dispatchDrop(element, dataTransfer) {
  act(() => {
    element.dispatchEvent(
      new DragEvent("drop", { bubbles: true, dataTransfer })
    );
  });
}

function getShiftCell(container, employeeId, dayIndex) {
  const employee = employees.find((e) => e.id === employeeId);
  const rows = container.querySelectorAll('[role="row"]');

  for (const row of rows) {
    const header = row.querySelector('[role="rowheader"]');
    if (!header) continue;
    if (!header.textContent.includes(employee.name)) continue;

    const cells = row.querySelectorAll('[role="cell"]');
    const cell = cells[dayIndex];
    if (cell) return cell;
  }

  throw new Error(`Shift cell not found: ${employeeId} day ${dayIndex}`);
}
