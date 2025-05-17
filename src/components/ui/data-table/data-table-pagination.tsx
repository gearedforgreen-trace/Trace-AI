"use client";

import type { Table } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

interface DataTablePaginationProps<TData> {
  table: Table<TData>;
  currentPage?: number;
  lastPage?: number;
  totalItems?: number;
  onPageChange?: (page: number) => void;
  isExternalPagination?: boolean;
}

export function DataTablePagination<TData>({
  table,
  currentPage,
  lastPage,
  totalItems,
  onPageChange,
  isExternalPagination = false,
}: DataTablePaginationProps<TData>) {
  // Use either the provided pagination props or the table's internal pagination
  const pageIndex = isExternalPagination
    ? currentPage || 1
    : table.getState().pagination.pageIndex + 1;
  const pageCount = isExternalPagination ? lastPage || 1 : table.getPageCount();
  const total = isExternalPagination
    ? totalItems || 0
    : table.getFilteredRowModel().rows.length;
  const pageSize = isExternalPagination
    ? 20
    : table.getState().pagination.pageSize;

  // Calculate the range of items being displayed
  const rangeStart = (pageIndex - 1) * pageSize + 1;
  const rangeEnd = Math.min(pageIndex * pageSize, total);

  // Handle page changes
  const handlePageChange = (page: number) => {
    if (page < 1 || page > pageCount) return;

    if (isExternalPagination && onPageChange) {
      onPageChange(page);
    } else {
      table.setPageIndex(page - 1);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4">
      <div className="flex-1 text-sm text-muted-foreground">
        {total > 0 ? (
          <>
            Showing <span className="font-medium">{rangeStart}</span> to{" "}
            <span className="font-medium">{rangeEnd}</span> of{" "}
            <span className="font-medium">{total}</span> items
          </>
        ) : (
          "No results found"
        )}
      </div>

      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(1)}
          disabled={pageIndex === 1}
          className="hidden sm:flex"
        >
          <ChevronsLeft className="h-4 w-4" />
          <span className="sr-only">First Page</span>
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(pageIndex - 1)}
          disabled={pageIndex === 1}
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">Previous Page</span>
        </Button>

        <div className="text-sm font-medium">
          Page {pageIndex} of {pageCount}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(pageIndex + 1)}
          disabled={pageIndex === pageCount}
        >
          <ChevronRight className="h-4 w-4" />
          <span className="sr-only">Next Page</span>
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(pageCount)}
          disabled={pageIndex === pageCount}
          className="hidden sm:flex"
        >
          <ChevronsRight className="h-4 w-4" />
          <span className="sr-only">Last Page</span>
        </Button>
      </div>
    </div>
  );
}
