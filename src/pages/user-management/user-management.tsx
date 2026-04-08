import React, { useCallback, useEffect, useMemo, useState } from "react";
import AdminModulePage from "../../components/asset-admin/admin-module-page";
import useAxiosPrivate from "../../services/hooks/useaxios-private";
import * as XLSX from "xlsx";
import downloadIcon from "../../assets/icons/download.png";

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

interface BulkUploadRow {
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
  const [deleteTarget, setDeleteTarget] = useState<EmployeeRecord | null>(null);
  const [formData, setFormData] = useState<EmployeeFormState>(emptyFormState);
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
  const [isBulkUploading, setIsBulkUploading] = useState(false);
  const [bulkUploadError, setBulkUploadError] = useState("");
  const [bulkUploadSummary, setBulkUploadSummary] = useState("");
  const [selectedBulkFileName, setSelectedBulkFileName] = useState("");

  const roleOptions = ["IT Admin", "Support Engineer", "Network Engineer", "QA Lead", "Asset Custodian"];
  const statusOptions = ["Active", "On Leave", "Inactive"];

  const normalizeHeaderKey = (value: string) => value.replace(/[^a-z0-9]/gi, "").toLowerCase();

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

  const handleDownloadReport = useCallback(() => {
    const exportRows = rows.map((row) => ({
      employeeId: row.employeeId,
      name: row.name,
      email: row.email,
      phone: row.phone,
      role: row.role,
      team: row.team,
      status: row.status,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Employees");
    XLSX.writeFile(workbook, "employee-report.xlsx");
  }, [rows]);

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

  const closeBulkUploadModal = useCallback(() => {
    if (isBulkUploading) {
      return;
    }

    setIsBulkUploadOpen(false);
    setBulkUploadError("");
    setBulkUploadSummary("");
    setSelectedBulkFileName("");
  }, [isBulkUploading]);

  const closeDeleteModal = useCallback(() => {
    if (isDeletingId !== null) {
      return;
    }

    setDeleteTarget(null);
  }, [isDeletingId]);

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

  useEffect(() => {
    if (!deleteTarget) {
      return undefined;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeDeleteModal();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [closeDeleteModal, deleteTarget]);

  useEffect(() => {
    if (!isBulkUploadOpen) {
      return undefined;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeBulkUploadModal();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [closeBulkUploadModal, isBulkUploadOpen]);

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

  const openDeleteModal = (row: EmployeeRecord) => {
    if (isSaving || isFetchingEmployee || !row.id) {
      return;
    }

    setDeleteTarget(row);
  };

  const handleDeleteUser = async () => {
    if (isSaving || isFetchingEmployee || !deleteTarget?.id) {
      return;
    }

    setIsDeletingId(deleteTarget.id);

    try {
      // axios baseURL already includes `/v1`, so this hits `DELETE /v1/employees/:id`.
      await axiosPrivate.delete(`/employees/${deleteTarget.id}`);
      await fetchEmployees();
      closeDeleteModal();
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

  const openBulkUploadModal = () => {
    if (isSaving || isFetchingEmployee || isDeletingId !== null) {
      return;
    }

    setBulkUploadError("");
    setBulkUploadSummary("");
    setSelectedBulkFileName("");
    setIsBulkUploadOpen(true);
  };

  const downloadBulkUploadTemplate = () => {
    const sampleRows = [
      {
        employeeId: "EMP001",
        name: "Aarav Sharma",
        email: "aarav.sharma@example.com",
        phone: "9876543210",
        role: "IT Admin",
        team: "Infrastructure",
        status: "Active",
      },
      {
        employeeId: "EMP002",
        name: "Meera Nair",
        email: "meera.nair@example.com",
        phone: "",
        role: "Support Engineer",
        team: "Operations",
        status: "Active",
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(sampleRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Employees");
    XLSX.writeFile(workbook, "employees-bulk-upload-template.xlsx");
  };

  const parseBulkUploadRows = (rawRows: any[]): BulkUploadRow[] => {
    return rawRows
      .map((row) => {
        const normalizedRow = Object.entries(row ?? {}).reduce<Record<string, string>>((accumulator, [key, value]) => {
          accumulator[normalizeHeaderKey(key)] = `${value ?? ""}`.trim();
          return accumulator;
        }, {});

        return {
          employeeId: normalizedRow.employeeid ?? "",
          name: normalizedRow.name ?? "",
          email: normalizedRow.email ?? "",
          phone: (normalizedRow.phone ?? normalizedRow.phonenumber ?? "").replace(/\D/g, ""),
          role: normalizedRow.role ?? "",
          team: normalizedRow.team ?? "",
          status: normalizedRow.status ? normalizeStatus(normalizedRow.status) : "Active",
        };
      })
      .filter((row) => Object.values(row).some((value) => value !== ""));
  };

  const validateBulkUploadRows = (parsedRows: BulkUploadRow[]) => {
    const errors: string[] = [];
    const seenEmployeeIds = new Set<string>();
    const seenEmails = new Set<string>();

    parsedRows.forEach((row, index) => {
      const rowNumber = index + 2;
      const normalizedEmployeeId = row.employeeId.toLowerCase();
      const normalizedEmail = row.email.toLowerCase();
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!row.employeeId || !row.name || !row.email || !row.role || !row.team) {
        errors.push(`Row ${rowNumber}: employeeId, name, email, role, and team are required.`);
      }

      if (row.email && !emailPattern.test(row.email)) {
        errors.push(`Row ${rowNumber}: email format is invalid.`);
      }

      if (row.phone && row.phone.length !== 10) {
        errors.push(`Row ${rowNumber}: phone must be exactly 10 digits when provided.`);
      }

      if (seenEmployeeIds.has(normalizedEmployeeId)) {
        errors.push(`Row ${rowNumber}: duplicate employeeId found in file.`);
      }

      if (seenEmails.has(normalizedEmail)) {
        errors.push(`Row ${rowNumber}: duplicate email found in file.`);
      }

      if (normalizedEmployeeId) {
        seenEmployeeIds.add(normalizedEmployeeId);
      }

      if (normalizedEmail) {
        seenEmails.add(normalizedEmail);
      }
    });

    return errors;
  };

  const handleBulkUploadFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setSelectedBulkFileName(file.name);
    setBulkUploadError("");
    setBulkUploadSummary("");
    setIsBulkUploading(true);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const rawRows = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
      const parsedRows = parseBulkUploadRows(rawRows);

      if (parsedRows.length === 0) {
        setBulkUploadError("The selected file does not contain any employee rows.");
        return;
      }

      const validationErrors = validateBulkUploadRows(parsedRows);
      if (validationErrors.length > 0) {
        setBulkUploadError(validationErrors.slice(0, 6).join(" "));
        return;
      }

      const existingEmployeeIds = new Set(rows.map((row) => row.employeeId.trim().toLowerCase()).filter(Boolean));
      const existingEmails = new Set(rows.map((row) => row.email.trim().toLowerCase()).filter(Boolean));
      const rowsToUpload = parsedRows.filter((row) => {
        const employeeId = row.employeeId.toLowerCase();
        const email = row.email.toLowerCase();
        return !existingEmployeeIds.has(employeeId) && !existingEmails.has(email);
      });

      if (rowsToUpload.length === 0) {
        setBulkUploadError("All rows in this file already exist in the current employee list.");
        return;
      }

      const uploadResults = await Promise.allSettled(
        rowsToUpload.map((row) =>
          axiosPrivate.post("/employees", {
            employeeId: row.employeeId,
            name: row.name,
            email: row.email,
            phoneNumber: row.phone,
            role: row.role,
            team: row.team,
            status: row.status.toLowerCase(),
          })
        )
      );

      const successCount = uploadResults.filter((result) => result.status === "fulfilled").length;
      const failedResults = uploadResults.filter((result) => result.status === "rejected") as PromiseRejectedResult[];

      if (successCount > 0) {
        await fetchEmployees();
      }

      if (failedResults.length > 0) {
        const firstFailureMessage =
          failedResults[0]?.reason?.response?.data?.message ||
          failedResults[0]?.reason?.message ||
          "One or more rows failed to upload.";
        setBulkUploadError(firstFailureMessage);
      }

      setBulkUploadSummary(`${successCount} employee(s) uploaded${failedResults.length > 0 ? `, ${failedResults.length} failed` : ""}.`);
    } catch (error: any) {
      setBulkUploadError(error?.message || "Failed to process the selected bulk upload file.");
    } finally {
      setIsBulkUploading(false);
      event.target.value = "";
    }
  };

  const isSubmitDisabled =
    formData.employeeId.trim() === "" ||
    formData.name.trim() === "" ||
    formData.email.trim() === "" ||
    formData.role.trim() === "" ||
    formData.team.trim() === "" ||
    formData.status.trim() === "";

  return (
    <AdminModulePage
      title="Employees Module"
      subtitle="Maintain employee records used by the admin to assign and track assets against the right person or team."
      actionLabel="Add Employee"
      onActionClick={openAddModal}
      headerActions={
        <>
          <button type="button" className="asset-admin-secondary-btn" onClick={handleDownloadReport} aria-label="Download employee report" title="Download Report">
            <img src={downloadIcon} alt="Download" style={{ width: "16px", height: "16px" }} />
          </button>
          {/* <button type="button" className="asset-admin-secondary-btn" onClick={openBulkUploadModal}>
            Bulk Upload
          </button> */}
        </>
      }
      onEditRow={(row) => openEditModal(row as EmployeeRecord)}
      renderRowActions={(row) => (
        <button
          type="button"
          className="asset-admin-danger-btn"
          onClick={() => openDeleteModal(row as EmployeeRecord)}
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
                  <span>Phone (Optional)</span>
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
      {isBulkUploadOpen && (
        <div className="asset-admin-modal-backdrop" onClick={closeBulkUploadModal}>
          <div
            className="asset-admin-modal"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="bulk-employee-upload-title"
          >
            <div className="asset-admin-modal-header">
              <div>
                <p className="asset-admin-modal-kicker">Employees Import</p>
                <h3 id="bulk-employee-upload-title">Bulk Upload Employees</h3>
              </div>
              <button type="button" className="asset-admin-modal-close" onClick={closeBulkUploadModal} aria-label="Close bulk employee upload popup">
                x
              </button>
            </div>

            <div className="asset-admin-form">
              <div className="asset-admin-form-grid">
                <div className="asset-admin-field asset-admin-field-full">
                  <span>Template</span>
                  <button type="button" className="asset-admin-secondary-btn" onClick={downloadBulkUploadTemplate}>
                    Download Sample File
                  </button>
                </div>

                <label className="asset-admin-field asset-admin-field-full">
                  <span>Upload File</span>
                  <input
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleBulkUploadFile}
                    disabled={isBulkUploading}
                  />
                </label>

                <div className="asset-admin-field asset-admin-field-full">
                  <span>Expected Columns</span>
                  <strong>employeeId, name, email, phone, role, team, status</strong>
                </div>

                <div className="asset-admin-field asset-admin-field-full">
                  <span>Rules</span>
                  <strong>Phone is optional. Status defaults to Active when left blank.</strong>
                </div>

                {selectedBulkFileName && (
                  <div className="asset-admin-field asset-admin-field-full">
                    <span>Selected File</span>
                    <strong>{selectedBulkFileName}</strong>
                  </div>
                )}
              </div>

              {bulkUploadError && <p className="asset-admin-form-error">{bulkUploadError}</p>}
              {bulkUploadSummary && !bulkUploadError && <p className="asset-admin-form-success">{bulkUploadSummary}</p>}

              <div className="asset-admin-form-actions">
                <button type="button" className="asset-admin-secondary-btn" onClick={closeBulkUploadModal} disabled={isBulkUploading}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {deleteTarget && (
        <div className="asset-admin-modal-backdrop" onClick={closeDeleteModal}>
          <div
            className="asset-admin-modal"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="employee-delete-modal-title"
          >
            <div className="asset-admin-modal-header">
              <div>
                <p className="asset-admin-modal-kicker">Confirm Delete</p>
                <h3 id="employee-delete-modal-title">Delete Employee</h3>
              </div>
              <button type="button" className="asset-admin-modal-close" onClick={closeDeleteModal} aria-label="Close delete employee popup">
                x
              </button>
            </div>

            <div className="asset-admin-form">
              <p>
                Delete <strong>{deleteTarget.name || deleteTarget.employeeId || "this employee"}</strong>? This action cannot be undone.
              </p>

              <div className="asset-admin-form-actions">
                <button type="button" className="asset-admin-secondary-btn" onClick={closeDeleteModal} disabled={isDeletingId !== null}>
                  Cancel
                </button>
                <button type="button" className="asset-admin-danger-btn" onClick={handleDeleteUser} disabled={isDeletingId !== null}>
                  {isDeletingId !== null ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminModulePage>
  );
}
