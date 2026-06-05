import { describe, expect, test } from "vitest";
import {
  createRosterState,
  initialRosterState,
  rosterReducer,
  validateEmployeeInput,
  validateShiftInput
} from "./useRoster.js";

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
      value: { name: "Alex", roles: ["Cashier"], unavailableDays: [] },
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
      roles: ["Cleaner", "Cook"],
      unavailableDays: []
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
        roles: ["Supervisor"],
        unavailableDays: []
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

  test("rejects adding a shift that overlaps an existing shift", () => {
    const state = baseState();
    const blockedState = rosterReducer(state, {
      type: "shift/add",
      payload: {
        id: "shift-2",
        employeeId: "emp-1",
        role: "Cashier",
        day: 0,
        startTime: "12:00",
        endTime: "18:00"
      }
    });

    expect(blockedState.shifts).toEqual(state.shifts);
    expect(blockedState.conflicts).toEqual([]);
    expect(blockedState.lastErrors).toEqual({
      conflict: "Employee already has an overlapping shift."
    });
  });

  test("rejects editing a shift into an overlap", () => {
    const state = createRosterState({
      employees: baseState().employees,
      shifts: [
        ...baseState().shifts,
        {
          id: "shift-2",
          employeeId: "emp-1",
          role: "Supervisor",
          day: 1,
          startTime: "12:00",
          endTime: "18:00"
        }
      ]
    });

    const blockedState = rosterReducer(state, {
      type: "shift/edit",
      payload: {
        id: "shift-2",
        employeeId: "emp-1",
        role: "Supervisor",
        day: 0,
        startTime: "12:00",
        endTime: "18:00"
      }
    });

    expect(blockedState.shifts).toEqual(state.shifts);
    expect(blockedState.lastErrors).toEqual({
      conflict: "Employee already has an overlapping shift."
    });
  });

  test("rejects adding a shift that would exceed 5 consecutive days", () => {
    const state = createRosterState({
      employees: [
        {
          id: "emp-1",
          name: "Alex",
          roles: ["Cashier"]
        }
      ],
      shifts: [0, 1, 2, 3, 4].map((day) => ({
        id: `shift-${day}`,
        employeeId: "emp-1",
        role: "Cashier",
        day,
        startTime: "09:00",
        endTime: "17:00"
      }))
    });

    const blockedState = rosterReducer(state, {
      type: "shift/add",
      payload: {
        id: "shift-5",
        employeeId: "emp-1",
        role: "Cashier",
        day: 5,
        startTime: "09:00",
        endTime: "17:00"
      }
    });

    expect(blockedState.shifts).toEqual(state.shifts);
    expect(blockedState.lastErrors).toEqual({
      conflict: "Employee cannot be scheduled for more than 5 consecutive days."
    });
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

  test("moves a shift to a different employee and day", () => {
    const state = createRosterState({
      employees: [
        {
          id: "emp-1",
          name: "Alex",
          roles: ["Cashier", "Supervisor"]
        },
        {
          id: "emp-2",
          name: "Blair",
          roles: ["Cook", "Cashier"]
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

    const movedState = rosterReducer(state, {
      type: "shift/move",
      payload: {
        shiftId: "shift-1",
        targetEmployeeId: "emp-2",
        targetDay: 3
      }
    });

    expect(movedState.shifts).toHaveLength(1);
    expect(movedState.shifts[0]).toMatchObject({
      id: "shift-1",
      employeeId: "emp-2",
      role: "Cashier",
      day: 3,
      startTime: "09:00",
      endTime: "17:00"
    });
    expect(movedState.lastErrors).toEqual({});
  });

  test("rejects moving a shift to an employee who lacks the role", () => {
    const state = createRosterState({
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

    const blockedState = rosterReducer(state, {
      type: "shift/move",
      payload: {
        shiftId: "shift-1",
        targetEmployeeId: "emp-2",
        targetDay: 1
      }
    });

    expect(blockedState.shifts).toEqual(state.shifts);
    expect(blockedState.lastErrors).toEqual({
      role: "Target employee does not have this shift's role."
    });
  });

  test("rejects moving a shift that would create an overlap", () => {
    const state = createRosterState({
      employees: [
        {
          id: "emp-1",
          name: "Alex",
          roles: ["Cashier"]
        },
        {
          id: "emp-2",
          name: "Blair",
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
          endTime: "17:00"
        },
        {
          id: "shift-2",
          employeeId: "emp-2",
          role: "Cashier",
          day: 2,
          startTime: "12:00",
          endTime: "18:00"
        }
      ]
    });

    const blockedState = rosterReducer(state, {
      type: "shift/move",
      payload: {
        shiftId: "shift-1",
        targetEmployeeId: "emp-2",
        targetDay: 2
      }
    });

    expect(blockedState.shifts).toEqual(state.shifts);
    expect(blockedState.lastErrors).toEqual({
      conflict: "Employee already has an overlapping shift."
    });
  });

  test("rejects moving a shift that would exceed 5 consecutive days", () => {
    const state = createRosterState({
      employees: [
        {
          id: "emp-1",
          name: "Alex",
          roles: ["Cashier"]
        },
        {
          id: "emp-2",
          name: "Blair",
          roles: ["Cashier"]
        }
      ],
      shifts: [
        {
          id: "shift-move",
          employeeId: "emp-1",
          role: "Cashier",
          day: 6,
          startTime: "09:00",
          endTime: "17:00"
        },
        ...[0, 1, 2, 3, 4].map((day) => ({
          id: `shift-b-${day}`,
          employeeId: "emp-2",
          role: "Cashier",
          day,
          startTime: "09:00",
          endTime: "17:00"
        }))
      ]
    });

    const blockedState = rosterReducer(state, {
      type: "shift/move",
      payload: {
        shiftId: "shift-move",
        targetEmployeeId: "emp-2",
        targetDay: 5
      }
    });

    expect(blockedState.shifts).toEqual(state.shifts);
    expect(blockedState.lastErrors).toEqual({
      conflict: "Employee cannot be scheduled for more than 5 consecutive days."
    });
  });

  test("rejects moving a shift to a nonexistent employee", () => {
    const state = baseState();

    const blockedState = rosterReducer(state, {
      type: "shift/move",
      payload: {
        shiftId: "shift-1",
        targetEmployeeId: "missing",
        targetDay: 1
      }
    });

    expect(blockedState.shifts).toEqual(state.shifts);
    expect(blockedState.lastErrors).toEqual({
      employeeId: "Target employee does not exist."
    });
  });

  test("rejects adding a shift on an unavailable day", () => {
    const state = createRosterState({
      employees: [
        {
          id: "emp-1",
          name: "Alex",
          roles: ["Cashier"],
          unavailableDays: [0]
        }
      ],
      shifts: []
    });

    const blockedState = rosterReducer(state, {
      type: "shift/add",
      payload: {
        id: "shift-1",
        employeeId: "emp-1",
        role: "Cashier",
        day: 0,
        startTime: "09:00",
        endTime: "17:00"
      }
    });

    expect(blockedState.shifts).toEqual([]);
    expect(blockedState.lastErrors).toEqual({
      availability: "Employee is not available on this day."
    });
  });

  test("rejects editing a shift to an unavailable day", () => {
    const state = createRosterState({
      employees: [
        {
          id: "emp-1",
          name: "Alex",
          roles: ["Cashier"],
          unavailableDays: [3]
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

    const blockedState = rosterReducer(state, {
      type: "shift/edit",
      payload: {
        id: "shift-1",
        employeeId: "emp-1",
        role: "Cashier",
        day: 3,
        startTime: "09:00",
        endTime: "17:00"
      }
    });

    expect(blockedState.shifts).toEqual(state.shifts);
    expect(blockedState.lastErrors).toEqual({
      availability: "Employee is not available on this day."
    });
  });

  test("rejects moving a shift to an unavailable day", () => {
    const state = createRosterState({
      employees: [
        {
          id: "emp-1",
          name: "Alex",
          roles: ["Cashier"]
        },
        {
          id: "emp-2",
          name: "Blair",
          roles: ["Cashier"],
          unavailableDays: [2]
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

    const blockedState = rosterReducer(state, {
      type: "shift/move",
      payload: {
        shiftId: "shift-1",
        targetEmployeeId: "emp-2",
        targetDay: 2
      }
    });

    expect(blockedState.shifts).toEqual(state.shifts);
    expect(blockedState.lastErrors).toEqual({
      availability: "Employee is not available on this day."
    });
  });

  test("allows shifts on available days when some days are unavailable", () => {
    const state = createRosterState({
      employees: [
        {
          id: "emp-1",
          name: "Alex",
          roles: ["Cashier"],
          unavailableDays: [0, 6]
        }
      ],
      shifts: []
    });

    const addedState = rosterReducer(state, {
      type: "shift/add",
      payload: {
        id: "shift-1",
        employeeId: "emp-1",
        role: "Cashier",
        day: 1,
        startTime: "09:00",
        endTime: "17:00"
      }
    });

    expect(addedState.shifts).toHaveLength(1);
    expect(addedState.lastErrors).toEqual({});
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
