import React from "react";
import { DEFAULT_TABLE_PAGE_SIZE, TablePagination, useTablePagination } from "../common-component/tables";
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
  onActionClick?: () => void;
  headerActions?: React.ReactNode;
  onEditRow?: (row: T, index: number) => void;
  renderRowActions?: (row: T, index: number) => React.ReactNode;
  metrics: MetricItem[];
  columns: Column<T>[];
  rows: T[];
  totalRowCount?: number;
  tableControls?: React.ReactNode;
  emptyState?: {
    title: string;
    description: string;
  };
  children?: React.ReactNode;
}

export default function AdminModulePage<T extends object>({
  title,
  subtitle,
  actionLabel,
  onActionClick,
  headerActions,
  onEditRow,
  renderRowActions,
  metrics,
  columns,
  rows,
  totalRowCount,
  tableControls,
  emptyState,
  children,
}: AdminModulePageProps<T>) {
  const {
    currentPage,
    endItem,
    paginatedRows,
    setCurrentPage,
    startItem,
    totalItems,
  } = useTablePagination(rows, { pageSize: DEFAULT_TABLE_PAGE_SIZE, resetDeps: [rows] });
  const displayCount = paginatedRows.length;
  const totalCount = totalRowCount ?? rows.length;
  const maxCellLength = 10;

  const truncateText = (text: string) =>
    text.length > maxCellLength ? `${text.slice(0, maxCellLength)}...` : text;

  const formatCellValue = (value: unknown) => {
    if (value === null || value === undefined || value === "") {
      return <span className="asset-admin-cell-muted">Not set</span>;
    }

    if (React.isValidElement(value)) {
      return value;
    }

    if (typeof value === "number") {
      return value.toLocaleString();
    }

    const text = String(value);
    const lowerText = text.toLowerCase();

    if (
      ["working", "active", "in repair", "deferred", "retired", "on leave", "inactive"].includes(
        lowerText
      )
    ) {
      return <span className={`asset-admin-status-pill status-${lowerText.replace(/\s+/g, "-")}`}>{text}</span>;
    }

    if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
      return new Date(`${text}T00:00:00`).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    }

    return (
      <span className="asset-admin-cell-text" title={text}>
        {truncateText(text)}
      </span>
    );
  };

  return (
    <div className="asset-admin-page">
      <div className="asset-admin-shell">
        <div className="asset-admin-hero">
          <div className="asset-admin-hero-copy">
            <p className="asset-admin-kicker">IT Asset Administration</p>
            <h2>{title}</h2>
            <p>{subtitle}</p>
            <div className="asset-admin-hero-meta">
              <span>Operational workspace</span>
              <span>{totalCount} active records</span>
              <span>{columns.length} tracked fields</span>
            </div>
          </div>
          <div className="asset-admin-hero-actions">
            {headerActions}
            <button type="button" className="asset-admin-primary-btn" onClick={onActionClick}>
              {actionLabel}
            </button>
          </div>
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
              <p>
                Showing {startItem}-{endItem} of {totalItems} visible records from {totalCount} total entries in the current frontend prototype.
              </p>
            </div>
            <div className="asset-admin-card-toolbar">
              <span>{DEFAULT_TABLE_PAGE_SIZE} per page</span>
              <span>{totalItems} items</span>
              <span>Live frontend preview</span>
            </div>
          </div>

          {tableControls && <div className="asset-admin-table-controls">{tableControls}</div>}

          <div className="asset-admin-table-wrap">
            {rows.length > 0 ? (
              <table className="asset-admin-table">
                <thead>
                  <tr>
                    {columns.map((column) => (
                      <th key={String(column.key)}>{column.label}</th>
                    ))}
                    {(onEditRow || renderRowActions) && <th>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {paginatedRows.map((row, index) => {
                    const rowIndex = startItem > 0 ? startItem - 1 + index : index;

                    return (
                      <tr key={`${String(row[columns[0].key])}-${rowIndex}`}>
                        {columns.map((column) => (
                          <td key={String(column.key)}>
                            {formatCellValue(row[column.key])}
                          </td>
                        ))}
                        {(onEditRow || renderRowActions) && (
                          <td>
                            <div className="asset-admin-row-actions">
                              {onEditRow && (
                                <button
                                  type="button"
                                  className="asset-admin-secondary-btn"
                                  onClick={() => onEditRow(row, rowIndex)}
                                >
                                  Edit
                                </button>
                              )}
                              {renderRowActions?.(row, rowIndex)}
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="asset-admin-empty-state">
                <h4>{emptyState?.title ?? `No ${title.toLowerCase()} records found`}</h4>
                <p>{emptyState?.description ?? "Adjust your filters or add a new record to get started."}</p>
              </div>
            )}
          </div>
          <TablePagination
            currentPage={currentPage}
            pageSize={DEFAULT_TABLE_PAGE_SIZE}
            totalItems={totalItems}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
      {children}
    </div>
  );
}
