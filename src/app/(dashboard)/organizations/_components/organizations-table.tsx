"use client";

import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table/data-table";
import { DataTableActions } from "@/components/ui/data-table/data-table-actions";
import { Skeleton } from "@/components/ui/skeleton";
import type { Organization } from "@/types";
import { DataTablePagination } from "@/components/ui/data-table/data-table-pagination";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Building, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";

interface IOrganizationsTableProps {
  organizations: Organization[];
  isLoading?: boolean;
  onEdit: (organization: Organization) => void;
  onDelete: (organization: Organization) => void;
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

export function OrganizationsTable({
  organizations,
  isLoading = false,
  onEdit,
  onDelete,
  pagination,
  onPageChange,
}: IOrganizationsTableProps) {
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
                <th className="h-10 px-4 text-left font-medium">Logo</th>
                <th className="h-10 px-4 text-left font-medium">Name</th>
                <th className="h-10 px-4 text-left font-medium">Slug</th>
                <th className="h-10 px-4 text-left font-medium hidden md:table-cell">
                  Created
                </th>
                <th className="h-10 px-4 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {organizations.length > 0 ? (
                organizations.map((organization) => (
                  <tr key={organization.id} className="border-b">
                    <td className="p-4 align-middle">
                      {organization.logo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img 
                          src={organization.logo} 
                          alt={organization.name}
                          className="h-8 w-8 rounded-md object-cover"
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-md  flex items-center justify-center">
                          <Building className="h-4 w-4 " />
                        </div>
                      )}
                    </td>
                    <td className="p-4 align-middle font-medium">
                      <Link 
                        href={`/organizations/${organization.id}/dashboard`}
                        className="hover:underline flex items-center gap-2"
                      >
                        {organization.name}
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    </td>
                    <td className="p-4 align-middle ">
                      {organization.slug || "-"}
                    </td>
                    <td className="p-4 align-middle hidden md:table-cell">
                      {format(new Date(organization.createdAt), "MMM d, yyyy")}
                    </td>
                    <td className="p-4 align-middle text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => onEdit(organization)}
                        >
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="text-red-500 hover:text-red-600"
                          onClick={() => onDelete(organization)}
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
                    No organizations found.
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
  const columns: ColumnDef<Organization>[] = [
    {
      accessorKey: "logo",
      header: "Logo",
      cell: ({ row }) => {
        const logo = row.original.logo;
        return logo ? (
          <img 
            src={logo} 
            alt={row.original.name}
            className="h-8 w-8 rounded-md object-cover"
          />
        ) : (
          <div className="h-8 w-8 rounded-md  flex items-center justify-center">
            <Building className="h-4 w-4 " />
          </div>
        );
      },
    },
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <Link 
          href={`/organizations/${row.original.id}/dashboard`}
          className="font-medium hover:underline flex items-center gap-2"
        >
          {row.getValue("name")}
          <ExternalLink className="h-3 w-3" />
        </Link>
      ),
    },
    {
      accessorKey: "slug",
      header: "Slug",
      cell: ({ row }) => (
        <div className="">{row.getValue("slug") || "-"}</div>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }) => {
        const createdAt = row.getValue("createdAt") as string;
        return (
          <div className="hidden md:block">
            {format(new Date(createdAt), "MMM d, yyyy")}
          </div>
        );
      },
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
  ];

  return (
    <div className="space-y-4">
      <DataTable columns={columns} data={organizations} pageSize={20} />
    </div>
  );
}