import React, { useCallback, useEffect, useMemo, useState } from "react";
import AdminModulePage from "../../components/asset-admin/admin-module-page";
import useAxiosPrivate from "../../services/hooks/useaxios-private";

interface EmployeeRecord {
  id: number | null;
  employeeId: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  team: string;
  status: string;
}

interface EmployeeFormState {
  employeeId: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  team: string;
  status: string;
}

const emptyFormState: EmployeeFormState = {
  employeeId: "",
  name: "",
  email: "",
  phone: "",
  role: "",
  team: "",
  status: "Active",
};

export default function UserManagementPage() {
  const axiosPrivate = useAxiosPrivate();
  const [rows, setRows] = useState<EmployeeRecord[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployeeId, setEditingEmployeeId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [teamFilter, setTeamFilter] = useState("All Teams");
  const [validationError, setValidationError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingEmployee, setIsFetchingEmployee] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<EmployeeFormState>(emptyFormState);

  const roleOptions = ["IT Admin", "Support Engineer", "Network Engineer", "QA Lead", "Asset Custodian"];
  const statusOptions = ["Active", "On Leave", "Inactive"];

  const normalizeStatus = useCallback((status: string | undefined) => {
    const normalized = `${status ?? ""}`.trim().toLowerCase();

    switch (normalized) {
      case "active":
        return "Active";
      case "on leave":
      case "on_leave":
        return "On Leave";
      case "inactive":
        return "Inactive";
      default:
        return "Active";
    }
  }, []);

  const mapEmployeeRecord = useCallback(
    (employee: any): EmployeeRecord => ({
      id:
        typeof employee?.id === "number"
          ? employee.id
          : typeof employee?.employeeIdPk === "number"
            ? employee.employeeIdPk
            : null,
      employeeId: employee?.employeeId ?? "",
      name: employee?.name ?? "",
      email: employee?.email ?? "",
      phone: employee?.phoneNumber ?? employee?.phone ?? "",
      role: employee?.role ?? "",
      team: employee?.team ?? "",
      status: normalizeStatus(employee?.status),
    }),
    [normalizeStatus]
  );

  const availableTeams = useMemo(() => Array.from(new Set(rows.map((item) => item.team).filter(Boolean))), [rows]);

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
      { label: "Users", value: rows.length, helper: "Loaded from active employee records" },
      { label: "Teams", value: new Set(rows.map((item) => item.team).filter(Boolean)).size, helper: "Represented business units" },
      { label: "Active Status", value: rows.filter((item) => item.status === "Active").length, helper: "Currently active users" },
      { label: "Inactive Users", value: rows.filter((item) => item.status === "Inactive").length, helper: "Currently inactive users" },
    ],
    [rows]
  );

  const resetForm = useCallback(() => {
    setFormData(emptyFormState);
    setValidationError("");
  }, []);

  const fetchEmployees = useCallback(async () => {
    setIsLoading(true);

    try {
      // axios baseURL already includes `/v1`, so this hits `GET /v1/employees`.
      const response = await axiosPrivate.get("/employees");
      const payload = Array.isArray(response.data?.data)
        ? response.data.data
        : Array.isArray(response.data?.employees)
          ? response.data.employees
          : Array.isArray(response.data)
            ? response.data
            : [];

      setRows(payload.map(mapEmployeeRecord));
    } catch (error) {
      console.error("Failed to fetch employees:", error);
      setRows([]);
    } finally {
      setIsLoading(false);
    }
  }, [axiosPrivate, mapEmployeeRecord]);

  const closeModal = useCallback(() => {
    if (isSaving || isFetchingEmployee) {
      return;
    }

    setIsModalOpen(false);
    setEditingEmployeeId(null);
    resetForm();
  }, [isFetchingEmployee, isSaving, resetForm]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

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
    if (isSaving || isFetchingEmployee || isDeletingId !== null) {
      return;
    }

    setEditingEmployeeId(null);
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = async (row: EmployeeRecord) => {
    if (isSaving || isFetchingEmployee || isDeletingId !== null) {
      return;
    }

    if (!row.id) {
      setValidationError("Employee ID is missing. Refresh the page and try again.");
      return;
    }

    setIsFetchingEmployee(true);
    setValidationError("");

    try {
      // axios baseURL already includes `/v1`, so this hits `GET /v1/employees/:id`.
      const response = await axiosPrivate.get(`/employees/${row.id}`);
      const employee = response.data?.data ?? response.data?.employee ?? response.data;
      const mappedEmployee = mapEmployeeRecord(employee);

      setEditingEmployeeId(row.id);
      setFormData({
        employeeId: mappedEmployee.employeeId,
        name: mappedEmployee.name,
        email: mappedEmployee.email,
        phone: mappedEmployee.phone,
        role: mappedEmployee.role,
        team: mappedEmployee.team,
        status: mappedEmployee.status,
      });
      setIsModalOpen(true);
    } catch (error: any) {
      setValidationError(
        error?.response?.data?.message || "Failed to fetch employee details. Check the API and try again."
      );
    } finally {
      setIsFetchingEmployee(false);
    }
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

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedFormData: EmployeeFormState = {
      employeeId: formData.employeeId.trim(),
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      role: formData.role.trim(),
      team: formData.team.trim(),
      status: formData.status.trim(),
    };

    const normalizedEmail = trimmedFormData.email.toLowerCase();
    const normalizedEmployeeId = trimmedFormData.employeeId.toLowerCase();
    const hasDuplicate = rows.some((row) => {
      if (editingEmployeeId !== null && row.id === editingEmployeeId) {
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

    const payload = {
      employeeId: trimmedFormData.employeeId,
      name: trimmedFormData.name,
      email: trimmedFormData.email,
      phoneNumber: trimmedFormData.phone,
      role: trimmedFormData.role,
      team: trimmedFormData.team,
      status: trimmedFormData.status.toLowerCase(),
    };

    setIsSaving(true);
    setValidationError("");

    try {
      if (editingEmployeeId !== null) {
        // axios baseURL already includes `/v1`, so this hits `PUT /v1/employees/:id`.
        await axiosPrivate.put(`/employees/${editingEmployeeId}`, payload);
      } else {
        // axios baseURL already includes `/v1`, so this hits `POST /v1/employees`.
        await axiosPrivate.post("/employees", payload);
      }

      await fetchEmployees();
      setIsModalOpen(false);
      setEditingEmployeeId(null);
      resetForm();
    } catch (error: any) {
      setValidationError(
        error?.response?.data?.message ||
          `Failed to ${editingEmployeeId !== null ? "update" : "create"} employee. Check the API and try again.`
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteUser = async (row: EmployeeRecord) => {
    if (isSaving || isFetchingEmployee || !row.id) {
      return;
    }

    if (!window.confirm(`Delete ${row.name || "this user"} from the users module?`)) {
      return;
    }

    setIsDeletingId(row.id);

    try {
      // axios baseURL already includes `/v1`, so this hits `DELETE /v1/employees/:id`.
      await axiosPrivate.delete(`/employees/${row.id}`);
      await fetchEmployees();
    } catch (error: any) {
      setValidationError(
        error?.response?.data?.message || "Failed to delete employee. Check the API and try again."
      );
    } finally {
      setIsDeletingId(null);
    }
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
      onEditRow={(row) => openEditModal(row as EmployeeRecord)}
      renderRowActions={(row) => (
        <button
          type="button"
          className="asset-admin-danger-btn"
          onClick={() => handleDeleteUser(row as EmployeeRecord)}
          disabled={isDeletingId === (row as EmployeeRecord).id || !(row as EmployeeRecord).id}
          aria-disabled={isDeletingId === (row as EmployeeRecord).id || !(row as EmployeeRecord).id}
          title={!(row as EmployeeRecord).id ? "Cannot delete an employee without an ID" : "Delete employee"}
        >
          {isDeletingId === (row as EmployeeRecord).id ? "Deleting..." : "Delete"}
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
        title: isLoading ? "Loading employees" : "No employees match the current filters",
        description: isLoading
          ? "Fetching active employee records from the backend."
          : "Clear the filters or add a new employee record to repopulate the module.",
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
                <p className="asset-admin-modal-kicker">{editingEmployeeId === null ? "New Employee" : "Edit Employee"}</p>
                <h3 id="user-admin-modal-title">{editingEmployeeId === null ? "Add Employee" : "Edit Employee"}</h3>
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
                <button type="submit" className="asset-admin-primary-btn" disabled={isSubmitDisabled || isSaving || isFetchingEmployee}>
                  {isSaving ? "Saving..." : editingEmployeeId === null ? "Save Employee" : "Update Employee"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminModulePage>
  );
}
