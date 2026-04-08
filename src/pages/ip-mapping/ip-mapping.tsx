import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
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

const normalizeAssignmentType = (value: unknown): AssignmentType => {
  if (typeof value !== "string") {
    return "";
  }

  const normalizedValue = value.trim().toLowerCase();

  if (normalizedValue === "employee") {
    return "Employee";
  }

  if (normalizedValue === "device") {
    return "Device";
  }

  return "";
};

const deriveSubnetLabel = (ipAddress: string, fallback: unknown): string => {
  if (typeof fallback === "string" && fallback.trim() !== "") {
    return fallback.trim();
  }

  const octets = ipAddress.split(".");

  if (octets.length >= 3) {
    return `${octets[0]}.${octets[1]}.${octets[2]}.x`;
  }

  return "Unknown subnet";
};

const buildSubnetRangeLabel = (subnetLabel: string): string => {
  const base = subnetLabel.replace(/\.x$/i, "");

  return /^\d{1,3}(?:\.\d{1,3}){2}$/.test(base) ? `${base}.1 - ${base}.255` : subnetLabel;
};

const getEmployeeOptionLabel = (employee: EmployeeOption): string =>
  `${employee.name}${employee.employeeId ? ` (${employee.employeeId})` : ""}`;

const getAssignmentPreview = (row: IpMappingRecord): string => {
  if (!row.assignmentType || !row.assignedTo) {
    return "This IP is currently open and ready to be assigned.";
  }

  if (row.assignmentType === "Employee") {
    return `Currently linked to ${row.assignedTo}${row.referenceId ? ` (${row.referenceId})` : ""}.`;
  }

  return `Currently reserved for device ${row.assignedTo}.`;
};

const generateIpPool = (subnetLabels: string[]): IpMappingRecord[] =>
  subnetLabels.flatMap((subnetLabel) => {
    const matchingSubnet = SUBNET_CONFIG.find((subnet) => subnet.label === subnetLabel);
    const derivedBase =
      matchingSubnet?.base ?? subnetLabel.replace(/\.x$/i, "");

    if (!/^\d{1,3}(?:\.\d{1,3}){2}$/.test(derivedBase)) {
      return [];
    }

    return Array.from({ length: 255 }, (_, index) => ({
      id: null,
      ipAddress: `${derivedBase}.${index + 1}`,
      subnet: subnetLabel,
      assignmentType: "" as AssignmentType,
      assignedTo: "",
      referenceId: "",
      context: "",
      sourceId: "",
    }));
  });

export default function IpMappingPage() {
  const axiosPrivate = useAxiosPrivate();
  const employeeComboboxRef = useRef<HTMLDivElement | null>(null);
  const [rows, setRows] = useState<IpMappingRecord[]>([]);
  const [employees, setEmployees] = useState<EmployeeOption[]>([]);
  const [isLoadingMappings, setIsLoadingMappings] = useState(true);
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [subnetFilter, setSubnetFilter] = useState("All Subnets");
  const [assignmentFilter, setAssignmentFilter] = useState("All IPs");
  const [selectedIp, setSelectedIp] = useState<IpMappingRecord | null>(null);
  const [selectedAssignmentType, setSelectedAssignmentType] = useState<AssignmentType>("Employee");
  const [selectedSourceId, setSelectedSourceId] = useState("");
  const [employeeQuery, setEmployeeQuery] = useState("");
  const [isEmployeeDropdownOpen, setIsEmployeeDropdownOpen] = useState(false);
  const [deviceNameInput, setDeviceNameInput] = useState("");
  const [clearTarget, setClearTarget] = useState<IpMappingRecord | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [actionError, setActionError] = useState("");

  const mapIpMappingRecord = useCallback((mapping: any): IpMappingRecord => {
    const ipAddress =
      mapping?.ipAddress ??
      mapping?.ip ??
      mapping?.ip_address ??
      mapping?.address ??
      "";
    const assignmentType = normalizeAssignmentType(
      mapping?.type ??
      mapping?.assignmentType ??
      mapping?.mappingType
    );

    return {
      id:
        typeof mapping?.id === "number"
          ? mapping.id
          : typeof mapping?.mappingId === "number"
            ? mapping.mappingId
            : null,
      ipAddress,
      subnet: deriveSubnetLabel(ipAddress, mapping?.subnet ?? mapping?.subnetName ?? mapping?.network),
      assignmentType,
      assignedTo:
        mapping?.assignedTo ??
        mapping?.assignedToName ??
        mapping?.employee?.name ??
        mapping?.user?.name ??
        mapping?.device?.name ??
        mapping?.deviceName ??
        "",
      referenceId:
        mapping?.referenceId ??
        mapping?.employee?.employeeId ??
        mapping?.user?.employeeId ??
        mapping?.device?.deviceId ??
        mapping?.deviceId ??
        "",
      context:
        mapping?.context ??
        mapping?.employee?.team ??
        mapping?.user?.team ??
        mapping?.department ??
        "",
      sourceId:
        mapping?.sourceId != null
          ? String(mapping.sourceId)
          : typeof mapping?.employee?.id === "number"
            ? String(mapping.employee.id)
            : typeof mapping?.user?.id === "number"
              ? String(mapping.user.id)
              : assignmentType === "Device"
                ? String(
                    mapping?.device?.name ??
                    mapping?.deviceName ??
                    mapping?.assignedTo ??
                    ""
                  )
                : "",
    };
  }, []);

  const fetchMappings = useCallback(async () => {
    setIsLoadingMappings(true);
    setActionError("");

    try {
      const response = await axiosPrivate.get("/ip-mappings");
      const payload = Array.isArray(response.data?.data)
        ? response.data.data
        : Array.isArray(response.data?.ipMappings)
          ? response.data.ipMappings
          : Array.isArray(response.data?.mappings)
            ? response.data.mappings
            : Array.isArray(response.data)
              ? response.data
              : [];

      const mappedRows = payload
        .filter((mapping: any) => !mapping?.isDeleted)
        .map(mapIpMappingRecord)
        .filter((row: IpMappingRecord) => row.ipAddress.trim() !== "");

      const subnetLabels = Array.from(
        new Set([
          ...SUBNET_CONFIG.map((subnet) => subnet.label),
          ...mappedRows
            .map((row: IpMappingRecord) => row.subnet)
            .filter((subnet: string) => subnet.trim() !== ""),
        ])
      );

      const basePool = generateIpPool(subnetLabels);
      const mappedRowsByIp = new Map<string, IpMappingRecord>(
        mappedRows.map((row: IpMappingRecord) => [row.ipAddress, row] as const)
      );

      setRows(
        basePool.map((row: IpMappingRecord) => mappedRowsByIp.get(row.ipAddress) ?? row)
      );
    } catch (error: any) {
      setRows([]);
      setActionError(
        error?.response?.data?.message || "Failed to fetch IP mappings. Check the API and try again."
      );
      console.error("Failed to fetch IP mappings:", error);
    } finally {
      setIsLoadingMappings(false);
    }
  }, [axiosPrivate, mapIpMappingRecord]);

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
    fetchMappings();
    fetchAssignmentOptions();
  }, [fetchAssignmentOptions, fetchMappings]);

  useEffect(() => {
    if (!isEmployeeDropdownOpen) {
      return;
    }

    const handleOutsideClick = (event: MouseEvent) => {
      if (!employeeComboboxRef.current?.contains(event.target as Node)) {
        setIsEmployeeDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isEmployeeDropdownOpen]);

  const subnetOptions = useMemo(
    () =>
      Array.from(new Set(rows.map((row) => row.subnet).filter((subnet) => subnet.trim() !== ""))).sort((left, right) =>
        left.localeCompare(right)
      ),
    [rows]
  );

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
      subnetOptions.map((subnetLabel) => {
        const subnetRows = rows.filter((row) => row.subnet === subnetLabel);
        const mappedCount = subnetRows.filter((row) => row.assignmentType !== "").length;
        const configuredSubnet = SUBNET_CONFIG.find((subnet) => subnet.label === subnetLabel);

        return {
          label: subnetLabel,
          rangeLabel: configuredSubnet?.rangeLabel ?? buildSubnetRangeLabel(subnetLabel),
          mappedCount,
          freeCount: subnetRows.length - mappedCount,
        };
      }),
    [rows, subnetOptions]
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
    const matchedEmployee =
      row.assignmentType === "Employee"
        ? employees.find(
            (employee) =>
              String(employee.id) === row.sourceId ||
              employee.employeeId === row.referenceId ||
              employee.name === row.assignedTo
          )
        : undefined;

    setSelectedIp(row);
    setSelectedAssignmentType(row.assignmentType || "Employee");
    setSelectedSourceId(matchedEmployee ? String(matchedEmployee.id) : row.sourceId);
    setEmployeeQuery(
      matchedEmployee
        ? getEmployeeOptionLabel(matchedEmployee)
        : row.assignedTo ?? ""
    );
    setIsEmployeeDropdownOpen(false);
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
    setEmployeeQuery("");
    setIsEmployeeDropdownOpen(false);
    setDeviceNameInput("");
    setSubmitError("");
  };

  const filteredEmployees = useMemo(() => {
    const normalizedSearch = employeeQuery.trim().toLowerCase();

    if (normalizedSearch === "") {
      return employees;
    }

    return employees.filter((employee) =>
      [employee.name, employee.employeeId, employee.team, getEmployeeOptionLabel(employee)]
        .join(" ")
        .toLowerCase()
        .includes(normalizedSearch)
    );
  }, [employeeQuery, employees]);

  const selectedEmployee = useMemo(
    () => employees.find((employee) => String(employee.id) === selectedSourceId) ?? null,
    [employees, selectedSourceId]
  );

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

  const openClearModal = (row: IpMappingRecord) => {
    setClearTarget(row);
    setActionError("");
  };

  const closeClearModal = () => {
    setClearTarget(null);
  };

  useEffect(() => {
    if (!selectedIp && !clearTarget) {
      return undefined;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (clearTarget) {
          closeClearModal();
          return;
        }

        if (selectedIp) {
          closeAssignModal();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [clearTarget, selectedIp]);

  return (
    <div className="ip-mapping-page">
      <section className="ip-mapping-hero">
        <div className="ip-mapping-hero-copy">
          <p className="ip-mapping-kicker">Network Ownership Layer</p>
          <h2>IP Mapping</h2>
          <p>
            Review backend IP mappings and assign ownership against employees or devices across the managed
            subnets. This view is built for network ownership clarity, where responsibility can belong to a
            person or directly to a machine.
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
                      {subnetOptions.map((subnet) => (
                        <option key={subnet} value={subnet}>
                          {subnet}
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
                  {isLoadingMappings ? (
                    <tr>
                      <td colSpan={4}>Loading IP mappings...</td>
                    </tr>
                  ) : (
                    filteredRows.map((row) => (
                      <tr key={row.id ?? row.ipAddress}>
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
                                onClick={() => openClearModal(row)}
                              >
                                Clear
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {!isLoadingMappings && filteredRows.length === 0 && (
              <div className="ip-mapping-empty-state">
                <h4>No IPs match the current filters</h4>
                <p>Adjust the subnet, assignment status, or search query to explore the fetched IP mappings.</p>
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
              <div className="ip-mapping-modal-title-block">
                <p>Assign IP Ownership</p>
                <h3 id="ip-mapping-modal-title">{selectedIp.ipAddress}</h3>
                <span>{getAssignmentPreview(selectedIp)}</span>
              </div>
              <button type="button" onClick={closeAssignModal} aria-label="Close IP mapping modal">
                ×
              </button>
            </div>

            <div className="ip-mapping-modal-body">
            <div className="ip-mapping-form-card">
                <div className="ip-mapping-form-card-head">
                  <strong>{selectedAssignmentType === "Employee" ? "Employee assignment" : "Device assignment"}</strong>
                  <p>
                    {selectedAssignmentType === "Employee"
                      ? "Search and select the employee who owns this IP."
                      : "Provide a clear device name so this IP can be tracked accurately."}
                  </p>
                </div>

                {selectedAssignmentType === "Employee" ? (
                  <label className="ip-mapping-field">
                    <span>Employee</span>
                    <small className="ip-mapping-field-helper">
                      Start typing to filter employees by name, employee ID, or team.
                    </small>
                    <div className="ip-mapping-employee-combobox" ref={employeeComboboxRef}>
                      <div className={`ip-mapping-employee-shell ${isEmployeeDropdownOpen ? "open" : ""}`}>
                        <input
                          type="text"
                          value={employeeQuery}
                          onChange={(event) => {
                            setEmployeeQuery(event.target.value);
                            setSelectedSourceId("");
                            setIsEmployeeDropdownOpen(true);
                          }}
                          onFocus={() => setIsEmployeeDropdownOpen(true)}
                          placeholder={isLoadingOptions ? "Loading employees..." : "Search by name, ID, or team"}
                          disabled={isLoadingOptions || isSaving}
                          className="ip-mapping-employee-input"
                        />
                      </div>
                      <button
                        type="button"
                        className={`ip-mapping-employee-trigger ${isEmployeeDropdownOpen ? "open" : ""}`}
                        onClick={() => {
                          if (isLoadingOptions || isSaving) {
                            return;
                          }

                          setIsEmployeeDropdownOpen((current) => !current);
                        }}
                        aria-label="Toggle employee dropdown"
                        disabled={isLoadingOptions || isSaving}
                      >
                        <span />
                      </button>
                      {isEmployeeDropdownOpen && !isLoadingOptions && filteredEmployees.length > 0 && (
                        <div className="ip-mapping-employee-options">
                          <div className="ip-mapping-employee-options-head">
                            <strong>Select employee</strong>
                            <span>{filteredEmployees.length} result{filteredEmployees.length === 1 ? "" : "s"}</span>
                          </div>
                          {filteredEmployees.map((employee) => {
                            const optionLabel = getEmployeeOptionLabel(employee);
                            const isSelected = String(employee.id) === selectedSourceId;

                            return (
                              <button
                                key={`${employee.id}-${employee.employeeId}`}
                                type="button"
                                className={`ip-mapping-employee-option ${isSelected ? "selected" : ""}`}
                                onMouseDown={(event) => event.preventDefault()}
                                onClick={() => {
                                  setSelectedSourceId(String(employee.id));
                                  setEmployeeQuery(optionLabel);
                                  setIsEmployeeDropdownOpen(false);
                                }}
                              >
                                <div className="ip-mapping-employee-option-main">
                                  <strong>{employee.name}</strong>
                                  <small>{employee.team || "Team not added"}</small>
                                </div>
                                <span className="ip-mapping-employee-option-id">
                                  {employee.employeeId || "No employee ID"}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                    {selectedEmployee && (
                      <div className="ip-mapping-selected-employee">
                        <strong>{selectedEmployee.name}</strong>
                        <span>
                          {[selectedEmployee.employeeId, selectedEmployee.team].filter(Boolean).join(" • ") || "Employee selected"}
                        </span>
                      </div>
                    )}
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
                      if (type !== "Employee") {
                        setSelectedSourceId("");
                        setEmployeeQuery("");
                      }
                      setIsEmployeeDropdownOpen(false);
                      setDeviceNameInput(type === "Device" ? selectedIp?.assignedTo ?? "" : "");
                    }}
                  >
                    <strong>{type}</strong>
                    <span>
                      {type === "Employee" ? "Assign ownership to a person record" : "Reserve the IP directly for a device"}
                    </span>
                  </button>
                ))}
              </div>



              {!isLoadingOptions && selectedAssignmentType === "Employee" && employees.length === 0 && (
                <div className="ip-mapping-empty-state">
                  <h4>No employees available</h4>
                  <p>Load employee records in the related module first.</p>
                </div>
              )}

              {!isLoadingOptions &&
                selectedAssignmentType === "Employee" &&
                employees.length > 0 &&
                filteredEmployees.length === 0 &&
                selectedSourceId.trim() === "" && (
                <div className="ip-mapping-empty-state">
                  <h4>No matching employees</h4>
                  <p>Try a different name, employee ID, or team in the employee dropdown.</p>
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
      {clearTarget && (
        <div className="ip-mapping-modal-backdrop" onClick={closeClearModal}>
          <div
            className="ip-mapping-modal"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="ip-mapping-clear-modal-title"
          >
            <div className="ip-mapping-modal-head">
              <div className="ip-mapping-modal-title-block">
                <p>Confirm Clear</p>
                <h3 id="ip-mapping-clear-modal-title">{clearTarget.ipAddress}</h3>
                <span>Remove the current IP assignment for this address.</span>
              </div>
              <button type="button" onClick={closeClearModal} aria-label="Close IP clear confirmation modal">
                ×
              </button>
            </div>

            <div className="ip-mapping-modal-body">
              <div className="ip-mapping-form-card">
                <div className="ip-mapping-form-card-head">
                  <strong>Clear assignment</strong>
                  <p>
                    Clear <strong>{clearTarget.ipAddress}</strong> from{" "}
                    <strong>{clearTarget.assignedTo || "the current assignee"}</strong>? This action can be reassigned later.
                  </p>
                </div>

                <div className="asset-admin-form-actions">
                  <button type="button" className="asset-admin-secondary-btn" onClick={closeClearModal}>
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="asset-admin-danger-btn"
                    onClick={async () => {
                      await handleUnassign(clearTarget.ipAddress);
                      closeClearModal();
                    }}
                  >
                    Clear
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
