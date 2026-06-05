import { useState } from "react";

export const ROLE_OPTIONS = [
  "Cashier",
  "Supervisor",
  "Cook",
  "Barista",
  "Cleaner"
];

export default function EmployeePanel({
  employees,
  lastErrors = {},
  onAddEmployee,
  onEditEmployee,
  onRemoveEmployee
}) {
  const [newName, setNewName] = useState("");
  const [newRoles, setNewRoles] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editRoles, setEditRoles] = useState([]);
  const [pendingRemoveId, setPendingRemoveId] = useState(null);

  function startEdit(employee) {
    setEditingId(employee.id);
    setEditName(employee.name);
    setEditRoles(employee.roles);
    setPendingRemoveId(null);
  }

  function submitNewEmployee(event) {
    event.preventDefault();
    onAddEmployee({ name: newName, roles: newRoles });

    if (newName.trim() && newRoles.length > 0) {
      setNewName("");
      setNewRoles([]);
    }
  }

  function saveEmployee(employee) {
    onEditEmployee({
      id: employee.id,
      name: editName,
      roles: editRoles
    });
    setEditingId(null);
  }

  return (
    <section className="panel employee-panel" aria-labelledby="employees-title">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Team</p>
          <h2 id="employees-title">Employees</h2>
        </div>
        <span className="count-pill">{employees.length}</span>
      </div>

      <form className="employee-form" onSubmit={submitNewEmployee}>
        <label className="field-label" htmlFor="employee-name">
          Name
        </label>
        <input
          id="employee-name"
          aria-label="Employee name"
          className="text-input"
          value={newName}
          onChange={(event) => setNewName(event.target.value)}
          placeholder="New employee"
        />

        <fieldset className="role-fieldset">
          <legend>Roles</legend>
          <div className="role-options">
            {ROLE_OPTIONS.map((role) => (
              <label className="role-option" key={role}>
                <input
                  aria-label={role}
                  type="checkbox"
                  checked={newRoles.includes(role)}
                  onChange={() => setNewRoles(toggleValue(newRoles, role))}
                />
                <span>{role}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <ErrorList errors={employeeFormErrors(lastErrors)} />

        <button className="primary-button" type="submit">
          Add employee
        </button>
      </form>

      <div className="employee-list" aria-label="Employee list">
        {employees.map((employee) => {
          const isEditing = editingId === employee.id;
          const isConfirmingRemove = pendingRemoveId === employee.id;

          return (
            <article className="employee-row" key={employee.id}>
              {isEditing ? (
                <div className="edit-employee">
                  <input
                    aria-label={`Edit name for ${employee.name}`}
                    className="text-input"
                    value={editName}
                    onChange={(event) => setEditName(event.target.value)}
                  />
                  <div className="role-options compact">
                    {ROLE_OPTIONS.map((role) => (
                      <label className="role-option" key={role}>
                        <input
                          aria-label={`Edit ${role} for ${employee.name}`}
                          type="checkbox"
                          checked={editRoles.includes(role)}
                          onChange={() =>
                            setEditRoles(toggleValue(editRoles, role))
                          }
                        />
                        <span>{role}</span>
                      </label>
                    ))}
                  </div>
                  <div className="row-actions">
                    <button
                      className="primary-button small"
                      type="button"
                      onClick={() => saveEmployee(employee)}
                    >
                      Save {employee.name}
                    </button>
                    <button
                      className="secondary-button small"
                      type="button"
                      onClick={() => setEditingId(null)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="employee-info">
                    <h3>{employee.name}</h3>
                    <div className="role-tags">
                      {employee.roles.map((role) => (
                        <span className="role-tag" key={role}>
                          {role}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="row-actions">
                    <button
                      className="secondary-button small"
                      type="button"
                      onClick={() => startEdit(employee)}
                    >
                      Edit {employee.name}
                    </button>
                    {isConfirmingRemove ? (
                      <>
                        <button
                          className="danger-button small"
                          type="button"
                          onClick={() => onRemoveEmployee(employee.id)}
                        >
                          Confirm remove {employee.name}
                        </button>
                        <button
                          className="secondary-button small"
                          type="button"
                          onClick={() => setPendingRemoveId(null)}
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button
                        className="ghost-danger-button small"
                        type="button"
                        onClick={() => setPendingRemoveId(employee.id)}
                      >
                        Remove {employee.name}
                      </button>
                    )}
                  </div>
                </>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}

function ErrorList({ errors }) {
  const messages = Object.values(errors);

  if (messages.length === 0) {
    return null;
  }

  return (
    <div className="error-list" role="alert">
      {messages.map((message) => (
        <p key={message}>{message}</p>
      ))}
    </div>
  );
}

function employeeFormErrors(errors) {
  return {
    ...(errors.name ? { name: errors.name } : {}),
    ...(errors.roles ? { roles: errors.roles } : {})
  };
}

function toggleValue(values, value) {
  if (values.includes(value)) {
    return values.filter((item) => item !== value);
  }

  return [...values, value];
}
