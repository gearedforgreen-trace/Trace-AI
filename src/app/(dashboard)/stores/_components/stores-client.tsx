"use client";

import { useState, useEffect } from "react";
import { useApiCrud } from "@/hooks/api/use-api";
import { ApiService } from "@/lib/api/api-service";
import { EntityHeader } from "@/components/ui/entity-header";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { useToast } from "@/components/ui/use-toast";
import { ApiError } from "@/lib/api/error-handler";
import type { IStore } from "@/types";
import { StoreFormModal } from "./store-form-modal";
import { StoresTable } from "./stores-table";

// Create a stores API service
const storesApi = new ApiService<IStore>("/stores");

export default function StoresClient() {
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentStore, setCurrentStore] = useState<IStore | null>(null);
  const [storeToDelete, setStoreToDelete] = useState<IStore | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Use the CRUD hook for stores
  const {
    entities: stores,
    pagination,
    isLoading,
    error,
    createEntity,
    updateEntity,
    deleteEntity,
    changePage,
    refetch,
  } = useApiCrud<IStore>(storesApi);

  // Modal handlers
  const openCreateModal = () => {
    setCurrentStore(null);
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (store: IStore) => {
    setCurrentStore(store);
    setFormError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    // Only allow closing if not currently submitting
    if (!isSubmitting) {
      setIsModalOpen(false);
      setCurrentStore(null);
      setFormError(null);
    }
  };

  // Delete dialog handlers
  const openDeleteDialog = (store: IStore) => {
    setStoreToDelete(store);
    setIsDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
    setStoreToDelete(null);
  };

  // Save handler with improved error handling
  const handleSave = async (store: IStore) => {
    setIsSubmitting(true);
    setFormError(null);

    try {
      if (currentStore?.id) {
        // Update existing store
        const result = await updateEntity({ id: currentStore.id, data: store });
        if (result) {
          toast({
            title: "Success",
            description: "Store updated successfully",
          });
          setIsModalOpen(false); // Only close modal on success
        }
      } else {
        // Create new store
        const result = await createEntity(store);
        if (result) {
          toast({
            title: "Success",
            description: "Store created successfully",
          });
          setIsModalOpen(false); // Only close modal on success
        }
      }
    } catch (err) {
      // Handle the error but keep the modal open
      const errorMessage =
        err instanceof ApiError
          ? err.message
          : "Failed to save store. Please try again.";

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
    if (!storeToDelete?.id) return;

    try {
      const success = await deleteEntity(storeToDelete.id);
      if (success) {
        toast({ title: "Success", description: "Store deleted successfully" });
        closeDeleteDialog();
      } else {
        throw new Error("Failed to delete store");
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to delete store",
        variant: "destructive",
      });
    }
  };

  // Show error toast when error changes
  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: "Failed to load stores",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  return (
    <div className="space-y-4">
      <EntityHeader
        title="Store Locations"
        description={`Manage your store locations (${pagination.total} total)`}
        onAdd={openCreateModal}
        addButtonText="Add Store"
      />

      <StoresTable
        stores={stores}
        isLoading={isLoading}
        onEdit={openEditModal}
        onDelete={openDeleteDialog}
      />

      <StoreFormModal
        isOpen={isModalOpen}
        onClose={closeModal}
        store={currentStore}
        onSave={handleSave}
        isLoading={isSubmitting}
        error={formError}
      />

      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={closeDeleteDialog}
        onConfirm={handleDelete}
        title="Are you sure?"
        description={`This will permanently delete the store "${storeToDelete?.name}". This action cannot be undone.`}
        confirmText="Delete"
      />
    </div>
  );
}
