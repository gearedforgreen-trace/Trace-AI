"use client";

import { useCallback, useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table/data-table";
import { DataTableActions } from "@/components/ui/data-table/data-table-actions";
import { StatusBadge } from "@/components/ui/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { IBin } from "@/types";
import { DataTablePagination } from "@/components/ui/data-table/data-table-pagination";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { QRCodeComponent } from "@/components/ui/qr-code";
import { QRCodeModal } from "@/components/ui/qr-code-modal";

interface IBinsTableProps {
  bins: IBin[];
  isLoading?: boolean;
  onEdit: (bin: IBin) => void;
  onDelete: (bin: IBin) => void;
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

export function BinsTable({
  bins,
  isLoading = false,
  onEdit,
  onDelete,
  pagination,
  onPageChange,
}: IBinsTableProps) {
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [selectedBin, setSelectedBin] = useState<IBin | null>(null);
  const [selectedBinUrl, setSelectedBinUrl] = useState<string>("");

  const openQrModal = useCallback((bin: IBin) => {
    console.log("Opening QR modal with URL:", bin.id);
    setSelectedBin(bin);
    setSelectedBinUrl(bin.id);
    setQrModalOpen(true);
  }, []);

  const closeQrModal = () => {
    setQrModalOpen(false);
    setSelectedBin(null);
    setSelectedBinUrl("");
  };

  const columns = useMemo<ColumnDef<IBin>[]>(
    () => [
      {
        accessorKey: "number",
        header: "Bin Number",
        cell: ({ row }) => (
          <div className="font-medium">{row.getValue("number")}</div>
        ),
      },
      {
        accessorKey: "material",
        header: "Material",
        cell: ({ row }) => (
          <div>{row.original.material?.name || "Unknown"}</div>
        ),
      },
      {
        accessorKey: "store",
        header: "Store",
        cell: ({ row }) => <div>{row.original.store?.name || "Unknown"}</div>,
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          // Convert status to lowercase for the StatusBadge component
          const status = (row.getValue("status") as string).toLowerCase();
          return <StatusBadge status={status} />;
        },
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
        id: "qrCode",
        header: "QR Code",
        cell: ({ row }) => {
          return (
            <div className="flex justify-center">
              <QRCodeComponent 
                value={row.original.id} 
                size={64} 
                clickable={true}
                onClick={() => openQrModal(row.original)}
              />
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
    ],
    [onEdit, onDelete, openQrModal]
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
                <th className="h-10 px-4 text-left font-medium">Bin Number</th>
                <th className="h-10 px-4 text-left font-medium">Material</th>
                <th className="h-10 px-4 text-left font-medium">Store</th>
                <th className="h-10 px-4 text-left font-medium">Status</th>
                <th className="h-10 px-4 text-left font-medium hidden lg:table-cell">
                  Description
                </th>
                <th className="h-10 px-4 text-center font-medium">QR Code</th>
                <th className="h-10 px-4 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bins.length > 0 ? (
                bins.map((bin) => (
                  <tr key={bin.id} className="border-b">
                    <td className="p-4 align-middle font-medium">
                      {bin.number}
                    </td>
                    <td className="p-4 align-middle">
                      {bin.material?.name || "Unknown"}
                    </td>
                    <td className="p-4 align-middle">
                      {bin.store?.name || "Unknown"}
                    </td>
                    <td className="p-4 align-middle">
                      <StatusBadge status={bin.status.toLowerCase()} />
                    </td>
                    <td className="p-4 align-middle hidden lg:table-cell max-w-[300px] truncate">
                      {bin.description || "No description"}
                    </td>
                    <td className="p-4 align-middle text-center">
                      <QRCodeComponent 
                        value={`${process.env.NEXT_PUBLIC_BASE_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000')}/bins/${bin.id}`} 
                        size={64} 
                        clickable={true}
                        onClick={() => openQrModal(bin)}
                      />
                    </td>
                    <td className="p-4 align-middle text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => onEdit(bin)}
                        >
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="text-red-500 hover:text-red-600"
                          onClick={() => onDelete(bin)}
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
                  <td colSpan={7} className="h-24 text-center">
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
        
        <QRCodeModal
          isOpen={qrModalOpen}
          onClose={closeQrModal}
          value={selectedBinUrl}
          title={`QR Code - Bin ${selectedBin?.number || ""}`}
          binNumber={selectedBin?.number || ""}
        />
      </div>
    );
  }

  // Otherwise, use the built-in pagination
  return (
    <div className="space-y-4">
      <DataTable columns={columns} data={bins} pageSize={20} />
      
      <QRCodeModal
        isOpen={qrModalOpen}
        onClose={closeQrModal}
        value={selectedBinUrl}
        title={`QR Code - Bin ${selectedBin?.number || ""}`}
        binNumber={selectedBin?.number || ""}
      />
    </div>
  );
}
