import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, test, vi } from "vitest";
import EmployeePanel from "./EmployeePanel.jsx";

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

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

const roots = [];

afterEach(() => {
  while (roots.length > 0) {
    const { root, container } = roots.pop();
    act(() => root.unmount());
    container.remove();
  }
});

describe("EmployeePanel", () => {
  test("renders employees with their roles", () => {
    const { container } = renderPanel();

    expect(container.textContent).toContain("Alex Chen");
    expect(container.textContent).toContain("Cashier");
    expect(container.textContent).toContain("Supervisor");
    expect(container.textContent).toContain("Blair Wong");
    expect(container.textContent).toContain("Cook");
  });

  test("submits a new employee with selected roles", () => {
    const onAddEmployee = vi.fn();
    const { container } = renderPanel({ onAddEmployee });

    typeInto(getInput(container, "Employee name"), "Dana");
    click(getCheckbox(container, "Cleaner"));
    click(getButton(container, "Add employee"));

    expect(onAddEmployee).toHaveBeenCalledWith({
      name: "Dana",
      roles: ["Cleaner"]
    });
  });

  test("edits an employee name and role selection", () => {
    const onEditEmployee = vi.fn();
    const { container } = renderPanel({ onEditEmployee });

    click(getButton(container, "Edit Alex Chen"));
    typeInto(getInput(container, "Edit name for Alex Chen"), "Alex Wong");
    click(getCheckbox(container, "Edit Supervisor for Alex Chen"));
    click(getCheckbox(container, "Edit Cleaner for Alex Chen"));
    click(getButton(container, "Save Alex Chen"));

    expect(onEditEmployee).toHaveBeenCalledWith({
      id: "emp-1",
      name: "Alex Wong",
      roles: ["Cashier", "Cleaner"]
    });
  });

  test("confirms before removing an employee", () => {
    const onRemoveEmployee = vi.fn();
    const { container } = renderPanel({ onRemoveEmployee });

    click(getButton(container, "Remove Blair Wong"));

    expect(onRemoveEmployee).not.toHaveBeenCalled();

    click(getButton(container, "Confirm remove Blair Wong"));

    expect(onRemoveEmployee).toHaveBeenCalledWith("emp-2");
  });

  test("shows validation messages passed from roster state", () => {
    const { container } = renderPanel({
      lastErrors: {
        name: "Employee name must be unique.",
        roles: "Select at least one role."
      }
    });

    expect(container.textContent).toContain("Employee name must be unique.");
    expect(container.textContent).toContain("Select at least one role.");
  });

  test("does not show shift conflict errors in the employee form", () => {
    const { container } = renderPanel({
      lastErrors: {
        conflict: "Employee already has an overlapping shift."
      }
    });

    expect(container.textContent).not.toContain(
      "Employee already has an overlapping shift."
    );
  });
});

function renderPanel(props = {}) {
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);

  act(() => {
    root.render(
      <EmployeePanel
        employees={employees}
        lastErrors={{}}
        onAddEmployee={vi.fn()}
        onEditEmployee={vi.fn()}
        onRemoveEmployee={vi.fn()}
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

function getInput(container, labelText) {
  const input = [...container.querySelectorAll("input")].find(
    (item) => item.getAttribute("aria-label") === labelText
  );

  if (!input) {
    throw new Error(`Input not found: ${labelText}`);
  }

  return input;
}

function getCheckbox(container, labelText) {
  const checkbox = [...container.querySelectorAll('input[type="checkbox"]')].find(
    (item) => item.getAttribute("aria-label") === labelText
  );

  if (!checkbox) {
    throw new Error(`Checkbox not found: ${labelText}`);
  }

  return checkbox;
}

function typeInto(input, value) {
  const valueSetter = Object.getOwnPropertyDescriptor(
    HTMLInputElement.prototype,
    "value"
  ).set;

  act(() => {
    valueSetter.call(input, value);
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
}

function click(element) {
  act(() => {
    element.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  });
}
