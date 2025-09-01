"use client";

import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table/data-table";
import { DataTableActions } from "@/components/ui/data-table/data-table-actions";
import { StatusBadge } from "@/components/ui/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import type { Coupon } from "@/types";
import { DataTablePagination } from "@/components/ui/data-table/data-table-pagination";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Star, StarOff, Copy, Check } from "lucide-react";
import { toast } from "sonner";

interface CouponsTableProps {
  coupons: Coupon[];
  isLoading?: boolean;
  onEdit: (coupon: Coupon) => void;
  onDelete: (coupon: Coupon) => void;
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

export function CouponsTable({
  coupons,
  isLoading = false,
  onEdit,
  onDelete,
  pagination,
  onPageChange,
}: CouponsTableProps) {
  const columns = useMemo<ColumnDef<Coupon>[]>(
    () => [
      {
        accessorKey: "imageUrl",
        header: "Image",
        cell: ({ row }) => {
          const imageUrl = row.getValue("imageUrl") as string;
          return imageUrl ? (
            <img 
              src={imageUrl} 
              alt={row.original.name}
              className="w-8 h-8 object-cover rounded"
            />
          ) : (
            <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
              <span className="text-[10px] text-gray-500">No Image</span>
            </div>
          );
        },
      },
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => (
          <div className="font-medium text-xs">{row.getValue("name")}</div>
        ),
      },
      {
        accessorKey: "couponType",
        header: "Type",
        cell: ({ row }) => (
          <Badge variant="outline" className="capitalize text-xs px-1 py-0">
            {row.getValue("couponType")}
          </Badge>
        ),
      },
      {
        accessorKey: "dealType",
        header: "Deal Type",
        cell: ({ row }) => (
          <Badge variant="secondary" className="capitalize text-xs px-1 py-0">
            {row.getValue("dealType")}
          </Badge>
        ),
      },
      {
        accessorKey: "discountAmount",
        header: "Discount",
        cell: ({ row }) => {
          const discount = row.getValue("discountAmount") as number;
          const dealType = row.original.dealType;
          return (
            <div className="font-medium text-xs">
              {dealType === "percentage" ? `${discount}%` : `$${discount}`}
            </div>
          );
        },
      },
      {
        accessorKey: "pointsToRedeem",
        header: "Points Required",
        cell: ({ row }) => (
          <div className="font-medium text-green-600 text-xs">
            {row.getValue("pointsToRedeem")} pts
          </div>
        ),
      },
      {
        accessorKey: "couponUrl",
        header: "Coupon URL",
        cell: ({ row }) => {
          const url = row.original.couponUrl as string | null | undefined;
          return url ? (
            <div className="flex items-center gap-1 max-w-[200px]">
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="truncate text-blue-600 hover:underline text-xs"
                title={url}
              >
                {url}
              </a>
              <CopyButton url={url} />
            </div>
          ) : (
            <span className="text-muted-foreground text-xs">No Url</span>
          );
        },
      },
      {
        accessorKey: "isFeatured",
        header: "Featured",
        cell: ({ row }) => {
          const isFeatured = row.getValue("isFeatured") as boolean;
          return isFeatured ? (
            <Star className="h-3 w-3 text-yellow-500 fill-current" />
          ) : (
            <StarOff className="h-3 w-3 text-gray-400" />
          );
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const status = (row.getValue("status") as string).toLowerCase();
          return <StatusBadge status={status} />;
        },
      },
      {
        accessorKey: "organization",
        header: "Organization",
        cell: ({ row }) => {
          const org = row.original.organization;
          return (
            <div className="text-xs">
              {org?.name || "No Organization"}
            </div>
          );
        },
      },
      {
        accessorKey: "description",
        header: "Description",
        cell: ({ row }) => (
          <div className="hidden lg:block max-w-[200px] truncate text-xs">
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

  // If we have external pagination, use that instead of the built-in pagination
  if (pagination && onPageChange) {
    return (
      <div className="space-y-4 overflow-x-auto">
        <div className="rounded-md border min-w-[1200px]">
          <table className="w-full text-xs">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="h-10 px-2 text-left font-medium">Image</th>
                <th className="h-10 px-2 text-left font-medium">Name</th>
                <th className="h-10 px-2 text-left font-medium">Type</th>
                <th className="h-10 px-2 text-left font-medium">Deal Type</th>
                <th className="h-10 px-2 text-left font-medium">Discount</th>
                <th className="h-10 px-2 text-left font-medium">Points</th>
                <th className="h-10 px-2 text-center font-medium">Featured</th>
                <th className="h-10 px-2 text-left font-medium">Status</th>
                <th className="h-10 px-2 text-left font-medium">Org</th>
                <th className="h-10 px-2 text-left font-medium">URL</th>
                <th className="h-10 px-2 text-left font-medium hidden lg:table-cell">
                  Description
                </th>
                <th className="h-10 px-2 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.length > 0 ? (
                coupons.map((coupon) => (
                  <tr key={coupon.id} className="border-b">
                    <td className="p-2 align-middle">
                      {coupon.imageUrl ? (
                        <img 
                          src={coupon.imageUrl} 
                          alt={coupon.name}
                          className="w-8 h-8 object-cover rounded"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
                          <span className="text-[10px] text-gray-500">No Image</span>
                        </div>
                      )}
                    </td>
                    <td className="p-2 align-middle font-medium text-xs">
                      {coupon.name}
                    </td>
                    <td className="p-2 align-middle">
                      <Badge variant="outline" className="capitalize text-xs px-1 py-0">
                        {coupon.couponType}
                      </Badge>
                    </td>
                    <td className="p-2 align-middle">
                      <Badge variant="secondary" className="capitalize text-xs px-1 py-0">
                        {coupon.dealType}
                      </Badge>
                    </td>
                    <td className="p-2 align-middle font-medium text-xs">
                      {coupon.dealType === "percentage" ? `${coupon.discountAmount}%` : `$${coupon.discountAmount}`}
                    </td>
                    <td className="p-2 align-middle font-medium text-green-600 text-xs">
                      {coupon.pointsToRedeem} pts
                    </td>
                    <td className="p-2 align-middle text-center">
                      {coupon.isFeatured ? (
                        <Star className="h-3 w-3 text-yellow-500 fill-current mx-auto" />
                      ) : (
                        <StarOff className="h-3 w-3 text-gray-400 mx-auto" />
                      )}
                    </td>
                    <td className="p-2 align-middle">
                      <StatusBadge status={coupon.status.toLowerCase()} />
                    </td>
                    <td className="p-2 align-middle text-xs">
                      {coupon.organization?.name || "No Organization"}
                    </td>
                    <td className="p-2 align-middle">
                      {coupon.couponUrl ? (
                        <div className="flex items-center gap-1 max-w-[200px]">
                          <a
                            href={coupon.couponUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="truncate text-blue-600 hover:underline text-xs"
                            title={coupon.couponUrl}
                          >
                            {coupon.couponUrl}
                          </a>
                          <CopyButton url={coupon.couponUrl} />
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-xs">No Url</span>
                      )}
                    </td>
                    <td className="p-2 align-middle hidden lg:table-cell max-w-[200px] truncate text-xs">
                      {coupon.description || "No description"}
                    </td>
                    <td className="p-2 align-middle text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => onEdit(coupon)}
                          className="h-6 w-6"
                        >
                          <Edit className="h-3 w-3" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="text-red-500 hover:text-red-600 h-6 w-6"
                          onClick={() => onDelete(coupon)}
                        >
                          <Trash2 className="h-3 w-3" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={12} className="h-24 text-center text-xs">
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
    <div className="space-y-4 overflow-x-auto">
      <DataTable columns={columns} data={coupons} pageSize={20} />
    </div>
  );
}

// Separate component for copy button with state
function CopyButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("URL copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy URL");
    }
  };

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={handleCopy}
      aria-label="Copy URL"
      className="h-6 w-6"
    >
      {copied ? (
        <Check className="h-3 w-3 text-green-600" />
      ) : (
        <Copy className="h-3 w-3" />
      )}
    </Button>
  );
}