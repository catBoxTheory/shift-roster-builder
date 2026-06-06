import { useMemo, useReducer } from "react";
import {
  detectRosterConflicts,
  getConflictingShiftIds,
  shiftConflictMessage
} from "../utils/conflicts.js";
import { calculateWeeklyHoursByEmployee } from "../utils/summary.js";
import { calculateShiftHours } from "../utils/time.js";

export const sampleEmployees = [
  {
    id: "emp-alex",
    name: "Alex Chen",
    roles: ["Cashier", "Supervisor"],
    unavailableDays: []
  },
  {
    id: "emp-blair",
    name: "Blair Wong",
    roles: ["Cook"],
    unavailableDays: [6]
  },
  {
    id: "emp-casey",
    name: "Casey Lee",
    roles: ["Barista", "Cleaner"],
    unavailableDays: []
  }
];

export const sampleShifts = [
  {
    id: "shift-alex-mon",
    employeeId: "emp-alex",
    role: "Cashier",
    day: 0,
    startTime: "09:00",
    endTime: "17:00"
  },
  {
    id: "shift-blair-tue",
    employeeId: "emp-blair",
    role: "Cook",
    day: 1,
    startTime: "10:00",
    endTime: "16:00"
  },
  {
    id: "shift-casey-wed",
    employeeId: "emp-casey",
    role: "Barista",
    day: 2,
    startTime: "08:30",
    endTime: "13:30"
  }
];

export const initialRosterState = createRosterState({
  employees: sampleEmployees,
  shifts: sampleShifts
});

export function useRoster(initialState = initialRosterState) {
  const [state, dispatch] = useReducer(rosterReducer, initialState);

  const actions = useMemo(
    () => ({
      addEmployee: (payload) =>
        dispatch({
          type: "employee/add",
          payload: { id: crypto.randomUUID(), ...payload }
        }),
      editEmployee: (payload) =>
        dispatch({ type: "employee/edit", payload }),
      removeEmployee: (id) =>
        dispatch({ type: "employee/remove", payload: { id } }),
      addShift: (payload) =>
        dispatch({
          type: "shift/add",
          payload: { id: crypto.randomUUID(), ...payload }
        }),
      editShift: (payload) => dispatch({ type: "shift/edit", payload }),
      removeShift: (id) => dispatch({ type: "shift/remove", payload: { id } }),
      moveShift: (shiftId, targetEmployeeId, targetDay) =>
        dispatch({
          type: "shift/move",
          payload: { shiftId, targetEmployeeId, targetDay }
        }),
      resetRoster: () => dispatch({ type: "roster/reset" })
    }),
    []
  );

  return { ...state, ...actions };
}

export function rosterReducer(state, action) {
  switch (action.type) {
    case "employee/add": {
      const validation = validateEmployeeInput(action.payload, state);

      if (!validation.isValid) {
        return withErrors(state, validation.errors);
      }

      return createRosterState({
        employees: [
          ...state.employees,
          {
            id: action.payload.id,
            ...validation.value
          }
        ],
        shifts: state.shifts
      });
    }

    case "employee/edit": {
      const validation = validateEmployeeInput(
        action.payload,
        state,
        action.payload.id
      );

      if (!validation.isValid) {
        return withErrors(state, validation.errors);
      }

      return createRosterState({
        employees: state.employees.map((employee) =>
          employee.id === action.payload.id
            ? { ...employee, ...validation.value }
            : employee
        ),
        shifts: state.shifts
      });
    }

    case "employee/remove":
      return createRosterState({
        employees: state.employees.filter(
          (employee) => employee.id !== action.payload.id
        ),
        shifts: state.shifts.filter(
          (shift) => shift.employeeId !== action.payload.id
        )
      });

    case "shift/add": {
      const validation = validateShiftInput(action.payload, state);

      if (!validation.isValid) {
        return withErrors(state, validation.errors);
      }

      const availabilityError = validateAvailability(
        validation.value.employeeId,
        validation.value.day,
        state
      );

      if (availabilityError) {
        return withErrors(state, availabilityError);
      }

      const nextShift = {
        id: action.payload.id,
        ...validation.value
      };
      const nextShifts = [...state.shifts, nextShift];
      const conflictValidation = validateNoProposedShiftConflict(
        nextShifts,
        nextShift.id
      );

      if (!conflictValidation.isValid) {
        return withErrors(state, conflictValidation.errors);
      }

      return createRosterState({
        employees: state.employees,
        shifts: nextShifts
      });
    }

    case "shift/edit": {
      const validation = validateShiftInput(action.payload, state);

      if (!validation.isValid) {
        return withErrors(state, validation.errors);
      }

      const availabilityError = validateAvailability(
        validation.value.employeeId,
        validation.value.day,
        state
      );

      if (availabilityError) {
        return withErrors(state, availabilityError);
      }

      const nextShifts = state.shifts.map((shift) =>
        shift.id === action.payload.id
          ? { ...shift, ...validation.value }
          : shift
      );
      const conflictValidation = validateNoProposedShiftConflict(
        nextShifts,
        action.payload.id
      );

      if (!conflictValidation.isValid) {
        return withErrors(state, conflictValidation.errors);
      }

      return createRosterState({
        employees: state.employees,
        shifts: nextShifts
      });
    }

    case "shift/remove":
      return createRosterState({
        employees: state.employees,
        shifts: state.shifts.filter((shift) => shift.id !== action.payload.id)
      });

    case "shift/move": {
      const { shiftId, targetEmployeeId, targetDay } = action.payload;
      const existingShift = state.shifts.find((shift) => shift.id === shiftId);

      if (!existingShift) {
        return withErrors(state, { shiftId: "Shift does not exist." });
      }

      const targetEmployee = state.employees.find(
        (employee) => employee.id === targetEmployeeId
      );

      if (!targetEmployee) {
        return withErrors(state, {
          employeeId: "Target employee does not exist."
        });
      }

      if (!targetEmployee.roles.includes(existingShift.role)) {
        return withErrors(state, {
          role: "Target employee does not have this shift's role."
        });
      }

      const moveAvailabilityError = validateAvailability(
        targetEmployeeId,
        targetDay,
        state
      );

      if (moveAvailabilityError) {
        return withErrors(state, moveAvailabilityError);
      }

      const nextShift = {
        ...existingShift,
        employeeId: targetEmployeeId,
        day: targetDay
      };
      const nextShifts = state.shifts.map((shift) =>
        shift.id === shiftId ? nextShift : shift
      );
      const conflictValidation = validateNoProposedShiftConflict(
        nextShifts,
        shiftId
      );

      if (!conflictValidation.isValid) {
        return withErrors(state, conflictValidation.errors);
      }

      return createRosterState({
        employees: state.employees,
        shifts: nextShifts
      });
    }

    case "roster/reset":
      return initialRosterState;

    default:
      return state;
  }
}

export function createRosterState({ employees, shifts }) {
  const conflicts = detectRosterConflicts(shifts);

  return {
    employees,
    shifts,
    conflicts,
    conflictingShiftIds: getConflictingShiftIds(conflicts),
    weeklyHoursByEmployee: calculateWeeklyHoursByEmployee(shifts),
    lastErrors: {}
  };
}

export function validateEmployeeInput(input, state, existingEmployeeId = null) {
  const name = input.name?.trim() ?? "";
  const roles = uniqueCleanValues(input.roles ?? []);
  const unavailableDays = Array.isArray(input.unavailableDays)
    ? input.unavailableDays.filter(
        (day) => Number.isInteger(day) && day >= 0 && day <= 6
      )
    : [];
  const errors = {};

  if (!name) {
    errors.name = "Employee name is required.";
  } else if (
    state.employees.some(
      (employee) =>
        employee.id !== existingEmployeeId &&
        employee.name.toLowerCase() === name.toLowerCase()
    )
  ) {
    errors.name = "Employee name must be unique.";
  }

  if (roles.length === 0) {
    errors.roles = "Select at least one role.";
  }

  if (Object.keys(errors).length > 0) {
    return { isValid: false, errors };
  }

  return {
    isValid: true,
    value: { name, roles, unavailableDays },
    errors: {}
  };
}

export function validateShiftInput(input, state) {
  const employeeId = input.employeeId ?? "";
  const role = input.role?.trim() ?? "";
  const day = Number(input.day);
  const startTime = input.startTime ?? "";
  const endTime = input.endTime ?? "";
  const employee = state.employees.find((item) => item.id === employeeId);
  const errors = {};

  if (!employee) {
    errors.employeeId = "Select an existing employee.";
  } else if (!employee.roles.includes(role)) {
    errors.role = "Role must belong to the selected employee.";
  }

  if (!Number.isInteger(day) || day < 0 || day > 6) {
    errors.day = "Select a valid day.";
  }

  try {
    calculateShiftHours({ startTime, endTime });
  } catch {
    errors.time = "End time must be after start time.";
  }

  if (Object.keys(errors).length > 0) {
    return { isValid: false, errors };
  }

  return {
    isValid: true,
    value: { employeeId, role, day, startTime, endTime },
    errors: {}
  };
}

function validateAvailability(employeeId, day, state) {
  const employee = state.employees.find((item) => item.id === employeeId);

  if (employee && (employee.unavailableDays ?? []).includes(day)) {
    return { availability: "Employee is not available on this day." };
  }

  return null;
}

function validateNoProposedShiftConflict(shifts, shiftId) {
  const conflict = detectRosterConflicts(shifts).find((item) =>
    item.shiftIds.includes(shiftId)
  );

  if (!conflict) {
    return { isValid: true, errors: {} };
  }

  return {
    isValid: false,
    errors: { conflict: shiftConflictMessage(conflict.type) }
  };
}

function withErrors(state, errors) {
  return { ...state, lastErrors: errors };
}

function uniqueCleanValues(values) {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}
