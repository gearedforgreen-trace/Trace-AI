"use client";

import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table/data-table";
import { DataTableActions } from "@/components/ui/data-table/data-table-actions";
import { EntityImage } from "@/components/ui/entity-image";
import { StatusBadge } from "@/components/ui/status-badge";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import type { IStore } from "@/types";

interface StoresTableProps {
  stores: IStore[];
  onEdit: (store: IStore) => void;
  onDelete: (store: IStore) => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export function StoresTable({
  stores,
  onEdit,
  onDelete,
  searchTerm,
  onSearchChange,
}: StoresTableProps) {
  const columns = useMemo<ColumnDef<IStore>[]>(
    () => [
      {
        accessorKey: "imageUrl",
        header: "Image",
        cell: ({ row }) => (
          <EntityImage
            src={row.original.imageUrl}
            alt={row.original.name}
            size={40}
          />
        ),
      },
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
        cell: ({ row }) => <StatusBadge status={row.getValue("status")} />,
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
            {row.original.description}
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

  // Filter data based on search term
  const filteredData = useMemo(() => {
    if (!searchTerm) return stores;

    return stores.filter(
      (store) =>
        store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        store.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        store.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        store.state.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [stores, searchTerm]);

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search stores..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-8"
        />
      </div>

      <DataTable columns={columns} data={filteredData} />
    </div>
  );
}
