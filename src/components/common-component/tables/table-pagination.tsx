import React, { useEffect, useMemo, useState } from "react";

interface UseTablePaginationOptions {
  pageSize?: number;
  resetDeps?: React.DependencyList;
}

interface TablePaginationProps {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  itemLabel?: string;
  onPageChange: (page: number) => void;
}

export const DEFAULT_TABLE_PAGE_SIZE = 10;

export const useTablePagination = <T,>(
  rows: T[],
  options: UseTablePaginationOptions = {}
) => {
  const pageSize = options.pageSize ?? DEFAULT_TABLE_PAGE_SIZE;
  const resetDeps = options.resetDeps ?? [];
  const [currentPage, setCurrentPage] = useState(1);

  const totalItems = rows.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  useEffect(() => {
    setCurrentPage((previousPage) => Math.min(previousPage, totalPages));
  }, [totalPages]);

  useEffect(() => {
    setCurrentPage(1);
  }, resetDeps);

  const paginatedRows = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return rows.slice(startIndex, startIndex + pageSize);
  }, [currentPage, pageSize, rows]);

  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return {
    currentPage,
    endItem,
    pageSize,
    paginatedRows,
    setCurrentPage,
    startItem,
    totalItems,
    totalPages,
  };
};

export function TablePagination({
  currentPage,
  pageSize,
  totalItems,
  itemLabel = "records",
  onPageChange,
}: TablePaginationProps) {
  if (totalItems <= pageSize) {
    return null;
  }

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="table-pagination" aria-label={`${itemLabel} pagination`}>
      <div className="table-pagination__summary">
        Showing {startItem}-{endItem} of {totalItems} {itemLabel}
      </div>
      <div className="table-pagination__actions">
        <button
          type="button"
          className="table-pagination__button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        <span className="table-pagination__page-indicator">
          Page {currentPage} of {totalPages}
        </span>
        <button
          type="button"
          className="table-pagination__button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
}
