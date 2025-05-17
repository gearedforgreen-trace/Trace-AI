"use client";

import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table/data-table";
import { DataTableActions } from "@/components/ui/data-table/data-table-actions";
import { StatusBadge } from "@/components/ui/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { IStore } from "@/types";

interface IStoresTableProps {
  stores: IStore[];
  isLoading?: boolean;
  onEdit: (store: IStore) => void;
  onDelete: (store: IStore) => void;
}

export function StoresTable({
  stores,
  isLoading = false,
  onEdit,
  onDelete,
}: IStoresTableProps) {
  const columns = useMemo<ColumnDef<IStore>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => (
          <div className="font-medium">{row.getValue("name")}</div>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          // Convert status to lowercase for the StatusBadge component
          const status =
            (row.getValue("status") as string)?.toLowerCase() || "inactive";
          return <StatusBadge status={status} />;
        },
      },
      {
        accessorKey: "location",
        header: "Location",
        cell: ({ row }) => (
          <div className="hidden md:block">
            {row.original.city}, {row.original.state}
          </div>
        ),
      },
      {
        accessorKey: "description",
        header: "Description",
        cell: ({ row }) => (
          <div className="hidden lg:block max-w-[300px] truncate">
            {row.original.description || "No description"}
          </div>
        ),
      },
      {
        id: "actions",
        cell: ({ row }) => (
          <DataTableActions
            row={row}
            onEdit={() => onEdit(row.original)}
            onDelete={() => onDelete(row.original)}
          />
        ),
      },
    ],
    [onEdit, onDelete]
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <DataTable columns={columns} data={stores} />
    </div>
  );
}
