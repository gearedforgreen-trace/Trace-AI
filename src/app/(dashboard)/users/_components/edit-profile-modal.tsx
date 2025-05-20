"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { User } from "@/lib/api/services/users-api";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onSave: (userId: string, userData: Partial<User>) => Promise<void>;
  isLoading?: boolean;
}

interface EditUserForm {
  name: string;
  email: string;
  username: string;
  displayUsername: string;
  phoneNumber: string;
  address: string;
  postalCode: string;
  state: string;
  role: string;
  status: string;
}

export function EditProfileModal({ 
  isOpen, 
  onClose, 
  user, 
  onSave, 
  isLoading = false 
}: EditProfileModalProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState<EditUserForm>({
    name: "",
    email: "",
    username: "",
    displayUsername: "",
    phoneNumber: "",
    address: "",
    postalCode: "",
    state: "",
    role: "",
    status: "",
  });
  const [formErrors, setFormErrors] = useState<Partial<EditUserForm>>({});

  // Initialize form data when user changes
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        username: user.username || "",
        displayUsername: user.displayUsername || "",
        phoneNumber: user.phoneNumber || "",
        address: user.address || "",
        postalCode: user.postalCode || "",
        state: user.state || "",
        role: user.role || "",
        status: user.status || "",
      });
      setFormErrors({});
    }
  }, [user]);

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

  // Handle form field changes
  const handleChange = (field: keyof EditUserForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const errors: Partial<EditUserForm> = {};

    if (!formData.name.trim()) {
      errors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }

    if (formData.username && !/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      errors.username = "Username can only contain letters, numbers, and underscores";
    }

    if (formData.phoneNumber && !/^\+?[\d\s\-\(\)]+$/.test(formData.phoneNumber)) {
      errors.phoneNumber = "Please enter a valid phone number";
    }

    if (formData.postalCode && !/^\d{5}(-\d{4})?$/.test(formData.postalCode)) {
      errors.postalCode = "Please enter a valid postal code (e.g., 12345 or 12345-6789)";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !validateForm()) {
      return;
    }

    try {
      // Create update payload with only changed fields
      const updatePayload: Partial<User> = {};
      
      Object.entries(formData).forEach(([key, value]) => {
        const originalValue = user[key as keyof User];
        if (value !== originalValue) {
          (updatePayload as any)[key] = value || null;
        }
      });

      // Only proceed if there are changes
      if (Object.keys(updatePayload).length === 0) {
        toast({
          title: "No changes",
          description: "No changes were made to the user profile.",
        });
        return;
      }

      await onSave(user.id, updatePayload);
      onClose();
      
      toast({
        title: "Success",
        description: "User profile updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle close
  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  if (!user) return null;

  const roleOptions = [
    { value: "user", label: "User" },
    { value: "admin", label: "Admin" },
  ];

  const statusOptions = [
    { value: "active", label: "Active" },
    { value: "suspended", label: "Suspended" },
    { value: "banned", label: "Banned" },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit User Profile</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Header with Avatar */}
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user.image} alt={user.name} />
              <AvatarFallback className="text-lg">
                {getInitials(formData.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-lg font-semibold">{user.name}</h3>
              <p className="text-sm text-muted-foreground">
                ID: {user.id}
              </p>
            </div>
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="Enter full name"
                disabled={isLoading}
              />
              {formErrors.name && (
                <p className="text-sm text-red-500">{formErrors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="Enter email address"
                disabled={isLoading}
              />
              {formErrors.email && (
                <p className="text-sm text-red-500">{formErrors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => handleChange("username", e.target.value)}
                placeholder="Enter username"
                disabled={isLoading}
              />
              {formErrors.username && (
                <p className="text-sm text-red-500">{formErrors.username}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="displayUsername">Display Username</Label>
              <Input
                id="displayUsername"
                value={formData.displayUsername}
                onChange={(e) => handleChange("displayUsername", e.target.value)}
                placeholder="Enter display username"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                value={formData.phoneNumber}
                onChange={(e) => handleChange("phoneNumber", e.target.value)}
                placeholder="Enter phone number"
                disabled={isLoading}
              />
              {formErrors.phoneNumber && (
                <p className="text-sm text-red-500">{formErrors.phoneNumber}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                value={formData.state}
                onChange={(e) => handleChange("state", e.target.value)}
                placeholder="Enter state"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Address Information */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => handleChange("address", e.target.value)}
                placeholder="Enter full address"
                disabled={isLoading}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="postalCode">Postal Code</Label>
              <Input
                id="postalCode"
                value={formData.postalCode}
                onChange={(e) => handleChange("postalCode", e.target.value)}
                placeholder="Enter postal code"
                disabled={isLoading}
              />
              {formErrors.postalCode && (
                <p className="text-sm text-red-500">{formErrors.postalCode}</p>
              )}
            </div>
          </div>

          {/* Role and Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={formData.role}
                onValueChange={(value) => handleChange("role", value)}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {roleOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleChange("status", value)}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}