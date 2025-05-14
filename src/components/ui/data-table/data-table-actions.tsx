"use client";

import type React from "react";

import type { Row } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DataTableActionsProps<TData> {
  row: Row<TData>;
  onEdit?: (data: TData) => void;
  onDelete?: (data: TData) => void;
  actions?: {
    label: string;
    icon?: React.ReactNode;
    onClick: (data: TData) => void;
  }[];
}

export function DataTableActions<TData>({
  row,
  onEdit,
  onDelete,
  actions = [],
}: DataTableActionsProps<TData>) {
  const rowData = row.original;

  // If we have only edit and delete actions, show them directly
  if (!actions.length && (onEdit || onDelete)) {
    return (
      <div className="flex justify-end gap-2">
        {onEdit && (
          <Button variant="outline" size="icon" onClick={() => onEdit(rowData)}>
            <Edit className="h-4 w-4" />
            <span className="sr-only">Edit</span>
          </Button>
        )}
        {onDelete && (
          <Button
            variant="outline"
            size="icon"
            className="text-red-500 hover:text-red-600"
            onClick={() => onDelete(rowData)}
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Delete</span>
          </Button>
        )}
      </div>
    );
  }

  // If we have additional actions, use a dropdown
  if (actions.length || (onEdit && onDelete)) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {onEdit && (
            <DropdownMenuItem onClick={() => onEdit(rowData)}>
              <Edit className="mr-2 h-4 w-4" />
              <span>Edit</span>
            </DropdownMenuItem>
          )}
          {actions.map((action, index) => (
            <DropdownMenuItem
              key={index}
              onClick={() => action.onClick(rowData)}
            >
              {action.icon && <span className="mr-2">{action.icon}</span>}
              <span>{action.label}</span>
            </DropdownMenuItem>
          ))}
          {onDelete && (
            <DropdownMenuItem
              className="text-red-500 focus:text-red-500"
              onClick={() => onDelete(rowData)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              <span>Delete</span>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return null;
}
