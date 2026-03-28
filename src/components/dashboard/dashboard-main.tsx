import React, { useCallback, useEffect, useMemo, useState } from "react";
import useAxiosPrivate from "../../services/hooks/useaxios-private";
import { AssetRecord, AssetStatus, LocationRecord, MappingRecord, UserRecord } from "../../data/asset-admin-data";
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
    type: asset.assetType ?? asset.type ?? "",
    status: normalizeStatus(asset.assetStatus ?? asset.status),
    location: asset.location?.locationName ?? asset.location?.name ?? asset.locationName ?? `Location ${asset.locationId ?? "-"}`,
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
  }), [normalizeEmployeeStatus]);

  const mapMappingRecord = useCallback((mapping: any): MappingRecord => {
    const fullUserName = `${mapping?.user?.firstName ?? ""} ${mapping?.user?.lastName ?? ""}`.trim();

    return {
      assetName:
        mapping?.asset?.assetName ??
        mapping?.assetDetails?.assetName ??
        mapping?.assetName ??
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

  const recentAssets = useMemo(() => assets.slice(0, 4), [assets]);
  const recentMappings = useMemo(() => mappings.slice(0, 4), [mappings]);
  const totalTrackedEntities = assets.length + locations.length + mappings.length + users.length;
  const workingAssets = assets.filter((asset) => asset.status === "Working").length;
  const deferredAssets = assets.filter((asset) => asset.status === "Deferred").length;
  const activeEmployees = users.filter((user) => user.status === "Active").length;
  const dashboardMetrics = [
    { label: "Total Assets", value: assets.length, helper: "Tracked in the current workspace" },
    { label: "Working Assets", value: workingAssets, helper: "Ready for use" },
    { label: "Deferred Assets", value: deferredAssets, helper: "Pending review" },
    { label: "Active Employees", value: activeEmployees, helper: "Available for asset assignment" },
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
  ).map(([label, value]) => ({ label, value }));
  const readinessSnapshot = assets.length > 0 ? `${Math.round((workingAssets / assets.length) * 100)}%` : "0%";

  const renderLoadState = (title: string, description: string) => (
    <div className="asset-admin-empty-state">
      <h4>{title}</h4>
      <p>{description}</p>
    </div>
  );

  return (
    <div className="asset-admin-page">
      <div className="asset-admin-shell">
        <div className="asset-admin-hero asset-admin-dashboard-hero">
          <div>
            <p className="asset-admin-kicker">InfraPilot 360</p>
            <h2>IT Asset Dashboard</h2>
            <p>
              A live operational view of assets, locations, employees, and ownership mappings
              using the same backend APIs as the admin modules.
            </p>
          </div>
          <div className="asset-admin-hero-highlight">
            <span>Modules Ready</span>
            <strong>4 Core Modules</strong>
            <p>Assets, Locations, Asset Mapping, and Employees now stay aligned with backend data.</p>
          </div>
        </div>

        <div className="asset-admin-dashboard-band">
          <div className="asset-admin-band-card">
            <span>Total Operational Records</span>
            <strong>{totalTrackedEntities}</strong>
            <p>Combined entities across the live admin workspace.</p>
          </div>
          <div className="asset-admin-band-card">
            <span>Readiness Snapshot</span>
            <strong>{readinessSnapshot}</strong>
            <p>Percentage of tracked assets currently marked as working.</p>
          </div>
          <div className="asset-admin-band-card">
            <span>Assignment Coverage</span>
            <strong>{assets.length > 0 ? `${mappings.length}/${assets.length}` : "0/0"}</strong>
            <p>Assets currently represented in the ownership mapping module.</p>
          </div>
        </div>

        <div className="asset-admin-metrics">
          {dashboardMetrics.map((metric) => (
            <div key={metric.label} className="asset-admin-metric-card">
              <span>{metric.label}</span>
              <strong>{metric.value}</strong>
              <p>{metric.helper}</p>
            </div>
          ))}
        </div>

        {loadError && (
          <div className="asset-admin-table-card">
            <div className="asset-admin-empty-state">
              <h4>Unable to load dashboard data</h4>
              <p>{loadError}</p>
            </div>
          </div>
        )}

        <div className="asset-admin-grid">
          <section className="asset-admin-table-card">
            <div className="asset-admin-card-header">
              <div>
                <h3>Asset Status Summary</h3>
                <p>Quick operational view of device condition.</p>
              </div>
            </div>
            <div className="asset-admin-pill-grid">
              {statusBreakdown.map((item) => (
                <div key={item.label} className="asset-admin-pill-card">
                  <strong>{item.value}</strong>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="asset-admin-table-card">
            <div className="asset-admin-card-header">
              <div>
                <h3>Asset Type Summary</h3>
                <p>What kinds of devices are being tracked.</p>
              </div>
            </div>
            {isLoading ? (
              renderLoadState("Loading asset types", "Fetching asset summary from the backend.")
            ) : typeBreakdown.length > 0 ? (
              <div className="asset-admin-list">
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

        <div className="asset-admin-grid">
          <section className="asset-admin-table-card">
            <div className="asset-admin-card-header">
              <div>
                <h3>Recent Assets</h3>
                <p>Latest records available in the asset module.</p>
              </div>
            </div>
            {isLoading ? (
              renderLoadState("Loading assets", "Fetching recent assets from the backend.")
            ) : recentAssets.length > 0 ? (
              <div className="asset-admin-table-wrap">
                <table className="asset-admin-table">
                  <thead>
                    <tr>
                      <th>Device ID</th>
                      <th>Asset Name</th>
                      <th>Status</th>
                      <th>Location</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentAssets.map((asset) => (
                      <tr key={`${asset.deviceId}-${asset.id ?? asset.assetCode}`}>
                        <td>{asset.deviceId}</td>
                        <td>{asset.assetName}</td>
                        <td>
                          <span className={`asset-admin-status-pill status-${asset.status.toLowerCase().replace(/\s+/g, "-")}`}>
                            {asset.status}
                          </span>
                        </td>
                        <td>{asset.location}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              renderLoadState("No assets available", "Create assets to see recent activity here.")
            )}
          </section>

          <section className="asset-admin-table-card">
            <div className="asset-admin-card-header">
              <div>
                <h3>Recent Mapping Activity</h3>
                <p>Who is currently responsible for tracked assets.</p>
              </div>
            </div>
            {isLoading ? (
              renderLoadState("Loading mappings", "Fetching recent mapping activity from the backend.")
            ) : recentMappings.length > 0 ? (
              <div className="asset-admin-table-wrap">
                <table className="asset-admin-table">
                  <thead>
                    <tr>
                      <th>Asset</th>
                      <th>Employee ID</th>
                      <th>Responsible</th>
                      <th>Department</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentMappings.map((mapping) => (
                      <tr key={`${mapping.deviceId}-${mapping.employeeId}-${mapping.assignedOn}`}>
                        <td>{mapping.assetName}</td>
                        <td>{mapping.employeeId || "Not set"}</td>
                        <td>{mapping.assignedTo}</td>
                        <td>{mapping.department}</td>
                        <td>
                          {mapping.assignedOn
                            ? new Date(`${mapping.assignedOn}T00:00:00`).toLocaleDateString(undefined, {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })
                            : "Not set"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              renderLoadState("No mappings available", "Assign assets to employees to populate recent mapping activity.")
            )}
          </section>
        </div>

        <div className="asset-admin-grid">
          <section className="asset-admin-table-card">
            <div className="asset-admin-card-header">
              <div>
                <h3>Location Coverage</h3>
                <p>{locations.length} managed locations in the current workspace.</p>
              </div>
            </div>
            {isLoading ? (
              renderLoadState("Loading locations", "Fetching locations from the backend.")
            ) : locations.length > 0 ? (
              <div className="asset-admin-list">
                {locations.map((location) => (
                  <div key={`${location.code}-${location.name}`} className="asset-admin-list-row">
                    <span>{location.name}</span>
                    <strong>{location.code}</strong>
                  </div>
                ))}
              </div>
            ) : (
              renderLoadState("No locations available", "Create locations to use them in asset creation and mapping.")
            )}
          </section>

          <section className="asset-admin-table-card">
            <div className="asset-admin-card-header">
              <div>
                <h3>Employee Snapshot</h3>
                <p>{users.length} employees available for asset assignment.</p>
              </div>
            </div>
            {isLoading ? (
              renderLoadState("Loading employees", "Fetching employees from the backend.")
            ) : users.length > 0 ? (
              <div className="asset-admin-list">
                {users.map((user) => (
                  <div key={user.employeeId} className="asset-admin-list-row">
                    <span>{user.name}</span>
                    <strong>{user.role || user.status}</strong>
                  </div>
                ))}
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
