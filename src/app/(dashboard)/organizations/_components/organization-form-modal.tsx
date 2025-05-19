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
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
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
  // Default values for the form
  const defaultValues: TOrganizationFormValues = {
    name: "",
    slug: null,
    logo: null,
    metadata: null,
  };

  return (
    <EntityFormModal<TOrganizationFormValues, Organization>
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
                  <Input
                    placeholder="https://example.com/logo.png (optional)"
                    {...field}
                    value={field.value || ""}
                    disabled={isLoading}
                  />
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