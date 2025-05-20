"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AlertTriangle, UserX, UserCheck, Ban } from "lucide-react";
import { User } from "@/lib/api/services/users-api";

export type UserStatusAction = "suspend" | "activate" | "ban";

interface UserStatusConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  user: User | null;
  action: UserStatusAction;
  isLoading?: boolean;
}

export function UserStatusConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  user,
  action,
  isLoading = false,
}: UserStatusConfirmationDialogProps) {
  if (!user) return null;

  // Get initials for avatar
  const getInitials = (name: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  // Get action-specific content
  const getActionContent = () => {
    switch (action) {
      case "suspend":
        return {
          title: "Suspend User Account",
          description: "This will temporarily restrict the user's access to the platform. The user will not be able to sign in or use any features. This action can be reversed.",
          icon: <UserX className="h-6 w-6 text-amber-600" />,
          confirmText: "Suspend User",
          confirmClass: "bg-amber-600 hover:bg-amber-700 text-white",
          warningLevel: "medium" as const,
        };
      case "activate":
        return {
          title: "Activate User Account",
          description: "This will restore the user's access to the platform. The user will be able to sign in and use all features normally.",
          icon: <UserCheck className="h-6 w-6 text-green-600" />,
          confirmText: "Activate User",
          confirmClass: "bg-green-600 hover:bg-green-700 text-white",
          warningLevel: "low" as const,
        };
      case "ban":
        return {
          title: "Ban User Account",
          description: "This will permanently restrict the user's access to the platform. The user will not be able to sign in or use any features. This is a serious action that should only be taken for violations of terms of service.",
          icon: <Ban className="h-6 w-6 text-red-600" />,
          confirmText: "Ban User",
          confirmClass: "bg-red-600 hover:bg-red-700 text-white",
          warningLevel: "high" as const,
        };
      default:
        return {
          title: "Update User Status",
          description: "Are you sure you want to perform this action?",
          icon: <AlertTriangle className="h-6 w-6 text-gray-600" />,
          confirmText: "Confirm",
          confirmClass: "bg-gray-600 hover:bg-gray-700 text-white",
          warningLevel: "medium" as const,
        };
    }
  };

  const actionContent = getActionContent();

  // Format role for display
  const formatRole = (role: string) => {
    if (!role) return "User";
    return role
      .toLowerCase()
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Render current status badge
  const renderStatus = (status: string) => {
    const statusMap: Record<string, { label: string; variant: "default" | "outline" | "secondary" | "destructive" | "success" }> = {
      active: { label: "Active", variant: "success" },
      banned: { label: "Banned", variant: "destructive" },
      suspended: { label: "Suspended", variant: "secondary" },
    };

    const statusInfo = statusMap[status.toLowerCase()] || { label: status, variant: "outline" };

    return (
      <Badge variant={statusInfo.variant}>
        {statusInfo.label}
      </Badge>
    );
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center space-x-3 mb-4">
            {actionContent.icon}
            <AlertDialogTitle className="text-lg">
              {actionContent.title}
            </AlertDialogTitle>
          </div>
          
          {/* User Information */}
          <div className="bg-muted/30 p-4 rounded-lg mb-4">
            <div className="flex items-center space-x-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={user.image} alt={user.name} />
                <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{user.name}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                <div className="flex items-center space-x-2 mt-1">
                  {renderStatus(user.status)}
                  <Badge variant="outline" className="text-xs">
                    {formatRole(user.role)}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          <AlertDialogDescription className="text-sm text-muted-foreground">
            {actionContent.description}
          </AlertDialogDescription>

          {/* Warning for high-risk actions */}
          {actionContent.warningLevel === "high" && (
            <div className="flex items-start space-x-2 p-3 bg-red-50 border border-red-200 rounded-md mt-3">
              <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-red-800">
                <p className="font-medium">This action requires careful consideration</p>
                <p className="text-xs mt-1">
                  Banned users cannot access the platform and may require manual intervention to restore access.
                </p>
              </div>
            </div>
          )}
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className={actionContent.confirmClass}
            disabled={isLoading}
          >
            {isLoading ? "Processing..." : actionContent.confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}