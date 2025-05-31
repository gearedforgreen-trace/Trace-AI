"use client";

import { useState, useEffect } from "react";
import { useApiCrud } from "@/hooks/api/use-api";
import { ApiService } from "@/lib/api/api-service";
import { EntityHeader } from "@/components/ui/entity-header";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { useToast } from "@/components/ui/use-toast";
import { ApiError } from "@/lib/api/error-handler";
import type { IMaterial } from "@/types";
import { MaterialFormModal } from "./material-form-modal";
import { MaterialsTable } from "./materials-table";

// Create a materials API service
const materialsApi = new ApiService<IMaterial>("/materials");

export default function MaterialsClient() {
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentMaterial, setCurrentMaterial] = useState<IMaterial | null>(
    null
  );
  const [materialToDelete, setMaterialToDelete] = useState<IMaterial | null>(
    null
  );
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Use the CRUD hook for materials
  const {
    entities: materials,
    pagination,
    isLoading,
    error,
    createEntity,
    updateEntity,
    deleteEntity,
    changePage,
  } = useApiCrud<IMaterial>(materialsApi);

  // Modal handlers
  const openCreateModal = () => {
    setCurrentMaterial(null);
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (material: IMaterial) => {
    setCurrentMaterial(material);
    setFormError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    // Only allow closing if not currently submitting
    if (!isSubmitting) {
      setIsModalOpen(false);
      // Only clear current material after modal is closed
      setTimeout(() => {
        setCurrentMaterial(null);
        setFormError(null);
      }, 300);
    }
  };

  // Delete dialog handlers
  const openDeleteDialog = (material: IMaterial) => {
    setMaterialToDelete(material);
    setIsDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
    setMaterialToDelete(null);
  };

  // Save handler with improved error handling
  const handleSave = async (material: IMaterial) => {
    setIsSubmitting(true);
    setFormError(null);

    try {
      if (currentMaterial?.id) {
        // Update existing material
        const result = await updateEntity({
          id: currentMaterial.id,
          data: material,
        });
        if (result) {
          toast({
            title: "Success",
            description: "Material updated successfully",
          });
          setIsModalOpen(false); // Only close modal on success
        }
      } else {
        // Create new material
        const result = await createEntity(material);
        if (result) {
          toast({
            title: "Success",
            description: "Material created successfully",
          });
          setIsModalOpen(false); // Only close modal on success
        }
      }
    } catch (err) {
      // Handle the error but keep the modal open
      const errorMessage =
        err instanceof ApiError
          ? err.message
          : "Failed to save material. Please try again.";

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
    if (!materialToDelete?.id) return;

    try {
      const success = await deleteEntity(materialToDelete.id);
      if (success) {
        toast({
          title: "Success",
          description: "Material deleted successfully",
        });
        closeDeleteDialog();
      } else {
        throw new Error("Failed to delete material");
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to delete material",
        variant: "destructive",
      });
    }
  };

  // Show error toast when error changes
  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: "Failed to load materials",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  // Handle page change
  const handlePageChange = (page: number) => {
    changePage(page);
  };

  // Add pagination information to the console for debugging
  useEffect(() => {
    console.log("Pagination info:", {
      currentPage: pagination.currentPage,
      lastPage: pagination.lastPage,
      total: pagination.total,
      perPage: pagination.perPage,
      prev: pagination.prev,
      next: pagination.next,
    });
  }, [pagination]);

  return (
    <div className="space-y-4">
      <EntityHeader
        title="Materials"
        description={`Manage your materials (${pagination.total} total)`}
        onAdd={openCreateModal}
        addButtonText="Add Material"
      />

      <MaterialsTable
        materials={materials}
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

      <MaterialFormModal
        isOpen={isModalOpen}
        onClose={closeModal}
        material={currentMaterial}
        onSave={handleSave}
        isLoading={isSubmitting}
        error={formError}
      />

      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={closeDeleteDialog}
        onConfirm={handleDelete}
        title="Are you sure?"
        description={`This will permanently delete the material "${materialToDelete?.name}". This action cannot be undone.`}
        confirmText="Delete"
      />
    </div>
  );
}
