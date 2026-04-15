import React, { useCallback, useEffect, useMemo, useState } from "react";
import useAxiosPrivate from "../../services/hooks/useaxios-private";
import { AssetRecord, AssetStatus, LocationRecord, MappingRecord, UserRecord } from "../../data/asset-admin-data";
import { DEFAULT_TABLE_PAGE_SIZE, TablePagination, useTablePagination } from "../common-component/tables";
import "../../styles/pages/asset-admin/asset-admin.scss";

export default function DashboardMain() {
  const axiosPrivate = useAxiosPrivate();
  const [assets, setAssets] = useState<AssetRecord[]>([]);
  const [locations, setLocations] = useState<LocationRecord[]>([]);
  const [mappings, setMappings] = useState<MappingRecord[]>([]);
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const normalizeStatus = useCallback((status: string | undefined): AssetStatus => {
    switch ((status ?? "").toLowerCase()) {
      case "working":
        return "Working";
      case "in repair":
      case "in_repair":
        return "In Repair";
      case "deferred":
        return "Deferred";
      case "retired":
        return "Retired";
      default:
        return "Working";
    }
  }, []);

  const normalizeEmployeeStatus = useCallback((status: string | undefined) => {
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

  const normalizeDate = useCallback((value: unknown) => {
    if (typeof value !== "string" || value.trim() === "") {
      return "";
    }

    const trimmedValue = value.trim();

    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmedValue)) {
      return trimmedValue;
    }

    const parsedDate = new Date(trimmedValue);

    if (Number.isNaN(parsedDate.getTime())) {
      return "";
    }

    return parsedDate.toISOString().slice(0, 10);
  }, []);

  const mapAssetRecord = useCallback((asset: any): AssetRecord => ({
    id: typeof asset.id === "number" ? asset.id : null,
    assetCode: asset.assetCode ?? "",
    locationId: typeof asset.locationId === "number" ? asset.locationId : null,
    deviceId: asset.deviceId ?? "",
    serialNumber: asset.serialNumber ?? "",
    assetName: asset.assetName ?? "",
    assetModel: asset.assetModel ?? "",
    invoiceNo: asset.invoiceNo ?? asset.invoice_no ?? "",
    invoiceDate: asset.invoiceDate ?? asset.invoice_date ?? "",
    vendor: asset.vendor ?? "",
    quantity: asset.quantity != null ? String(asset.quantity) : "",
    assignedItems: typeof asset.Assigned_items === "number"
      ? asset.Assigned_items
      : typeof asset.assignedItems === "number"
        ? asset.assignedItems
        : 0,
    receiveBy: asset.receiveBy ?? asset.receivedBy ?? asset.receive_by ?? asset.received_by ?? "",
    amount: asset.amount != null ? String(asset.amount) : "",
    receivedDate: asset.receivedDate ?? asset.received_date ?? "",
    type: asset.assetType ?? asset.type ?? asset.assetModel ?? "",
    status: normalizeStatus(asset.assetStatus ?? asset.status),
    location: asset.location?.locationName ?? asset.location?.name ?? asset.locationName ?? "",
    createdAt: asset.createdAt ?? "",
    updatedAt: asset.updatedAt ?? "",
  }), [normalizeStatus]);

  const mapLocationRecord = useCallback((location: any): LocationRecord => ({
    code: location?.locationCode ?? "",
    name: location?.locationName ?? location?.name ?? "",
  }), []);

  const mapEmployeeRecord = useCallback((employee: any): UserRecord => ({
    employeeId: employee?.employeeId ?? "",
    name: employee?.name ?? employee?.userName ?? "",
    email: employee?.email ?? "",
    phone: employee?.phoneNumber ?? employee?.mobileNumber ?? employee?.phone ?? "",
    role: employee?.role ?? "",
    team: employee?.team ?? "",
    status: normalizeEmployeeStatus(employee?.status),
    createdAt: employee?.createdAt ?? "",
    updatedAt: employee?.updatedAt ?? "",
  }), [normalizeEmployeeStatus]);

  const mapMappingRecord = useCallback((mapping: any): MappingRecord => {
    const fullUserName = `${mapping?.user?.firstName ?? ""} ${mapping?.user?.lastName ?? ""}`.trim();

    return {
      id: typeof mapping?.id === "number" ? mapping.id : null,
      assetName:
        mapping?.asset?.assetName ??
        mapping?.assetDetails?.assetName ??
        mapping?.assetName ??
        "",
      assetCode:
        mapping?.asset?.assetCode ??
        mapping?.assetDetails?.assetCode ??
        mapping?.assetCode ??
        "",
      deviceId:
        mapping?.asset?.deviceId ??
        mapping?.assetDetails?.deviceId ??
        mapping?.deviceId ??
        "",
      serialNumber:
        mapping?.asset?.serialNumber ??
        mapping?.assetDetails?.serialNumber ??
        mapping?.serialNumber ??
        "",
      employeeId:
        mapping?.employeeId ??
        mapping?.employee?.employeeId ??
        mapping?.user?.employeeId ??
        "",
      assignedTo:
        mapping?.responsibilityUser ??
        mapping?.employee?.name ??
        (fullUserName || undefined) ??
        mapping?.user?.name ??
        mapping?.assignedTo ??
        "",
      role:
        mapping?.employee?.role ??
        mapping?.user?.role ??
        mapping?.role ??
        "",
      department:
        mapping?.employee?.team ??
        mapping?.user?.team ??
        mapping?.department ??
        "",
      location:
        mapping?.location?.locationName ??
        mapping?.location?.name ??
        mapping?.locationName ??
        mapping?.location ??
        "",
      assignedQuantity:
        typeof mapping?.assignedQuantity === "number"
          ? mapping.assignedQuantity
          : typeof mapping?.quantity === "number"
            ? mapping.quantity
            : 0,
      isActive: Boolean(mapping?.isActive ?? true),
      assignedOn: normalizeDate(
        mapping?.assignedDate ??
        mapping?.assignedOn ??
        mapping?.mappingDate ??
        mapping?.createdAt
      ),
    };
  }, [normalizeDate]);

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    setLoadError("");

    try {
      const [assetsResponse, locationsResponse, mappingsResponse, employeesResponse] = await Promise.all([
        axiosPrivate.get("/assets"),
        axiosPrivate.get("/assets/locations"),
        axiosPrivate.get("/assets/mappings"),
        axiosPrivate.get("/employees"),
      ]);

      const assetsPayload = Array.isArray(assetsResponse.data?.data)
        ? assetsResponse.data.data
        : Array.isArray(assetsResponse.data)
          ? assetsResponse.data
          : Array.isArray(assetsResponse.data?.assets)
            ? assetsResponse.data.assets
            : [];
      const locationsPayload = Array.isArray(locationsResponse.data?.data)
        ? locationsResponse.data.data
        : Array.isArray(locationsResponse.data)
          ? locationsResponse.data
          : [];
      const mappingsPayload = Array.isArray(mappingsResponse.data?.data)
        ? mappingsResponse.data.data
        : Array.isArray(mappingsResponse.data?.mappings)
          ? mappingsResponse.data.mappings
          : Array.isArray(mappingsResponse.data)
            ? mappingsResponse.data
            : [];
      const employeesPayload = Array.isArray(employeesResponse.data?.data)
        ? employeesResponse.data.data
        : Array.isArray(employeesResponse.data?.employees)
          ? employeesResponse.data.employees
          : Array.isArray(employeesResponse.data)
            ? employeesResponse.data
            : [];

      setAssets(assetsPayload.map(mapAssetRecord));
      setLocations(locationsPayload.map(mapLocationRecord));
      setMappings(mappingsPayload.map(mapMappingRecord));
      setUsers(employeesPayload.map(mapEmployeeRecord));
    } catch (error: any) {
      setAssets([]);
      setLocations([]);
      setMappings([]);
      setUsers([]);
      setLoadError(error?.response?.data?.message || "Failed to load dashboard data. Check the API and try again.");
      console.error("Failed to load dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [axiosPrivate, mapAssetRecord, mapEmployeeRecord, mapLocationRecord, mapMappingRecord]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const parseCount = useCallback((value: string) => {
    const numericValue = Number(value);
    return Number.isFinite(numericValue) ? numericValue : 0;
  }, []);

  const formatDisplayDate = useCallback((value: string) => {
    if (!value) {
      return "Not available";
    }

    const normalizedValue = value.includes("T") ? value : `${value}T00:00:00`;
    const parsedDate = new Date(normalizedValue);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Not available";
    }

    return parsedDate.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }, []);

  const recentAssets = useMemo(
    () => [...assets].sort((left, right) => {
      const rightTimestamp = new Date(right.updatedAt || right.createdAt || 0).getTime();
      const leftTimestamp = new Date(left.updatedAt || left.createdAt || 0).getTime();
      return rightTimestamp - leftTimestamp;
    }),
    [assets]
  );
  const recentMappings = useMemo(
    () => [...mappings].sort((left, right) => new Date(right.assignedOn).getTime() - new Date(left.assignedOn).getTime()),
    [mappings]
  );
  const recentAssetsPagination = useTablePagination(recentAssets, {
    pageSize: DEFAULT_TABLE_PAGE_SIZE,
    resetDeps: [recentAssets],
  });
  const recentMappingsPagination = useTablePagination(recentMappings, {
    pageSize: DEFAULT_TABLE_PAGE_SIZE,
    resetDeps: [recentMappings],
  });
  const totalTrackedEntities = assets.length + locations.length + mappings.length + users.length;
  const totalAssetUnits = assets.reduce((sum, asset) => sum + parseCount(asset.quantity), 0);
  const assignedAssetUnits = assets.reduce((sum, asset) => sum + asset.assignedItems, 0);
  const availableAssetUnits = Math.max(totalAssetUnits - assignedAssetUnits, 0);
  const workingAssets = assets.filter((asset) => asset.status === "Working").length;
  const deferredAssets = assets.filter((asset) => asset.status === "Deferred").length;
  const activeEmployees = users.filter((user) => user.status === "Active").length;
  const uniqueMappedEmployees = new Set(
    mappings
      .map((mapping) => mapping.employeeId)
      .filter((employeeId) => employeeId.trim() !== "")
  ).size;
  const dashboardMetrics = [
    { label: "Asset Records", value: assets.length, helper: "Distinct asset entries from the asset API" },
    { label: "Total Units", value: totalAssetUnits, helper: "Combined quantity across all tracked assets" },
    { label: "Assigned Units", value: assignedAssetUnits, helper: "Units already allocated from current stock" },
    { label: "Mapped Employees", value: uniqueMappedEmployees, helper: "People currently receiving asset assignments" },
  ];
  const statusBreakdown = [
    { label: "Working", value: workingAssets },
    { label: "In Repair", value: assets.filter((asset) => asset.status === "In Repair").length },
    { label: "Deferred", value: deferredAssets },
    { label: "Retired", value: assets.filter((asset) => asset.status === "Retired").length },
  ];
  const typeBreakdown = Array.from(
    assets.reduce<Map<string, number>>((accumulator, asset) => {
      accumulator.set(asset.type || "Unspecified", (accumulator.get(asset.type || "Unspecified") ?? 0) + 1);
      return accumulator;
    }, new Map())
  )
    .map(([label, value]) => ({ label, value }))
    .sort((left, right) => right.value - left.value)
    .slice(0, 5);
  const locationBreakdown = Array.from(
    mappings.reduce<Map<string, number>>((accumulator, mapping) => {
      const locationName = mapping.location || "Unknown";
      accumulator.set(locationName, (accumulator.get(locationName) ?? 0) + mapping.assignedQuantity);
      return accumulator;
    }, new Map())
  )
    .map(([label, value]) => ({ label, value }))
    .sort((left, right) => right.value - left.value)
    .slice(0, 5);
  const teamBreakdown = Array.from(
    users.reduce<Map<string, number>>((accumulator, user) => {
      const teamName = user.team || "Unassigned team";
      accumulator.set(teamName, (accumulator.get(teamName) ?? 0) + 1);
      return accumulator;
    }, new Map())
  )
    .map(([label, value]) => ({ label, value }))
    .sort((left, right) => right.value - left.value)
    .slice(0, 6);
  const recentEmployeeJoins = useMemo(
    () => [...users]
      .sort((left, right) => {
        const rightTimestamp = new Date(right.createdAt || 0).getTime();
        const leftTimestamp = new Date(left.createdAt || 0).getTime();
        return rightTimestamp - leftTimestamp;
      })
      .slice(0, 5),
    [users]
  );
  const readinessSnapshot = totalAssetUnits > 0 ? `${Math.round((assignedAssetUnits / totalAssetUnits) * 100)}%` : "0%";
  const assignedAssets = new Set(
    mappings.map((mapping) => mapping.assetCode || mapping.deviceId || mapping.assetName).filter((value) => value.trim() !== "")
  ).size;
  const unassignedAssets = Math.max(assets.length - assignedAssets, 0);
  const topAssetType = typeBreakdown.reduce<{ label: string; value: number } | null>((topItem, currentItem) => {
    if (!topItem || currentItem.value > topItem.value) {
      return currentItem;
    }

    return topItem;
  }, null);
  const busiestLocation = locationBreakdown.reduce<{ label: string; value: number } | null>((topItem, currentItem) => {
    if (!topItem || currentItem.value > topItem.value) {
      return currentItem;
    }

    return topItem;
  }, null);
  const dashboardSignals = [
    {
      eyebrow: "Stock Coverage",
      title: `${availableAssetUnits} units available`,
      description: `${assignedAssetUnits} of ${totalAssetUnits} total units are already allocated based on asset stock data.`,
      tone: "coverage",
    },
    {
      eyebrow: "Most Common Category",
      title: topAssetType ? topAssetType.label : "No asset types yet",
      description: topAssetType
        ? `${topAssetType.value} asset records currently fall into the dominant device category.`
        : "As assets are added, type distribution will surface here.",
      tone: "type",
    },
    {
      eyebrow: "Busy Assignment Location",
      title: busiestLocation ? busiestLocation.label : "No active locations",
      description: busiestLocation
        ? `${busiestLocation.value} assigned units are currently tied to this location through mapping records.`
        : "Location activity appears once assets are mapped to users and locations.",
      tone: "location",
    },
  ];
  const dashboardHighlights = [
    { label: "Locations online", value: locations.length, helper: "Managed places currently available in the workspace" },
    { label: "Active employees", value: activeEmployees, helper: "People currently marked active in the employee module" },
    { label: "Assets without mapping", value: unassignedAssets, helper: "Asset records not yet represented in mapping activity" },
  ];

  const renderLoadState = (title: string, description: string) => (
    <div className="asset-admin-empty-state">
      <h4>{title}</h4>
      <p>{description}</p>
    </div>
  );

  return (
    <div className="asset-admin-page">
      <div className="asset-admin-shell">
        <section className="asset-admin-dashboard-studio">
          <div className="asset-admin-dashboard-hero-panel">
            <div className="asset-admin-dashboard-hero-copy">
              <p className="asset-admin-kicker">InfraPilot Command Center</p>
              <h2>Dashboard</h2>
              <p className="asset-admin-dashboard-intro">
                A sharper operational view of asset readiness, ownership flow, and workspace coverage,
                all driven by the same live admin APIs.
              </p>
              <div className="asset-admin-dashboard-chip-row">
                <span>{assets.length} tracked assets</span>
                <span>{locations.length} managed locations</span>
                <span>{users.length} employees in scope</span>
                <span>{mappings.length} ownership records</span>
              </div>
            </div>

            <div className="asset-admin-dashboard-hero-rail">
              <div className="asset-admin-dashboard-orbit-card">
                <span className="asset-admin-dashboard-orbit-label">Readiness</span>
                <strong>{readinessSnapshot}</strong>
                <p>of total stock has already been allocated to users based on asset quantity and assigned items.</p>
              </div>
              <div className="asset-admin-dashboard-mini-metrics">
                <div>
                  <span>Mapped Assets</span>
                  <strong>{assignedAssets}</strong>
                </div>
                <div>
                  <span>Available Units</span>
                  <strong>{availableAssetUnits}</strong>
                </div>
              </div>
            </div>
          </div>

          <div className="asset-admin-dashboard-overview-grid">
            <div className="asset-admin-dashboard-scoreboard">
              <div className="asset-admin-dashboard-scoreboard-head">
                <div>
                  <p className="asset-admin-dashboard-section-label">Overview</p>
                  <h3>System health at a glance</h3>
                </div>
                <span>{totalTrackedEntities} total records</span>
              </div>
              <div className="asset-admin-dashboard-scoreboard-metrics">
                {dashboardMetrics.map((metric) => (
                  <div key={metric.label} className="asset-admin-dashboard-score-card">
                    <span>{metric.label}</span>
                    <strong>{metric.value}</strong>
                    <p>{metric.helper}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="asset-admin-dashboard-signal-column">
              {dashboardSignals.map((signal) => (
                <div key={signal.eyebrow} className={`asset-admin-dashboard-signal-card tone-${signal.tone}`}>
                  <span>{signal.eyebrow}</span>
                  <strong>{signal.title}</strong>
                  <p>{signal.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="asset-admin-dashboard-band asset-admin-dashboard-band-redesign">
          {dashboardHighlights.map((highlight) => (
            <div key={highlight.label} className="asset-admin-band-card">
              <span>{highlight.label}</span>
              <strong>{highlight.value}</strong>
              <p>{highlight.helper}</p>
            </div>
          ))}
        </div>

        {loadError && (
          <div className="asset-admin-table-card asset-admin-dashboard-alert-card">
            <div className="asset-admin-empty-state">
              <h4>Unable to load dashboard data</h4>
              <p>{loadError}</p>
            </div>
          </div>
        )}

        <div className="asset-admin-dashboard-feature-grid">
          <section className="asset-admin-table-card asset-admin-dashboard-spotlight-card">
            <div className="asset-admin-card-header">
              <div>
                <p className="asset-admin-dashboard-section-label">Operational Pulse</p>
                <h3>Asset status summary</h3>
                <p>Quick visual read on the condition of tracked devices.</p>
              </div>
            </div>
            <div className="asset-admin-dashboard-pill-grid">
              {statusBreakdown.map((item) => (
                <div key={item.label} className="asset-admin-dashboard-pill-card">
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </div>
              ))}
            </div>
          </section>

          <section className="asset-admin-table-card asset-admin-dashboard-spotlight-card">
            <div className="asset-admin-card-header">
              <div>
                <p className="asset-admin-dashboard-section-label">Type Distribution</p>
                <h3>Asset mix</h3>
                <p>Top categories based on the current asset inventory records.</p>
              </div>
            </div>
            {isLoading ? (
              renderLoadState("Loading asset types", "Fetching asset summary from the backend.")
            ) : typeBreakdown.length > 0 ? (
              <div className="asset-admin-list asset-admin-dashboard-list">
                {typeBreakdown.map((item) => (
                  <div key={item.label} className="asset-admin-list-row">
                    <span>{item.label}</span>
                    <strong>{item.value}</strong>
                  </div>
                ))}
              </div>
            ) : (
              renderLoadState("No asset types available", "Add assets to populate the type summary.")
            )}
          </section>
        </div>

        <div className="asset-admin-grid asset-admin-dashboard-data-grid">
          <section className="asset-admin-table-card asset-admin-dashboard-table-card">
            <div className="asset-admin-card-header">
              <div>
                <h3>Recent Assets</h3>
                <p>Latest asset records using the current asset API payload.</p>
              </div>
            </div>
            {isLoading ? (
              renderLoadState("Loading assets", "Fetching recent assets from the backend.")
            ) : recentAssets.length > 0 ? (
              <>
                <div className="asset-admin-table-wrap">
                  <table className="asset-admin-table">
                    <thead>
                      <tr>
                        <th>Asset Code</th>
                        <th>Asset Name</th>
                        <th>Units</th>
                        <th>Status</th>
                        <th>Updated</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentAssetsPagination.paginatedRows.map((asset) => (
                        <tr key={`${asset.assetCode}-${asset.id ?? asset.serialNumber}`}>
                          <td>{asset.assetCode || "Not set"}</td>
                          <td>
                            <span className="asset-admin-cell-text">{asset.assetName}</span>
                          </td>
                          <td>{`${asset.assignedItems}/${parseCount(asset.quantity)}`}</td>
                          <td>
                            <span className={`asset-admin-status-pill status-${asset.status.toLowerCase().replace(/\s+/g, "-")}`}>
                              {asset.status}
                            </span>
                          </td>
                          <td>{formatDisplayDate(asset.updatedAt || asset.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <TablePagination
                  currentPage={recentAssetsPagination.currentPage}
                  pageSize={recentAssetsPagination.pageSize}
                  totalItems={recentAssetsPagination.totalItems}
                  onPageChange={recentAssetsPagination.setCurrentPage}
                />
              </>
            ) : (
              renderLoadState("No assets available", "Create assets to see recent activity here.")
            )}
          </section>

          <section className="asset-admin-table-card asset-admin-dashboard-table-card">
            <div className="asset-admin-card-header">
              <div>
                <h3>Recent Mapping Activity</h3>
                <p>Latest allocation activity across users, quantities, and locations.</p>
              </div>
            </div>
            {isLoading ? (
              renderLoadState("Loading mappings", "Fetching recent mapping activity from the backend.")
            ) : recentMappings.length > 0 ? (
              <>
                <div className="asset-admin-table-wrap">
                  <table className="asset-admin-table">
                    <thead>
                      <tr>
                        <th>Asset</th>
                        <th>Employee</th>
                        <th>Qty</th>
                        <th>Location</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentMappingsPagination.paginatedRows.map((mapping) => (
                        <tr key={`${mapping.id ?? mapping.assetCode}-${mapping.employeeId}-${mapping.assignedOn}`}>
                          <td>{mapping.assetName || mapping.assetCode || "Not set"}</td>
                          <td>{mapping.assignedTo || mapping.employeeId || "Not set"}</td>
                          <td>{mapping.assignedQuantity}</td>
                          <td>{mapping.location || "Not set"}</td>
                          <td>{formatDisplayDate(mapping.assignedOn)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <TablePagination
                  currentPage={recentMappingsPagination.currentPage}
                  pageSize={recentMappingsPagination.pageSize}
                  totalItems={recentMappingsPagination.totalItems}
                  onPageChange={recentMappingsPagination.setCurrentPage}
                />
              </>
            ) : (
              renderLoadState("No mappings available", "Assign assets to employees to populate recent mapping activity.")
            )}
          </section>
        </div>

        <div className="asset-admin-grid asset-admin-dashboard-support-grid">
          <section className="asset-admin-table-card asset-admin-dashboard-table-card">
            <div className="asset-admin-card-header">
              <div>
                <h3>Location Coverage</h3>
                <p>Managed locations ordered by assignment activity.</p>
              </div>
            </div>
            {isLoading ? (
              renderLoadState("Loading locations", "Fetching locations from the backend.")
            ) : locationBreakdown.length > 0 ? (
              <div className="asset-admin-list asset-admin-dashboard-list">
                {locationBreakdown.map((location) => (
                  <div key={location.label} className="asset-admin-list-row">
                    <span>{location.label}</span>
                    <strong>{location.value} units</strong>
                  </div>
                ))}
              </div>
            ) : (
              renderLoadState("No mapped locations available", "Create mappings to see which locations are carrying asset assignments.")
            )}
          </section>

          <section className="asset-admin-table-card asset-admin-dashboard-table-card">
            <div className="asset-admin-card-header">
              <div>
                <h3>Employee Snapshot</h3>
                <p>Top team distribution from the employee directory.</p>
              </div>
            </div>
            {isLoading ? (
              renderLoadState("Loading employees", "Fetching employees from the backend.")
            ) : teamBreakdown.length > 0 ? (
              <div className="asset-admin-list asset-admin-dashboard-list">
                {teamBreakdown.map((team) => (
                  <div key={team.label} className="asset-admin-list-row">
                    <div className="asset-admin-dashboard-user-row">
                      <span>{team.label}</span>
                      <small>Employees in this team</small>
                    </div>
                    <strong>{team.value}</strong>
                  </div>
                ))}
                {recentEmployeeJoins.length > 0 && (
                  <div className="asset-admin-list-row asset-admin-dashboard-more-row">
                    <span>Newest employee record</span>
                    <strong>{recentEmployeeJoins[0].name}</strong>
                  </div>
                )}
              </div>
            ) : (
              renderLoadState("No employees available", "Add employees before mapping assets against them.")
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
