"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  User as UserIcon, 
  Mail, 
  Phone, 
  MapPin, 
  Building2, 
  Calendar,
  Award
} from "lucide-react";
import { User } from "@/lib/api/services/users-api";

interface ViewProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

export function ViewProfileModal({ isOpen, onClose, user }: ViewProfileModalProps) {
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

  // Format role for display
  const formatRole = (role: string) => {
    if (!role) return "User";
    return role
      .toLowerCase()
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Render status badge
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

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>User Profile</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header with Avatar and Basic Info */}
          <div className="flex items-start space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user.image} alt={user.name} />
              <AvatarFallback className="text-lg">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2">
              <div>
                <h3 className="text-xl font-semibold">{user.name}</h3>
                {user.username && (
                  <p className="text-sm text-muted-foreground">@{user.username}</p>
                )}
                {user.displayUsername && user.displayUsername !== user.username && (
                  <p className="text-sm text-muted-foreground">
                    Display: {user.displayUsername}
                  </p>
                )}
              </div>
              <div className="flex items-center space-x-2">
                {renderStatus(user.status)}
                <Badge variant="outline">{formatRole(user.role)}</Badge>
              </div>
            </div>
          </div>

          <Separator />

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <UserIcon className="h-5 w-5" />
                <span>Contact Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">{user.email}</p>
                  <p className="text-sm text-muted-foreground">
                    {user.emailVerified ? "Verified" : "Not verified"}
                  </p>
                </div>
              </div>
              
              {user.phoneNumber && (
                <div className="flex items-center space-x-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <p>{user.phoneNumber}</p>
                </div>
              )}

              {(user.address || user.state || user.postalCode) && (
                <div className="flex items-start space-x-3">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    {user.address && <p>{user.address}</p>}
                    <p>
                      {[user.state, user.postalCode].filter(Boolean).join(", ")}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Organizations */}
          {user.organizations && user.organizations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Building2 className="h-5 w-5" />
                  <span>Organizations</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {user.organizations.map((org, index) => (
                    <div key={org.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{org.name}</p>
                        <p className="text-sm text-muted-foreground">{org.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Points and Account Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Points */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Award className="h-5 w-5" />
                  <span>Points</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-green-600">
                  {user.totalPoints?.toLocaleString() || 0}
                </p>
                <p className="text-sm text-muted-foreground">Total points earned</p>
              </CardContent>
            </Card>

            {/* Account Creation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5" />
                  <span>Member Since</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm font-medium">
                  {formatDate(user.createdAt)}
                </p>
                <p className="text-sm text-muted-foreground">Account created</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}