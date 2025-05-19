"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiService } from "@/lib/api/api-service";
import { useApiCrud } from "@/hooks/api/use-api";
import { StoreFormModal } from "@/app/(dashboard)/stores/_components/store-form-modal";
import { StoresTable } from "@/app/(dashboard)/stores/_components/stores-table";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { ApiError } from "@/lib/api/error-handler";
import type { Store } from "@/types";

interface StoresTabProps {
  organizationId: string;
}

export default function StoresTab({ organizationId }: StoresTabProps) {
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentStore, setCurrentStore] = useState<Store | null>(null);
  const [storeToDelete, setStoreToDelete] = useState<Store | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Create a stores API service with organization filter
  const storesApi = new ApiService<Store>(`/stores?organizationId=${organizationId}`);

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
  } = useApiCrud<Store>(storesApi);

  // Modal handlers
  const openCreateModal = () => {
    setCurrentStore(null);
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (store: Store) => {
    setCurrentStore(store);
    setFormError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (!isSubmitting) {
      setIsModalOpen(false);
      setTimeout(() => {
        setCurrentStore(null);
        setFormError(null);
      }, 300);
    }
  };

  // Delete dialog handlers
  const openDeleteDialog = (store: Store) => {
    setStoreToDelete(store);
    setIsDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
    setStoreToDelete(null);
  };

  // Save handler with improved error handling
  const handleSave = async (store: Store) => {
    setIsSubmitting(true);
    setFormError(null);

    try {
      // Add organizationId to the store data
      const storeWithOrg = {
        ...store,
        organizationId,
      };

      if (currentStore?.id) {
        // Update existing store
        const result = await updateEntity({ id: currentStore.id, data: storeWithOrg });
        if (result) {
          toast({
            title: "Success",
            description: "Store updated successfully",
          });
          setIsModalOpen(false);
        }
      } else {
        // Create new store
        const result = await createEntity(storeWithOrg);
        if (result) {
          toast({
            title: "Success",
            description: "Store created successfully",
          });
          setIsModalOpen(false);
        }
      }
    } catch (err) {
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

  // Handle page change
  const handlePageChange = (page: number) => {
    changePage(page);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Stores</h3>
        <Button onClick={openCreateModal}>
          <Plus className="mr-2 h-4 w-4" /> Add Store
        </Button>
      </div>

      {isLoading ? (
        <Skeleton className="h-[400px] w-full" />
      ) : (
        <StoresTable
          stores={stores}
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
      )}

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