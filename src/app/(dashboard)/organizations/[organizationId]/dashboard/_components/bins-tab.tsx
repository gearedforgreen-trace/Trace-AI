"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiService } from "@/lib/api/api-service";
import { useApiCrud } from "@/hooks/api/use-api";
import { BinFormModal } from "@/app/(dashboard)/bins/_components/bin-form-modal";
import { BinsTable } from "@/app/(dashboard)/bins/_components/bins-table";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { ApiError } from "@/lib/api/error-handler";
import type { Bin, Store } from "@/types";

interface BinsTabProps {
  organizationId: string;
  stores: Store[];
}

export default function BinsTab({ organizationId, stores }: BinsTabProps) {
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentBin, setCurrentBin] = useState<Bin | null>(null);
  const [binToDelete, setBinToDelete] = useState<Bin | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [materials, setMaterials] = useState<any[]>([]);

  // Get store IDs from this organization
  const storeIds = stores.map(store => store.id);
  const storeIdsParam = storeIds.length > 0 ? `storeIds=${storeIds.join(',')}` : '';
  
  // Create a bins API service with store filter
  const binsApi = new ApiService<Bin>(`/bins?${storeIdsParam}`);

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
  } = useApiCrud<Bin>(binsApi);

  // Fetch materials for dropdown
  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const response = await fetch('/api/materials');
        if (response.ok) {
          const data = await response.json();
          setMaterials(data.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch materials:", error);
      }
    };

    fetchMaterials();
  }, []);

  // Modal handlers
  const openCreateModal = () => {
    setCurrentBin(null);
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (bin: Bin) => {
    setCurrentBin(bin);
    setFormError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (!isSubmitting) {
      setIsModalOpen(false);
      setTimeout(() => {
        setCurrentBin(null);
        setFormError(null);
      }, 300);
    }
  };

  // Delete dialog handlers
  const openDeleteDialog = (bin: Bin) => {
    setBinToDelete(bin);
    setIsDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
    setBinToDelete(null);
  };

  // Save handler with improved error handling
  const handleSave = async (bin: Bin) => {
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
          setIsModalOpen(false);
        }
      } else {
        // Create new bin
        const result = await createEntity(bin);
        if (result) {
          toast({
            title: "Success",
            description: "Bin created successfully",
          });
          setIsModalOpen(false);
        }
      }
    } catch (err) {
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
  };

  // Delete handler
  const handleDelete = async () => {
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
  };

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
  const handlePageChange = (page: number) => {
    changePage(page);
  };

  if (stores.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <p className="text-muted-foreground mb-4">
          No stores found for this organization. Create stores first to add bins.
        </p>
        <Button variant="outline" onClick={() => document.querySelector('[value="stores"]')?.dispatchEvent(new Event('click'))}>
          Go to Stores Tab
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Bins</h3>
        <Button onClick={openCreateModal}>
          <Plus className="mr-2 h-4 w-4" /> Add Bin
        </Button>
      </div>

      {isLoading ? (
        <Skeleton className="h-[400px] w-full" />
      ) : (
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
      )}

      <BinFormModal
        isOpen={isModalOpen}
        onClose={closeModal}
        bin={currentBin}
        onSave={handleSave}
        isLoading={isSubmitting}
        error={formError}
        stores={stores}
        materials={materials}
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