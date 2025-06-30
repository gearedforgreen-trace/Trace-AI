'use client';

import { useMemo } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/ui/data-table/data-table';
import { DataTableActions } from '@/components/ui/data-table/data-table-actions';
import { StatusBadge } from '@/components/ui/status-badge';
import { Skeleton } from '@/components/ui/skeleton';
import type { IStore } from '@/types';
import { DataTablePagination } from '@/components/ui/data-table/data-table-pagination';
// Import Button, Edit, and Trash2 components
import { Button } from '@/components/ui/button';
import { Edit, ExternalLink, Trash2 } from 'lucide-react';
import Link from "next/link";

interface IStoresTableProps {
  stores: IStore[];
  isLoading?: boolean;
  onEdit: (store: IStore) => void;
  onDelete: (store: IStore) => void;
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

export function StoresTable({
  stores,
  isLoading = false,
  onEdit,
  onDelete,
  pagination,
  onPageChange,
}: IStoresTableProps) {
  const columns = useMemo<ColumnDef<IStore>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Name',
        cell: ({ row }) => (
          <div className="font-medium">{row.getValue('name')}</div>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
          // Convert status to lowercase for the StatusBadge component
          const status = (row.getValue('status') as string).toLowerCase();
          return <StatusBadge status={status} />;
        },
      },
      {
        accessorKey: 'location',
        header: 'Location',
        cell: ({ row }) => (
          <div className="hidden md:block">
            {row.original.city}, {row.original.state}
          </div>
        ),
      },
      {
        accessorKey: 'description',
        header: 'Description',
        cell: ({ row }) => (
          <div className="hidden lg:block max-w-[300px] truncate">
            {row.original.description || 'No description'}
          </div>
        ),
      },
      {
        id: 'actions',
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
                <th className="h-10 px-4 text-left font-medium">Organization</th>
                <th className="h-10 px-4 text-left font-medium">Status</th>
                <th className="h-10 px-4 text-left font-medium hidden md:table-cell">
                  Location
                </th>
                <th className="h-10 px-4 text-left font-medium hidden lg:table-cell">
                  Description
                </th>
                <th className="h-10 px-4 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {stores.length > 0 ? (
                stores.map((store: any) => (
                  <tr key={store.id} className="border-b">
                    <td className="p-4 align-middle font-medium">
                      {store.name}
                    </td>
                    <td className="p-4 align-middle font-medium">
                      {store.organizationName ? (
                        <Link
                          href={`/organizations/${store.organizationId}/dashboard`}
                          className="hover:underline flex items-center gap-2"
                      >
                        {store.organizationName}
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                      ) : (
                        ''
                      )}
                    </td>

                    <td className="p-4 align-middle">
                      <StatusBadge status={store.status ? store.status.toLowerCase() : ''} />
                    </td>
                    <td className="p-4 align-middle hidden md:table-cell">
                      {store.city}, {store.state}
                    </td>
                    <td className="p-4 align-middle hidden lg:table-cell max-w-[300px] truncate">
                      {store.description || 'No description'}
                    </td>
                    <td className="p-4 align-middle text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => onEdit(store)}
                        >
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="text-red-500 hover:text-red-600"
                          onClick={() => onDelete(store)}
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
      <DataTable columns={columns} data={stores} pageSize={20} />
    </div>
  );
}
