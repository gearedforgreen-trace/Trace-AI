"use client";

import type React from "react";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface EntityHeaderProps {
  title: string;
  description?: string;
  onAdd?: () => void;
  addButtonText?: string;
  addButtonIcon?: React.ReactNode;
  addButtonClassName?: string;
  children?: React.ReactNode;
}

export function EntityHeader({
  title,
  description,
  onAdd,
  addButtonText = "Add New",
  addButtonIcon = <Plus className="mr-2 h-4 w-4" />,
  addButtonClassName = "bg-green-600 hover:bg-green-700",
  children,
}: EntityHeaderProps) {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h3 className="text-lg font-medium">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="flex gap-2">
        {children}
        {onAdd && (
          <Button onClick={onAdd} className={addButtonClassName}>
            {addButtonIcon}
            {addButtonText}
          </Button>
        )}
      </div>
    </div>
  );
}
