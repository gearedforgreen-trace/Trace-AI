"use client";

import { useState, useEffect } from "react";
import { useApiCrud } from "@/hooks/api/use-api";
import { ApiService } from "@/lib/api/api-service";
import { EntityHeader } from "@/components/ui/entity-header";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { useToast } from "@/components/ui/use-toast";
import { ApiError } from "@/lib/api/error-handler";
import type { Organization } from "@/types";
import { OrganizationFormModal } from "./organization-form-modal";
import { OrganizationsTable } from "./organizations-table";

// Create an organizations API service
const organizationsApi = new ApiService<Organization>("/organizations");

export default function OrganizationsClient() {
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null);
  const [organizationToDelete, setOrganizationToDelete] = useState<Organization | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Use the CRUD hook for organizations
  const {
    entities: organizations,
    pagination,
    isLoading,
    error,
    createEntity,
    updateEntity,
    deleteEntity,
    changePage,
  } = useApiCrud<Organization>(organizationsApi);

  // Modal handlers
  const openCreateModal = () => {
    setCurrentOrganization(null);
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (organization: Organization) => {
    setCurrentOrganization(organization);
    setFormError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    // Only allow closing if not currently submitting
    if (!isSubmitting) {
      setIsModalOpen(false);
      // Only clear current organization after modal is closed
      setTimeout(() => {
        setCurrentOrganization(null);
        setFormError(null);
      }, 300);
    }
  };

  // Delete dialog handlers
  const openDeleteDialog = (organization: Organization) => {
    setOrganizationToDelete(organization);
    setIsDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
    setOrganizationToDelete(null);
  };

  // Save handler with improved error handling
  const handleSave = async (organization: Organization) => {
    setIsSubmitting(true);
    setFormError(null);

    try {
      if (currentOrganization?.id) {
        // Update existing organization
        const result = await updateEntity({ id: currentOrganization.id, data: organization });
        if (result) {
          toast({
            title: "Success",
            description: "Organization updated successfully",
          });
          setIsModalOpen(false); // Only close modal on success
        }
      } else {
        // Create new organization
        const result = await createEntity(organization);
        if (result) {
          toast({
            title: "Success",
            description: "Organization created successfully",
          });
          setIsModalOpen(false); // Only close modal on success
        }
      }
    } catch (err) {
      // Handle the error but keep the modal open
      const errorMessage =
        err instanceof ApiError
          ? err.message
          : "Failed to save organization. Please try again.";

      setFormError(errorMessage);

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete handler
  const handleDelete = async () => {
    if (!organizationToDelete?.id) return;

    try {
      const success = await deleteEntity(organizationToDelete.id);
      if (success) {
        toast({ title: "Success", description: "Organization deleted successfully" });
        closeDeleteDialog();
      } else {
        throw new Error("Failed to delete organization");
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to delete organization",
        variant: "destructive",
      });
    }
  };

  // Show error toast when error changes
  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: "Failed to load organizations",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  // Handle page change
  const handlePageChange = (page: number) => {
    changePage(page);
  };

  return (
    <div className="space-y-4">
      <EntityHeader
        title="Organizations"
        description={`Manage your organizations (${pagination.total} total)`}
        onAdd={openCreateModal}
        addButtonText="Add Organization"
      />

      <OrganizationsTable
        organizations={organizations}
        isLoading={isLoading}
        onEdit={openEditModal}
        onDelete={openDeleteDialog}
        pagination={{
          currentPage: pagination.currentPage,
          perPage: pagination.perPage,
          total: pagination.total,
          lastPage: pagination.lastPage,
          prev: pagination.prev,
          next: pagination.next,
        }}
        onPageChange={handlePageChange}
      />

      <OrganizationFormModal
        isOpen={isModalOpen}
        onClose={closeModal}
        organization={currentOrganization}
        onSave={handleSave}
        isLoading={isSubmitting}
        error={formError}
      />

      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={closeDeleteDialog}
        onConfirm={handleDelete}
        title="Are you sure?"
        description={`This will permanently delete the organization "${organizationToDelete?.name}". This action cannot be undone.`}
        confirmText="Delete"
      />
    </div>
  );
}