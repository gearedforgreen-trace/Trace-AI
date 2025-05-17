"use client";

import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { DataTable } from "@/components/ui/data-table/data-table";
import { DataTableActions } from "@/components/ui/data-table/data-table-actions";
import { Skeleton } from "@/components/ui/skeleton";
import { DataTablePagination } from "@/components/ui/data-table/data-table-pagination";
import { formatDate } from "@/lib/utils";
import type { IMaterial } from "@/types";

interface IMaterialsTableProps {
  materials: IMaterial[];
  isLoading?: boolean;
  onEdit: (material: IMaterial) => void;
  onDelete: (material: IMaterial) => void;
  pagination?: {
    currentPage: number;
    perPage: number;
    total: number;
    lastPage: number;
    prev: number | null;
    next: number | null;
  };
  onPageChange?: (page: number) => void;
}

export function MaterialsTable({
  materials,
  isLoading = false,
  onEdit,
  onDelete,
  pagination,
  onPageChange,
}: IMaterialsTableProps) {
  const columns = useMemo<ColumnDef<IMaterial>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => (
          <div className="font-medium">{row.getValue("name")}</div>
        ),
      },
      {
        accessorKey: "description",
        header: "Description",
        cell: ({ row }) => (
          <div className="max-w-[300px] truncate">
            {row.original.description || "No description"}
          </div>
        ),
      },
      {
        accessorKey: "rewardRule",
        header: "Reward Rule",
        cell: ({ row }) => {
          const rewardRule = row.original.rewardRule;
          return rewardRule ? (
            <div className="flex flex-col">
              <span className="text-sm font-medium">{rewardRule.unitType}</span>
              <span className="text-xs text-muted-foreground">
                {rewardRule.unit} {rewardRule.unitType} = {rewardRule.point}{" "}
                points
              </span>
            </div>
          ) : (
            "—"
          );
        },
      },
      {
        accessorKey: "createdAt",
        header: "Created At",
        cell: ({ row }) => formatDate(row.original.createdAt),
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

  // If we have external pagination, use that instead of the built-in pagination
  if (pagination && onPageChange) {
    return (
      <div className="space-y-4">
        <div className="rounded-md border">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="h-10 px-4 text-left font-medium">Name</th>
                <th className="h-10 px-4 text-left font-medium">Description</th>
                <th className="h-10 px-4 text-left font-medium">Reward Rule</th>
                <th className="h-10 px-4 text-left font-medium">Created At</th>
                <th className="h-10 px-4 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {materials.length > 0 ? (
                materials.map((material) => (
                  <tr key={material.id} className="border-b">
                    <td className="p-4 align-middle font-medium">
                      {material.name}
                    </td>
                    <td className="p-4 align-middle max-w-[300px] truncate">
                      {material.description || "No description"}
                    </td>
                    <td className="p-4 align-middle">
                      {material.rewardRule ? (
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">
                            {material.rewardRule.unitType}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {material.rewardRule.unit}{" "}
                            {material.rewardRule.unitType} ={" "}
                            {material.rewardRule.point} points
                          </span>
                        </div>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="p-4 align-middle">
                      {formatDate(material.createdAt)}
                    </td>
                    <td className="p-4 align-middle text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => onEdit(material)}
                        >
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="text-red-500 hover:text-red-600"
                          onClick={() => onDelete(material)}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="h-24 text-center">
                    No results found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <DataTablePagination
          table={{} as any}
          currentPage={pagination.currentPage}
          lastPage={pagination.lastPage}
          totalItems={pagination.total}
          onPageChange={onPageChange}
          isExternalPagination={true}
        />
      </div>
    );
  }

  // Otherwise, use the built-in pagination
  return (
    <div className="space-y-4">
      <DataTable columns={columns} data={materials} pageSize={20} />
    </div>
  );
}
