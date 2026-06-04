import { describe, expect, test } from "vitest";
import {
  createRosterState,
  initialRosterState,
  rosterReducer,
  validateEmployeeInput,
  validateShiftInput
} from "../hooks/useRoster.js";

const baseState = () =>
  createRosterState({
    employees: [
      {
        id: "emp-1",
        name: "Alex",
        roles: ["Cashier", "Supervisor"]
      },
      {
        id: "emp-2",
        name: "Blair",
        roles: ["Cook"]
      }
    ],
    shifts: [
      {
        id: "shift-1",
        employeeId: "emp-1",
        role: "Cashier",
        day: 0,
        startTime: "09:00",
        endTime: "17:00"
      }
    ]
  });

describe("validateEmployeeInput", () => {
  test("requires a name, unique name, and at least one role", () => {
    expect(
      validateEmployeeInput({ name: "", roles: ["Cashier"] }, baseState())
    ).toEqual({
      isValid: false,
      errors: { name: "Employee name is required." }
    });

    expect(
      validateEmployeeInput({ name: " alex ", roles: ["Cashier"] }, baseState())
    ).toEqual({
      isValid: false,
      errors: { name: "Employee name must be unique." }
    });

    expect(validateEmployeeInput({ name: "Casey", roles: [] }, baseState()))
      .toEqual({
        isValid: false,
        errors: { roles: "Select at least one role." }
      });
  });

  test("allows an employee to keep their own name while editing", () => {
    expect(
      validateEmployeeInput(
        { name: " Alex ", roles: ["Cashier"] },
        baseState(),
        "emp-1"
      )
    ).toEqual({
      isValid: true,
      value: { name: "Alex", roles: ["Cashier"] },
      errors: {}
    });
  });
});

describe("validateShiftInput", () => {
  test("requires an existing employee and a role assigned to that employee", () => {
    expect(
      validateShiftInput(
        {
          employeeId: "missing",
          role: "Cashier",
          day: 0,
          startTime: "09:00",
          endTime: "17:00"
        },
        baseState()
      )
    ).toEqual({
      isValid: false,
      errors: { employeeId: "Select an existing employee." }
    });

    expect(
      validateShiftInput(
        {
          employeeId: "emp-2",
          role: "Cashier",
          day: 0,
          startTime: "09:00",
          endTime: "17:00"
        },
        baseState()
      )
    ).toEqual({
      isValid: false,
      errors: { role: "Role must belong to the selected employee." }
    });
  });

  test("requires valid day and same-day time range", () => {
    expect(
      validateShiftInput(
        {
          employeeId: "emp-1",
          role: "Cashier",
          day: 7,
          startTime: "09:00",
          endTime: "17:00"
        },
        baseState()
      )
    ).toEqual({
      isValid: false,
      errors: { day: "Select a valid day." }
    });

    expect(
      validateShiftInput(
        {
          employeeId: "emp-1",
          role: "Cashier",
          day: 0,
          startTime: "17:00",
          endTime: "09:00"
        },
        baseState()
      )
    ).toEqual({
      isValid: false,
      errors: { time: "End time must be after start time." }
    });
  });
});

describe("rosterReducer", () => {
  test("adds, edits, and removes employees", () => {
    const addedState = rosterReducer(baseState(), {
      type: "employee/add",
      payload: {
        id: "emp-3",
        name: " Casey ",
        roles: ["Cleaner", "Cleaner", "Cook"]
      }
    });

    expect(addedState.employees).toContainEqual({
      id: "emp-3",
      name: "Casey",
      roles: ["Cleaner", "Cook"]
    });

    const editedState = rosterReducer(addedState, {
      type: "employee/edit",
      payload: {
        id: "emp-3",
        name: "Casey Wong",
        roles: ["Supervisor"]
      }
    });

    expect(editedState.employees.find((employee) => employee.id === "emp-3"))
      .toEqual({
        id: "emp-3",
        name: "Casey Wong",
        roles: ["Supervisor"]
      });

    const removedState = rosterReducer(editedState, {
      type: "employee/remove",
      payload: { id: "emp-1" }
    });

    expect(
      removedState.employees.some((employee) => employee.id === "emp-1")
    ).toBe(false);
    expect(
      removedState.shifts.some((shift) => shift.employeeId === "emp-1")
    ).toBe(false);
  });

  test("adds, edits, and removes shifts", () => {
    const addedState = rosterReducer(baseState(), {
      type: "shift/add",
      payload: {
        id: "shift-2",
        employeeId: "emp-2",
        role: "Cook",
        day: 1,
        startTime: "10:00",
        endTime: "15:30"
      }
    });

    expect(addedState.shifts).toContainEqual({
      id: "shift-2",
      employeeId: "emp-2",
      role: "Cook",
      day: 1,
      startTime: "10:00",
      endTime: "15:30"
    });

    const editedState = rosterReducer(addedState, {
      type: "shift/edit",
      payload: {
        id: "shift-2",
        employeeId: "emp-2",
        role: "Cook",
        day: 2,
        startTime: "11:00",
        endTime: "16:00"
      }
    });

    expect(editedState.shifts.find((shift) => shift.id === "shift-2"))
      .toMatchObject({
        day: 2,
        startTime: "11:00",
        endTime: "16:00"
      });

    const removedState = rosterReducer(editedState, {
      type: "shift/remove",
      payload: { id: "shift-2" }
    });

    expect(removedState.shifts.some((shift) => shift.id === "shift-2")).toBe(
      false
    );
  });

  test("recalculates derived conflicts and weekly totals", () => {
    const state = createRosterState({
      employees: [
        {
          id: "emp-1",
          name: "Alex",
          roles: ["Cashier"]
        }
      ],
      shifts: [
        {
          id: "shift-1",
          employeeId: "emp-1",
          role: "Cashier",
          day: 0,
          startTime: "09:00",
          endTime: "13:00"
        },
        {
          id: "shift-2",
          employeeId: "emp-1",
          role: "Cashier",
          day: 0,
          startTime: "12:00",
          endTime: "17:00"
        }
      ]
    });

    expect(state.weeklyHoursByEmployee).toEqual({ "emp-1": 9 });
    expect(state.conflicts).toHaveLength(1);
    expect(state.conflictingShiftIds).toEqual(new Set(["shift-1", "shift-2"]));
  });

  test("resets to sample data", () => {
    const changedState = rosterReducer(baseState(), {
      type: "employee/add",
      payload: {
        id: "emp-extra",
        name: "Extra",
        roles: ["Cleaner"]
      }
    });

    const resetState = rosterReducer(changedState, { type: "roster/reset" });

    expect(resetState).toEqual(initialRosterState);
  });
});
