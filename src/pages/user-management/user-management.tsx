import React, { useCallback, useEffect, useMemo, useState } from "react";
import AdminModulePage from "../../components/asset-admin/admin-module-page";
import { UserRecord, users } from "../../data/asset-admin-data";

export default function UserManagementPage() {
  const [rows, setRows] = useState<UserRecord[]>(users);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [teamFilter, setTeamFilter] = useState("All Teams");
  const [validationError, setValidationError] = useState("");
  const [formData, setFormData] = useState<UserRecord>({
    employeeId: "",
    name: "",
    email: "",
    phone: "",
    role: "",
    team: "",
    status: "Active",
  });

  const roleOptions = ["IT Admin", "Support Engineer", "Network Engineer", "QA Lead", "Asset Custodian"];
  const statusOptions = ["Active", "On Leave", "Inactive"];
  const availableTeams = useMemo(() => Array.from(new Set(rows.map((item) => item.team))), [rows]);

  const filteredRows = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return rows.filter((row) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        [row.employeeId, row.name, row.email, row.phone, row.role, row.team]
          .join(" ")
          .toLowerCase()
          .includes(normalizedSearch);

      const matchesStatus = statusFilter === "All Status" || row.status === statusFilter;
      const matchesTeam = teamFilter === "All Teams" || row.team === teamFilter;

      return matchesSearch && matchesStatus && matchesTeam;
    });
  }, [rows, searchTerm, statusFilter, teamFilter]);

  const metrics = useMemo(
    () => [
      { label: "Users", value: rows.length, helper: "Current sample records" },
      { label: "IT Admins", value: rows.filter((item) => item.role === "IT Admin").length, helper: "Administrative access" },
      { label: "Active Status", value: rows.filter((item) => item.status === "Active").length, helper: "Currently active users" },
      { label: "Teams", value: new Set(rows.map((item) => item.team)).size, helper: "Represented business units" },
    ],
    [rows]
  );

  const resetForm = useCallback(() => {
    setFormData({
      employeeId: "",
      name: "",
      email: "",
      phone: "",
      role: "",
      team: "",
      status: "Active",
    });
    setValidationError("");
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingIndex(null);
    resetForm();
  }, [resetForm]);

  useEffect(() => {
    if (!isModalOpen) {
      return undefined;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeModal();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [closeModal, isModalOpen]);

  const openAddModal = () => {
    setEditingIndex(null);
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (row: UserRecord, index: number) => {
    setEditingIndex(index);
    setFormData(row);
    setValidationError("");
    setIsModalOpen(true);
  };

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedEmail = formData.email.trim().toLowerCase();
    const normalizedEmployeeId = formData.employeeId.trim().toLowerCase();
    const hasDuplicate = rows.some((row, index) => {
      if (editingIndex !== null && index === editingIndex) {
        return false;
      }

      return (
        row.email.trim().toLowerCase() === normalizedEmail ||
        row.employeeId.trim().toLowerCase() === normalizedEmployeeId
      );
    });

    if (hasDuplicate) {
      setValidationError("Employee ID and email must be unique.");
      return;
    }

    setRows((current) =>
      editingIndex === null
        ? [...current, formData]
        : current.map((row, index) => (index === editingIndex ? formData : row))
    );
    closeModal();
  };

  const handleDeleteUser = (indexToDelete: number) => {
    const userName = rows[indexToDelete]?.name ?? "this user";
    if (!window.confirm(`Delete ${userName} from the users module?`)) {
      return;
    }

    setRows((current) => current.filter((_, index) => index !== indexToDelete));
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("All Status");
    setTeamFilter("All Teams");
  };

  const isSubmitDisabled = Object.values(formData).some((value) => value.trim() === "");

  return (
    <AdminModulePage
      title="Employees Module"
      subtitle="Maintain employee records used by the admin to assign and track assets against the right person or team."
      actionLabel="Add Employee"
      onActionClick={openAddModal}
      onEditRow={openEditModal}
      renderRowActions={(_, index) => (
        <button
          type="button"
          className="asset-admin-danger-btn"
          onClick={() => handleDeleteUser(index)}
        >
          Delete
        </button>
      )}
      metrics={metrics}
      columns={[
        { key: "employeeId", label: "Employee ID" },
        { key: "name", label: "Name" },
        { key: "email", label: "Email" },
        { key: "phone", label: "Phone" },
        { key: "role", label: "Role" },
        { key: "team", label: "Team" },
        { key: "status", label: "Status" },
      ]}
      rows={filteredRows}
      totalRowCount={rows.length}
      tableControls={
        <>
          <label className="asset-admin-control asset-admin-control-search">
            <span>Search</span>
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search by name, email, employee ID, or role"
            />
          </label>
          <label className="asset-admin-control">
            <span>Status</span>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
              <option>All Status</option>
              {statusOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <label className="asset-admin-control">
            <span>Team</span>
            <select value={teamFilter} onChange={(event) => setTeamFilter(event.target.value)}>
              <option>All Teams</option>
              {availableTeams.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <button type="button" className="asset-admin-secondary-btn asset-admin-filter-reset" onClick={clearFilters}>
            Clear Filters
          </button>
        </>
      }
      emptyState={{
        title: "No employees match the current filters",
        description: "Clear the filters or add a new employee record to repopulate the module.",
      }}
    >
      {isModalOpen && (
        <div className="asset-admin-modal-backdrop" onClick={closeModal}>
          <div
            className="asset-admin-modal"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="user-admin-modal-title"
          >
            <div className="asset-admin-modal-header">
              <div>
                <p className="asset-admin-modal-kicker">{editingIndex === null ? "New Employee" : "Edit Employee"}</p>
                <h3 id="user-admin-modal-title">{editingIndex === null ? "Add Employee" : "Edit Employee"}</h3>
              </div>
              <button type="button" className="asset-admin-modal-close" onClick={closeModal} aria-label="Close add employee popup">
                x
              </button>
            </div>

            <form className="asset-admin-form" onSubmit={handleSubmit}>
              <div className="asset-admin-form-grid">
                <label className="asset-admin-field">
                  <span>Employee ID</span>
                  <input
                    name="employeeId"
                    type="text"
                    value={formData.employeeId}
                    onChange={handleInputChange}
                    placeholder="Enter employee ID"
                  />
                </label>

                <label className="asset-admin-field">
                  <span>Name</span>
                  <input
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter full name"
                  />
                </label>

                <label className="asset-admin-field asset-admin-field-full">
                  <span>Email</span>
                  <input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter email address"
                  />
                </label>

                <label className="asset-admin-field">
                  <span>Phone</span>
                  <input
                    name="phone"
                    type="text"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Enter employee contact number"
                  />
                </label>

                <label className="asset-admin-field">
                  <span>Role</span>
                  <input
                    name="role"
                    type="text"
                    list="user-role-options"
                    value={formData.role}
                    onChange={handleInputChange}
                    placeholder="Enter employee designation"
                  />
                  <datalist id="user-role-options">
                    {roleOptions.map((option) => (
                      <option key={option} value={option} />
                    ))}
                  </datalist>
                </label>

                <label className="asset-admin-field">
                  <span>Team</span>
                  <input
                    name="team"
                    type="text"
                    list="user-team-options"
                    value={formData.team}
                    onChange={handleInputChange}
                    placeholder="Enter or select team"
                  />
                  <datalist id="user-team-options">
                    {availableTeams.map((option) => (
                      <option key={option} value={option} />
                    ))}
                  </datalist>
                </label>

                <label className="asset-admin-field asset-admin-field-full">
                  <span>Status</span>
                  <select name="status" value={formData.status} onChange={handleInputChange}>
                    {statusOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              {validationError && <p className="asset-admin-form-error">{validationError}</p>}

              <div className="asset-admin-form-actions">
                <button type="button" className="asset-admin-secondary-btn" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="asset-admin-primary-btn" disabled={isSubmitDisabled}>
                  {editingIndex === null ? "Save Employee" : "Update Employee"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminModulePage>
  );
}
