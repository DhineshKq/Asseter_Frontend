import React from "react";
import {
  assets,
  locations,
  mappings,
  users,
} from "../../data/asset-admin-data";
import "../../styles/pages/asset-admin/asset-admin.scss";

export default function DashboardMain() {
  const recentAssets = assets.slice(0, 4);
  const recentMappings = mappings.slice(0, 4);
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
      accumulator.set(asset.type, (accumulator.get(asset.type) ?? 0) + 1);
      return accumulator;
    }, new Map())
  ).map(([label, value]) => ({ label, value }));
  const readinessSnapshot = assets.length > 0 ? `${Math.round((workingAssets / assets.length) * 100)}%` : "0%";

  return (
    <div className="asset-admin-page">
      <div className="asset-admin-shell">
        <div className="asset-admin-hero asset-admin-dashboard-hero">
          <div>
            <p className="asset-admin-kicker">Asseter Admin Console</p>
            <h2>IT Asset Dashboard</h2>
            <p>
              A frontend starter for the admin to manage assets, locations, employee mapping,
              and ownership records from a single workspace.
            </p>
          </div>
          <div className="asset-admin-hero-highlight">
            <span>Modules Ready</span>
            <strong>4 Core Modules</strong>
            <p>Assets, Locations, Asset Mapping, and Employees are now reflected in the UI structure.</p>
          </div>
        </div>

        <div className="asset-admin-dashboard-band">
          <div className="asset-admin-band-card">
            <span>Total Operational Records</span>
            <strong>{totalTrackedEntities}</strong>
            <p>Combined entities across the frontend workspace preview.</p>
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
            {typeBreakdown.length > 0 ? (
              <div className="asset-admin-list">
                {typeBreakdown.map((item) => (
                  <div key={item.label} className="asset-admin-list-row">
                    <span>{item.label}</span>
                    <strong>{item.value}</strong>
                  </div>
                ))}
              </div>
            ) : (
              <div className="asset-admin-empty-state">
                <h4>No asset types available</h4>
                <p>Add assets to populate the type summary.</p>
              </div>
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
            {recentAssets.length > 0 ? (
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
                      <tr key={asset.deviceId}>
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
              <div className="asset-admin-empty-state">
                <h4>No assets available</h4>
                <p>Create assets to see recent activity here.</p>
              </div>
            )}
          </section>

          <section className="asset-admin-table-card">
            <div className="asset-admin-card-header">
              <div>
                <h3>Recent Mapping Activity</h3>
                <p>Who is currently responsible for tracked assets.</p>
              </div>
            </div>
            {recentMappings.length > 0 ? (
              <div className="asset-admin-table-wrap">
                <table className="asset-admin-table">
                  <thead>
                    <tr>
                      <th>Asset</th>
                      <th>Responsible</th>
                      <th>Department</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentMappings.map((mapping) => (
                      <tr key={mapping.deviceId}>
                        <td>{mapping.assetName}</td>
                        <td>{mapping.assignedTo}</td>
                        <td>{mapping.department}</td>
                        <td>{new Date(`${mapping.assignedOn}T00:00:00`).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="asset-admin-empty-state">
                <h4>No mappings available</h4>
                <p>Assign assets to employees to populate recent mapping activity.</p>
              </div>
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
            {locations.length > 0 ? (
              <div className="asset-admin-list">
                {locations.map((location) => (
                  <div key={location.code} className="asset-admin-list-row">
                    <span>{location.name}</span>
                    <strong>{location.code}</strong>
                  </div>
                ))}
              </div>
            ) : (
              <div className="asset-admin-empty-state">
                <h4>No locations available</h4>
                <p>Create locations to use them in asset creation and mapping.</p>
              </div>
            )}
          </section>

          <section className="asset-admin-table-card">
            <div className="asset-admin-card-header">
              <div>
                <h3>Employee Snapshot</h3>
                <p>{users.length} employees available for asset assignment.</p>
              </div>
            </div>
            {users.length > 0 ? (
              <div className="asset-admin-list">
                {users.map((user) => (
                  <div key={user.employeeId} className="asset-admin-list-row">
                    <span>{user.name}</span>
                    <strong>{user.role}</strong>
                  </div>
                ))}
              </div>
            ) : (
              <div className="asset-admin-empty-state">
                <h4>No employees available</h4>
                <p>Add employees before mapping assets against them.</p>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
