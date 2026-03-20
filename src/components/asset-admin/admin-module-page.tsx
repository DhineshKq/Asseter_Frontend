import React from "react";
import "../../styles/pages/asset-admin/asset-admin.scss";

interface MetricItem {
  label: string;
  value: string | number;
  helper: string;
}

interface Column<T> {
  key: keyof T;
  label: string;
}

interface AdminModulePageProps<T extends object> {
  title: string;
  subtitle: string;
  actionLabel: string;
  metrics: MetricItem[];
  columns: Column<T>[];
  rows: T[];
}

export default function AdminModulePage<T extends object>({
  title,
  subtitle,
  actionLabel,
  metrics,
  columns,
  rows,
}: AdminModulePageProps<T>) {
  return (
    <div className="asset-admin-page">
      <div className="asset-admin-shell">
        <div className="asset-admin-hero">
          <div>
            <p className="asset-admin-kicker">IT Asset Administration</p>
            <h2>{title}</h2>
            <p>{subtitle}</p>
          </div>
          <button type="button" className="asset-admin-primary-btn">
            {actionLabel}
          </button>
        </div>

        <div className="asset-admin-metrics">
          {metrics.map((metric) => (
            <div key={metric.label} className="asset-admin-metric-card">
              <span>{metric.label}</span>
              <strong>{metric.value}</strong>
              <p>{metric.helper}</p>
            </div>
          ))}
        </div>

        <div className="asset-admin-table-card">
          <div className="asset-admin-card-header">
            <div>
              <h3>{title} Records</h3>
              <p>{rows.length} records available in the current frontend prototype.</p>
            </div>
          </div>

          <div className="asset-admin-table-wrap">
            <table className="asset-admin-table">
              <thead>
                <tr>
                  {columns.map((column) => (
                    <th key={String(column.key)}>{column.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr key={`${String(row[columns[0].key])}-${index}`}>
                    {columns.map((column) => (
                      <td key={String(column.key)}>
                        {String(row[column.key] ?? "")}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
