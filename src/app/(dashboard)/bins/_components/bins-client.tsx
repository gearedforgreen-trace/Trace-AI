"use client";

import { useState, useEffect, useCallback } from "react";
import { useApiCrud } from "@/hooks/api/use-api";
import { ApiService } from "@/lib/api/api-service";
import { EntityHeader } from "@/components/ui/entity-header";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { useToast } from "@/components/ui/use-toast";
import { ApiError } from "@/lib/api/error-handler";
import type { IBin } from "@/types";
import { BinFormModal } from "./bin-form-modal";
import { BinsTable } from "./bins-table";

// Create a bins API service
const binsApi = new ApiService<IBin>("/bins");

export default function BinsClient() {
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentBin, setCurrentBin] = useState<IBin | null>(null);
  const [binToDelete, setBinToDelete] = useState<IBin | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Use the CRUD hook for bins
  const {
    entities: bins,
    pagination,
    isLoading,
    error,
    createEntity,
    updateEntity,
    deleteEntity,
    changePage,
    refetch,
  } = useApiCrud<IBin>(binsApi);

  // Modal handlers
  const openCreateModal = useCallback(() => {
    setCurrentBin(null);
    setFormError(null);
    setIsModalOpen(true);
  }, []);

  const openEditModal = useCallback((bin: IBin) => {
    setCurrentBin(bin);
    setFormError(null);
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    // Only allow closing if not currently submitting
    if (!isSubmitting) {
      setIsModalOpen(false);
      // Only clear current bin after modal is closed
      setTimeout(() => {
        setCurrentBin(null);
        setFormError(null);
      }, 300);
    }
  }, [isSubmitting]);

  // Delete dialog handlers
  const openDeleteDialog = useCallback((bin: IBin) => {
    setBinToDelete(bin);
    setIsDeleteDialogOpen(true);
  }, []);

  const closeDeleteDialog = useCallback(() => {
    setIsDeleteDialogOpen(false);
    setBinToDelete(null);
  }, []);

  // Save handler with improved error handling
  const handleSave = useCallback(
    async (bin: IBin) => {
      setIsSubmitting(true);
      setFormError(null);

      try {
        if (currentBin?.id) {
          // Update existing bin
          const result = await updateEntity({ id: currentBin.id, data: bin });
          if (result) {
            toast({
              title: "Success",
              description: "Bin updated successfully",
            });
            setIsModalOpen(false); // Only close modal on success
          }
        } else {
          // Create new bin
          const result = await createEntity(bin);
          if (result) {
            toast({
              title: "Success",
              description: "Bin created successfully",
            });
            setIsModalOpen(false); // Only close modal on success
          }
        }
      } catch (err) {
        // Handle the error but keep the modal open
        const errorMessage =
          err instanceof ApiError
            ? err.message
            : "Failed to save bin. Please try again.";

        setFormError(errorMessage);

        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setIsSubmitting(false);
      }
    },
    [createEntity, currentBin, toast, updateEntity]
  );

  // Delete handler
  const handleDelete = useCallback(async () => {
    if (!binToDelete?.id) return;

    try {
      const success = await deleteEntity(binToDelete.id);
      if (success) {
        toast({ title: "Success", description: "Bin deleted successfully" });
        closeDeleteDialog();
      } else {
        throw new Error("Failed to delete bin");
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to delete bin",
        variant: "destructive",
      });
    }
  }, [binToDelete, closeDeleteDialog, deleteEntity, toast]);

  // Show error toast when error changes
  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: "Failed to load bins",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  // Handle page change
  const handlePageChange = useCallback(
    (page: number) => {
      changePage(page);
    },
    [changePage]
  );

  return (
    <div className="space-y-4">
      <EntityHeader
        title="Recycling Bins"
        description={`Manage your recycling bins (${pagination.total} total)`}
        onAdd={openCreateModal}
        addButtonText="Add Bin"
      />

      <BinsTable
        bins={bins}
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

      <BinFormModal
        isOpen={isModalOpen}
        onClose={closeModal}
        bin={currentBin}
        onSave={handleSave}
        isLoading={isSubmitting}
        error={formError}
      />

      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={closeDeleteDialog}
        onConfirm={handleDelete}
        title="Are you sure?"
        description={`This will permanently delete the bin "${binToDelete?.number}". This action cannot be undone.`}
        confirmText="Delete"
      />
    </div>
  );
}
