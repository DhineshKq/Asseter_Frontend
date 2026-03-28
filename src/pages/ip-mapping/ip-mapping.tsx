import React, { useCallback, useEffect, useMemo, useState } from "react";
import useAxiosPrivate from "../../services/hooks/useaxios-private";
import "../../styles/pages/ip-mapping/ip-mapping.scss";

interface EmployeeOption {
  id: number;
  employeeId: string;
  name: string;
  team: string;
}

type AssignmentType = "" | "Employee" | "Device";

interface IpMappingRecord {
  id: number | null;
  ipAddress: string;
  subnet: string;
  assignmentType: AssignmentType;
  assignedTo: string;
  referenceId: string;
  context: string;
  sourceId: string;
}

const SUBNET_CONFIG = [
  { label: "172.25.10.x", base: "172.25.10", rangeLabel: "172.25.10.1 - 172.25.10.255" },
  { label: "172.26.10.x", base: "172.26.10", rangeLabel: "172.26.10.1 - 172.26.10.255" },
];

const ASSIGNMENT_TYPES: AssignmentType[] = ["Employee", "Device"];

const generateIpPool = (): IpMappingRecord[] =>
  SUBNET_CONFIG.flatMap((subnet) =>
    Array.from({ length: 255 }, (_, index) => ({
      id: null,
      ipAddress: `${subnet.base}.${index + 1}`,
      subnet: subnet.label,
      assignmentType: "" as AssignmentType,
      assignedTo: "",
      referenceId: "",
      context: "",
      sourceId: "",
    }))
  );

export default function IpMappingPage() {
  const axiosPrivate = useAxiosPrivate();
  const [rows, setRows] = useState<IpMappingRecord[]>(() => generateIpPool());
  const [employees, setEmployees] = useState<EmployeeOption[]>([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [subnetFilter, setSubnetFilter] = useState("All Subnets");
  const [assignmentFilter, setAssignmentFilter] = useState("All IPs");
  const [selectedIp, setSelectedIp] = useState<IpMappingRecord | null>(null);
  const [selectedAssignmentType, setSelectedAssignmentType] = useState<AssignmentType>("Employee");
  const [selectedSourceId, setSelectedSourceId] = useState("");
  const [deviceNameInput, setDeviceNameInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [actionError, setActionError] = useState("");

  const fetchAssignmentOptions = useCallback(async () => {
    setIsLoadingOptions(true);
    setLoadError("");

    try {
      const employeesResponse = await axiosPrivate.get("/employees");

      const employeePayload = Array.isArray(employeesResponse.data?.data)
        ? employeesResponse.data.data
        : Array.isArray(employeesResponse.data?.employees)
          ? employeesResponse.data.employees
          : Array.isArray(employeesResponse.data)
            ? employeesResponse.data
            : [];

      setEmployees(
        employeePayload.map((employee: any) => ({
          id:
            typeof employee?.id === "number"
              ? employee.id
              : typeof employee?.employeeIdPk === "number"
                ? employee.employeeIdPk
                : 0,
          employeeId: employee?.employeeId ?? "",
          name: employee?.name ?? "",
          team: employee?.team ?? "",
        }))
      );
    } catch (error: any) {
      setEmployees([]);
      setLoadError(error?.response?.data?.message || "Failed to load employees for IP assignment.");
      console.error("Failed to fetch IP mapping options:", error);
    } finally {
      setIsLoadingOptions(false);
    }
  }, [axiosPrivate]);

  useEffect(() => {
    fetchAssignmentOptions();
  }, [fetchAssignmentOptions]);

  const filteredRows = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return rows.filter((row) => {
      const matchesSubnet = subnetFilter === "All Subnets" || row.subnet === subnetFilter;
      const isAssigned = row.assignmentType !== "";
      const matchesAssignment =
        assignmentFilter === "All IPs" ||
        (assignmentFilter === "Assigned" && isAssigned) ||
        (assignmentFilter === "Unassigned" && !isAssigned);
      const matchesSearch =
        normalizedSearch.length === 0 ||
        [row.ipAddress, row.assignedTo, row.referenceId, row.assignmentType, row.context]
          .join(" ")
          .toLowerCase()
          .includes(normalizedSearch);

      return matchesSubnet && matchesAssignment && matchesSearch;
    });
  }, [assignmentFilter, rows, searchTerm, subnetFilter]);

  const subnetCards = useMemo(
    () =>
      SUBNET_CONFIG.map((subnet) => {
        const subnetRows = rows.filter((row) => row.subnet === subnet.label);
        const mappedCount = subnetRows.filter((row) => row.assignmentType !== "").length;

        return {
          ...subnet,
          mappedCount,
          freeCount: subnetRows.length - mappedCount,
        };
      }),
    [rows]
  );

  const recentAssignments = useMemo(
    () => rows.filter((row) => row.assignmentType !== "").slice(-5).reverse(),
    [rows]
  );

  const deviceAssignments = useMemo(
    () => rows.filter((row) => row.assignmentType === "Device").length,
    [rows]
  );

  const employeeAssignments = useMemo(
    () => rows.filter((row) => row.assignmentType === "Employee").length,
    [rows]
  );

  const openAssignModal = (row: IpMappingRecord) => {
    setSelectedIp(row);
    setSelectedAssignmentType(row.assignmentType || "Employee");
    setSelectedSourceId(row.sourceId);
    setDeviceNameInput(row.assignmentType === "Device" ? row.assignedTo : "");
    setSubmitError("");
    setActionError("");
  };

  const closeAssignModal = () => {
    if (isSaving) {
      return;
    }
    setSelectedIp(null);
    setSelectedAssignmentType("Employee");
    setSelectedSourceId("");
    setDeviceNameInput("");
    setSubmitError("");
  };

  const handleAssign = async () => {
    if (!selectedIp) {
      return;
    }

    if (selectedAssignmentType === "Employee" && selectedSourceId.trim() === "") {
      return;
    }

    if (selectedAssignmentType === "Device" && deviceNameInput.trim() === "") {
      return;
    }

    const nextRow =
      selectedAssignmentType === "Employee"
        ? (() => {
            const employee = employees.find((item) => String(item.id) === selectedSourceId);

            return {
              assignmentType: "Employee" as const,
              assignedTo: employee?.name ?? "",
              referenceId: employee?.employeeId ?? "",
              context: employee?.team ?? "",
              sourceId: employee ? String(employee.id) : "",
            };
          })()
        : {
            assignmentType: "Device" as const,
            assignedTo: deviceNameInput.trim(),
            referenceId: "",
            context: "",
            sourceId: deviceNameInput.trim(),
          };

    setIsSaving(true);
    setSubmitError("");

    try {
      const payload = {
        ipAddress: selectedIp.ipAddress,
        assignedTo: nextRow.assignedTo,
        type: nextRow.assignmentType,
        subnet: selectedIp.subnet,
      };

      let savedId = selectedIp.id;

      if (selectedIp.id) {
        // axios baseURL already includes `/v1`, so this hits `PUT /v1/assets/ip-mappings/:id`.
        await axiosPrivate.put(`/assets/ip-mappings/${selectedIp.id}`, payload);
      } else {
        // axios baseURL already includes `/v1`, so this hits `POST /v1/assets/ip-mappings`.
        const response = await axiosPrivate.post("/assets/ip-mappings", payload);
        savedId =
          typeof response.data?.data?.id === "number"
            ? response.data.data.id
            : typeof response.data?.id === "number"
              ? response.data.id
              : selectedIp.id;
      }

      setRows((current) =>
        current.map((row) =>
          row.ipAddress === selectedIp.ipAddress
            ? {
              ...row,
              id: savedId,
              ...nextRow,
            }
            : row
        )
      );

      closeAssignModal();
    } catch (error: any) {
      setSubmitError(error?.response?.data?.message || "Failed to save IP mapping. Check the API and try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleUnassign = async (ipAddress: string) => {
    const targetRow = rows.find((row) => row.ipAddress === ipAddress);

    if (!targetRow?.id) {
      setActionError("Unable to clear this IP mapping because its mapping ID is missing.");
      return;
    }

    setActionError("");

    try {
      // axios baseURL already includes `/v1`, so this hits `DELETE /v1/assets/ip-mappings/:id`.
      await axiosPrivate.delete(`/assets/ip-mappings/${targetRow.id}`);

      setRows((current) =>
        current.map((row) =>
          row.ipAddress === ipAddress
            ? {
                ...row,
                id: null,
                assignmentType: "",
                assignedTo: "",
                referenceId: "",
                context: "",
                sourceId: "",
              }
            : row
        )
      );
    } catch (error: any) {
      setActionError(error?.response?.data?.message || "Failed to clear IP mapping. Check the API and try again.");
    }
  };

  return (
    <div className="ip-mapping-page">
      <section className="ip-mapping-hero">
        <div className="ip-mapping-hero-copy">
          <p className="ip-mapping-kicker">Network Ownership Layer</p>
          <h2>IP Mapping</h2>
          <p>
            Assign IPs against either employees or devices across the managed subnets. This view is built for
            network ownership clarity, where responsibility can belong to a person or directly to a machine.
          </p>
        </div>
        <div className="ip-mapping-hero-panel">
          <span>Assignment Mix</span>
          <strong>{employeeAssignments + deviceAssignments}</strong>
          <p>{employeeAssignments} employee-linked mappings and {deviceAssignments} device-linked mappings in this session.</p>
        </div>
      </section>

      <section className="ip-mapping-layout">
        <div className="ip-mapping-sidebar">
          <div className="ip-mapping-panel">
            <div className="ip-mapping-panel-head">
              <h3>Subnet Panels</h3>
              <p>Track used and free addresses in each range.</p>
            </div>
            <div className="ip-mapping-subnet-stack">
              {subnetCards.map((subnet) => (
                <article key={subnet.label} className="ip-mapping-subnet-card">
                  <div>
                    <span>{subnet.label}</span>
                    <strong>{subnet.rangeLabel}</strong>
                  </div>
                  <div className="ip-mapping-subnet-stats">
                    <div>
                      <small>Assigned</small>
                      <strong>{subnet.mappedCount}</strong>
                    </div>
                    <div>
                      <small>Free</small>
                      <strong>{subnet.freeCount}</strong>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="ip-mapping-panel">
            <div className="ip-mapping-panel-head">
              <h3>Recent Assignments</h3>
              <p>Latest employee or device mappings in this session.</p>
            </div>
            {recentAssignments.length > 0 ? (
              <div className="ip-mapping-activity-list">
                {recentAssignments.map((row) => (
                  <div key={row.ipAddress} className="ip-mapping-activity-item">
                    <strong>{row.ipAddress}</strong>
                    <span>{row.assignedTo}</span>
                    <small>{row.assignmentType} {row.referenceId ? `• ${row.referenceId}` : ""}</small>
                  </div>
                ))}
              </div>
            ) : (
              <div className="ip-mapping-empty-state">
                <h4>No assignments yet</h4>
                <p>Assign an employee or device to an IP to start building the network ownership board.</p>
              </div>
            )}
          </div>
        </div>

        <div className="ip-mapping-main">
          <div className="ip-mapping-panel ip-mapping-table-panel">
            <div className="ip-mapping-panel-head">
              <div>
                <h3>IP Registry</h3>
                <p>Filter addresses and assign them to an employee or a device.</p>
              </div>
              <div className="ip-mapping-toolbar">
                <label className="ip-mapping-toolbar-search">
                  <span>Search</span>
                  <input
                    type="search"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Search IP, assignee, ID, or details"
                  />
                </label>
                <div className="ip-mapping-toolbar-filters">
                  <label className="ip-mapping-toolbar-field">
                    <span>Subnet</span>
                    <select value={subnetFilter} onChange={(event) => setSubnetFilter(event.target.value)}>
                      <option>All Subnets</option>
                      {SUBNET_CONFIG.map((subnet) => (
                        <option key={subnet.label} value={subnet.label}>
                          {subnet.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="ip-mapping-toolbar-field">
                    <span>Status</span>
                    <select value={assignmentFilter} onChange={(event) => setAssignmentFilter(event.target.value)}>
                      <option>All IPs</option>
                      <option>Assigned</option>
                      <option>Unassigned</option>
                    </select>
                  </label>
                </div>
              </div>
            </div>

            {loadError && (
              <div className="ip-mapping-inline-alert">
                <strong>Assignment options unavailable.</strong>
                <span>{loadError}</span>
              </div>
            )}

            {actionError && (
              <div className="ip-mapping-inline-alert">
                <strong>Action failed.</strong>
                <span>{actionError}</span>
              </div>
            )}

            <div className="ip-mapping-table-wrap">
              <table className="ip-mapping-table">
                <thead>
                  <tr>
                    <th>IP Address</th>
                    <th>Assigned To</th>
                    <th>Type</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.map((row) => (
                    <tr key={row.ipAddress}>
                      <td>
                        <div className="ip-mapping-ip-cell">
                          <strong>{row.ipAddress}</strong>
                        </div>
                      </td>
                      <td>{row.assignedTo || "Unassigned"}</td>
                      <td>
                        {row.assignmentType ? (
                          <span className={`ip-mapping-type-pill type-${row.assignmentType.toLowerCase()}`}>
                            {row.assignmentType}
                          </span>
                        ) : (
                          "Not mapped"
                        )}
                      </td>
                      <td>
                        <div className="ip-mapping-row-actions">
                          <button type="button" className="ip-mapping-assign-btn" onClick={() => openAssignModal(row)}>
                            {row.assignmentType ? "Reassign" : "Assign"}
                          </button>
                          {row.assignmentType && (
                            <button
                              type="button"
                              className="ip-mapping-clear-btn"
                              onClick={() => handleUnassign(row.ipAddress)}
                            >
                              Clear
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredRows.length === 0 && (
              <div className="ip-mapping-empty-state">
                <h4>No IPs match the current filters</h4>
                <p>Adjust the subnet, assignment status, or search query to explore the generated pool.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {selectedIp && (
        <div className="ip-mapping-modal-backdrop" onClick={closeAssignModal}>
          <div
            className="ip-mapping-modal"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="ip-mapping-modal-title"
          >
            <div className="ip-mapping-modal-head">
              <div>
                <p>Assign IP Ownership</p>
                <h3 id="ip-mapping-modal-title">{selectedIp.ipAddress}</h3>
              </div>
              <button type="button" onClick={closeAssignModal} aria-label="Close IP mapping modal">
                x
              </button>
            </div>

            <div className="ip-mapping-modal-body">
              <div className="ip-mapping-modal-info">
                <span>Subnet</span>
                <strong>{selectedIp.subnet}</strong>
              </div>

              <div className="ip-mapping-toggle-group">
                {ASSIGNMENT_TYPES.map((type) => (
                  <button
                    key={type}
                    type="button"
                    className={`ip-mapping-toggle-btn ${selectedAssignmentType === type ? "active" : ""}`}
                    disabled={isSaving}
                    onClick={() => {
                      setSelectedAssignmentType(type);
                      setSelectedSourceId("");
                      setDeviceNameInput(type === "Device" ? selectedIp?.assignedTo ?? "" : "");
                    }}
                  >
                    {type}
                  </button>
                ))}
              </div>

              {selectedAssignmentType === "Employee" ? (
                <label className="ip-mapping-field">
                  <span>Employee</span>
                  <select
                    value={selectedSourceId}
                    onChange={(event) => setSelectedSourceId(event.target.value)}
                    disabled={isLoadingOptions || isSaving}
                  >
                    <option value="">
                      {isLoadingOptions ? "Loading employees..." : "Select employee"}
                    </option>
                    {employees.map((employee) => (
                      <option key={`${employee.id}-${employee.employeeId}`} value={String(employee.id)}>
                        {employee.name} {employee.employeeId ? `(${employee.employeeId})` : ""}
                      </option>
                    ))}
                  </select>
                </label>
              ) : (
                <label className="ip-mapping-field">
                  <span>Device</span>
                  <input
                    type="text"
                    value={deviceNameInput}
                    onChange={(event) => setDeviceNameInput(event.target.value)}
                    placeholder="Enter device name"
                    disabled={isSaving}
                  />
                </label>
              )}

              {!isLoadingOptions && selectedAssignmentType === "Employee" && employees.length === 0 && (
                <div className="ip-mapping-empty-state">
                  <h4>No employees available</h4>
                  <p>Load employee records in the related module first.</p>
                </div>
              )}

              {submitError && <p className="ip-mapping-form-error">{submitError}</p>}

              <div className="ip-mapping-modal-actions">
                <button type="button" className="ip-mapping-ghost-btn" onClick={closeAssignModal} disabled={isSaving}>
                  Cancel
                </button>
                <button
                  type="button"
                  className="ip-mapping-primary-btn"
                  onClick={handleAssign}
                  disabled={
                    isSaving ||
                    (selectedAssignmentType === "Employee"
                      ? selectedSourceId.trim() === ""
                      : deviceNameInput.trim() === "")
                  }
                >
                  {isSaving ? "Saving..." : "Save Mapping"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
