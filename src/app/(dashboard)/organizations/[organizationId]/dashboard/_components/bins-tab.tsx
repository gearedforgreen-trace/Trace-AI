"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { BinFormModal } from "@/app/(dashboard)/bins/_components/bin-form-modal";
import { BinsTable } from "@/app/(dashboard)/bins/_components/bins-table";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import type { Bin, Store, Material } from "@/types";
import { 
  useGetBinsQuery, 
  useCreateBinMutation, 
  useUpdateBinMutation, 
  useDeleteBinMutation 
} from "@/store/api/binsApi";
import { useGetMaterialsQuery } from "@/store/api/materialsApi";

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
  const [page, setPage] = useState(1);
  const perPage = 10;

  // Get store IDs from this organization
  const storeIds = stores.map(store => store.id);
  
  // Use RTK Query hooks
  const { 
    data: binsData, 
    isLoading, 
    error 
  } = useGetBinsQuery(
    storeIds.length > 0 ? { storeIds, page, perPage } : undefined,
    { skip: storeIds.length === 0 }
  );

  // Use RTK Query to fetch materials for dropdown
  const { 
    data: materialsData,
    isLoading: isLoadingMaterials 
  } = useGetMaterialsQuery({});

  const [createBin] = useCreateBinMutation();
  const [updateBin] = useUpdateBinMutation();
  const [deleteBin] = useDeleteBinMutation();

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
        await updateBin({ 
          id: currentBin.id, 
          bin 
        }).unwrap();
        
        toast({
          title: "Success",
          description: "Bin updated successfully",
        });
        setIsModalOpen(false);
      } else {
        // Create new bin
        await createBin(bin).unwrap();
        
        toast({
          title: "Success",
          description: "Bin created successfully",
        });
        setIsModalOpen(false);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error
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
      await deleteBin(binToDelete.id).unwrap();
      toast({ title: "Success", description: "Bin deleted successfully" });
      closeDeleteDialog();
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
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
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

  const pagination = binsData?.meta || {
    currentPage: 1,
    perPage: 10,
    total: 0,
    lastPage: 1,
    prev: null,
    next: null
  };

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
          bins={binsData?.data || []}
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
        materials={materialsData?.data || []}
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