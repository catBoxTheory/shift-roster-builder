import { useMemo, useReducer } from "react";
import {
  detectRosterConflicts,
  getConflictingShiftIds
} from "../utils/conflicts.js";
import { calculateWeeklyHoursByEmployee } from "../utils/summary.js";
import { calculateShiftHours } from "../utils/time.js";

export const sampleEmployees = [
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
    roles: ["Barista", "Cleaner"]
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

      return createRosterState({
        employees: state.employees,
        shifts: [
          ...state.shifts,
          {
            id: action.payload.id,
            ...validation.value
          }
        ]
      });
    }

    case "shift/edit": {
      const validation = validateShiftInput(action.payload, state);

      if (!validation.isValid) {
        return withErrors(state, validation.errors);
      }

      return createRosterState({
        employees: state.employees,
        shifts: state.shifts.map((shift) =>
          shift.id === action.payload.id
            ? { ...shift, ...validation.value }
            : shift
        )
      });
    }

    case "shift/remove":
      return createRosterState({
        employees: state.employees,
        shifts: state.shifts.filter((shift) => shift.id !== action.payload.id)
      });

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
    value: { name, roles },
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

function withErrors(state, errors) {
  return { ...state, lastErrors: errors };
}

function uniqueCleanValues(values) {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}
