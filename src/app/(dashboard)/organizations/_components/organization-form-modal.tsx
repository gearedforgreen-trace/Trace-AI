/* eslint-disable @next/next/no-img-element */
"use client";

import { z } from "zod";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { EntityFormModal } from "@/components/ui/entity-form-modal";
import { Loader2, X } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useMemo } from "react";
import type { Organization } from "@/types";

// Schema for organization form
const organizationFormSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Organization name is required"),
  slug: z.string().nullable().optional(),
  logo: z.string().nullable().optional(),
  metadata: z.string().nullable().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

type TOrganizationFormValues = z.infer<typeof organizationFormSchema>;

interface IOrganizationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  organization: Organization | null;
  onSave: (organization: Organization) => void;
  isLoading?: boolean;
  error?: string | null;
}

export function OrganizationFormModal({
  isOpen,
  onClose,
  organization,
  onSave,
  isLoading = false,
  error = null,
}: IOrganizationFormModalProps) {
  const [logoUrl, setLogoUrl] = useState("");
  const [showImagePreview, setShowImagePreview] = useState(false);

  // URL validation function
  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  // Update logo URL when organization changes
  useEffect(() => {
    if (organization?.id) {
      // Editing existing organization
      const logoValue = organization.logo || "";
      setLogoUrl(logoValue);
      setShowImagePreview(!!logoValue);
    } else {
      // Creating new organization
      setLogoUrl("");
      setShowImagePreview(false);
    }
  }, [organization?.id, organization?.logo]);

  // Default values for the form - memoized to prevent unnecessary recalculations
  const defaultValues: TOrganizationFormValues = useMemo(() => ({
    name: organization?.name || "",
    slug: organization?.slug || "",
    logo: organization?.logo || "",
    metadata: organization?.metadata || "",
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [organization?.id, organization?.name, organization?.slug, organization?.logo, organization?.metadata]);

  return (
    <EntityFormModal<TOrganizationFormValues, Organization>
      key={organization?.id || 'new'}
      isOpen={isOpen}
      onClose={onClose}
      title={organization ? "Edit Organization" : "Add New Organization"}
      entity={organization}
      formSchema={organizationFormSchema}
      defaultValues={defaultValues}
      onSubmit={onSave}
      submitButtonText={
        isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {organization ? "Updating..." : "Creating..."}
          </>
        ) : organization ? (
          "Update Organization"
        ) : (
          "Create Organization"
        )
      }
      renderForm={(form) => (
        <div className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Organization Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter organization name"
                    {...field}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="slug"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Slug</FormLabel>
                <FormControl>
                  <Input
                    placeholder="organization-slug (optional)"
                    {...field}
                    value={field.value || ""}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="logo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Logo URL</FormLabel>
                <FormControl>
                  <div className="space-y-3">
                    <Input
                      placeholder="https://example.com/logo.png (optional)"
                      value={logoUrl}
                      disabled={isLoading}
                                             onChange={(e) => {
                         const value = e.target.value;
                         setLogoUrl(value);
                         // Only update the logo field value
                         field.onChange(value);
                         // Only show preview for valid URLs
                         setShowImagePreview(!!value && isValidUrl(value));
                       }}
                                             onPaste={(e) => {
                         e.preventDefault(); // Prevent default paste behavior
                         const pastedText = e.clipboardData.getData('text').trim();
                         
                         // Set the new value directly without clearing first
                         setLogoUrl(pastedText);
                         field.onChange(pastedText);
                         // Only show preview for valid URLs
                         setShowImagePreview(!!pastedText && isValidUrl(pastedText));
                       }}
                                             // Remove onBlur to prevent interference with form state
                    />
                    
                                         {/* Image Preview - Only show for valid URLs */}
                     {showImagePreview && logoUrl && isValidUrl(logoUrl) && (
                       <div className="relative inline-block">
                         <img
                           src={logoUrl}
                           alt="Logo preview"
                           className="h-20 w-20 object-contain rounded-lg border border-gray-200 dark:border-gray-700"
                           onError={() => {
                             setShowImagePreview(false);
                             console.log("Image failed to load:", logoUrl);
                           }}
                         />
                         <Button
                           type="button"
                           variant="destructive"
                           size="sm"
                           className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full"
                           onClick={() => {
                             setLogoUrl("");
                             setShowImagePreview(false);
                             field.onChange("");
                             // Only update the logo field, don't touch other fields
                           }}
                         >
                           <X className="h-3 w-3" />
                         </Button>
                       </div>
                     )}
                     
                     {/* Invalid URL Warning */}
                     {logoUrl && !isValidUrl(logoUrl) && (
                       <div className="flex items-center space-x-2 p-2 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800/50 rounded-lg">
                         <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                         <span className="text-sm text-yellow-700 dark:text-yellow-300">
                           Please enter a valid URL (e.g., https://example.com/logo.png)
                         </span>
                       </div>
                     )}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      )}
    />
  );
}