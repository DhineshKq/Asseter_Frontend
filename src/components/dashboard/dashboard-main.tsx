import React from "react";
import {
  assets,
  dashboardMetrics,
  locations,
  mappings,
  statusBreakdown,
  typeBreakdown,
  users,
} from "../../data/asset-admin-data";
import "../../styles/pages/asset-admin/asset-admin.scss";

export default function DashboardMain() {
  const recentAssets = assets.slice(0, 4);
  const recentMappings = mappings.slice(0, 4);

  return (
    <div className="asset-admin-page">
      <div className="asset-admin-shell">
        <div className="asset-admin-hero asset-admin-dashboard-hero">
          <div>
            <p className="asset-admin-kicker">Asseter Admin Console</p>
            <h2>IT Asset Dashboard</h2>
            <p>
              A frontend starter for IT admins to manage assets, locations, responsibility mapping,
              and user records from a single workspace.
            </p>
          </div>
          <div className="asset-admin-hero-highlight">
            <span>Modules Ready</span>
            <strong>4 Core Modules</strong>
            <p>Assets, Locations, Asset Mapping, and Users are now reflected in the UI structure.</p>
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
            <div className="asset-admin-list">
              {typeBreakdown.map((item) => (
                <div key={item.label} className="asset-admin-list-row">
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="asset-admin-grid">
          <section className="asset-admin-table-card">
            <div className="asset-admin-card-header">
              <div>
                <h3>Recent Assets</h3>
                <p>Latest sample records for the asset module.</p>
              </div>
            </div>
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
                      <td>{asset.status}</td>
                      <td>{asset.location}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="asset-admin-table-card">
            <div className="asset-admin-card-header">
              <div>
                <h3>Recent Mapping Activity</h3>
                <p>Who is currently responsible for tracked assets.</p>
              </div>
            </div>
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
                      <td>{mapping.assignedOn}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <div className="asset-admin-grid">
          <section className="asset-admin-table-card">
            <div className="asset-admin-card-header">
              <div>
                <h3>Location Coverage</h3>
                <p>{locations.length} managed locations in the current prototype.</p>
              </div>
            </div>
            <div className="asset-admin-list">
              {locations.map((location) => (
                <div key={location.code} className="asset-admin-list-row">
                  <span>{location.name}</span>
                  <strong>{location.assetsCount} assets</strong>
                </div>
              ))}
            </div>
          </section>

          <section className="asset-admin-table-card">
            <div className="asset-admin-card-header">
              <div>
                <h3>User Snapshot</h3>
                <p>{users.length} users ready for admin management.</p>
              </div>
            </div>
            <div className="asset-admin-list">
              {users.map((user) => (
                <div key={user.employeeId} className="asset-admin-list-row">
                  <span>{user.name}</span>
                  <strong>{user.role}</strong>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
