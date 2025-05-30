"use client";

import { useState, useCallback } from "react";
import { useGetBinsQuery, useCreateBinMutation, useUpdateBinMutation, useDeleteBinMutation } from "@/store/api/binsApi";
import { useGetOrganizationsQuery } from "@/store/api/organizationsApi";
import { EntityHeader } from "@/components/ui/entity-header";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { useToast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import type { IBin } from "@/types";
import { BinFormModal } from "./bin-form-modal";
import { BinsTable } from "./bins-table";

export default function BinsClient() {
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentBin, setCurrentBin] = useState<IBin | null>(null);
  const [binToDelete, setBinToDelete] = useState<IBin | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrganizationId, setSelectedOrganizationId] = useState<string>("all");
  const perPage = 20;

  // RTK Query hooks
  const {
    data: binsResponse,
    isLoading: isLoadingBins,
    error: binsError,
    isFetching: isFetchingBins,
  } = useGetBinsQuery({
    page: currentPage,
    perPage,
    ...(selectedOrganizationId !== "all" && { organizationId: selectedOrganizationId }),
  });

  const {
    data: organizationsResponse,
  } = useGetOrganizationsQuery({
    page: 1,
    perPage: 100,
  });

  const [createBin, { isLoading: isCreating }] = useCreateBinMutation();
  const [updateBin, { isLoading: isUpdating }] = useUpdateBinMutation();
  const [deleteBin, { isLoading: isDeleing }] = useDeleteBinMutation();

  const bins = binsResponse?.data || [];
  const pagination = binsResponse?.meta || {
    currentPage: 1,
    perPage: 20,
    total: 0,
    lastPage: 1,
    prev: null,
    next: null,
  };

  const organizations = organizationsResponse?.data || [];

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
    const isSubmitting = isCreating || isUpdating;
    if (!isSubmitting) {
      setIsModalOpen(false);
      setTimeout(() => {
        setCurrentBin(null);
        setFormError(null);
      }, 300);
    }
  }, [isCreating, isUpdating]);

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
      console.log("bin", bin);
      setFormError(null);

      try {
        if (currentBin?.id) {
          // Update existing bin
          await updateBin({ id: currentBin.id, bin }).unwrap();
          toast({
            title: "Success",
            description: "Bin updated successfully",
          });
        } else {
          // Create new bin
          await createBin(bin).unwrap();
          toast({
            title: "Success",
            description: "Bin created successfully",
          });
        }
        setIsModalOpen(false);
        setTimeout(() => {
          setCurrentBin(null);
          setFormError(null);
        }, 300);
      } catch (err: any) {
        const errorMessage = err?.data?.error || err?.message || "Failed to save bin. Please try again.";
        setFormError(errorMessage);
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
    },
    [createBin, currentBin, toast, updateBin]
  );

  // Delete handler
  const handleDelete = useCallback(async () => {
    if (!binToDelete?.id) return;

    try {
      await deleteBin(binToDelete.id).unwrap();
      toast({ title: "Success", description: "Bin deleted successfully" });
      closeDeleteDialog();
    } catch (err: any) {
      const errorMessage = err?.data?.error || err?.message || "Failed to delete bin";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  }, [binToDelete, closeDeleteDialog, deleteBin, toast]);

  // Handle page change
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  // Handle organization filter change
  const handleOrganizationChange = useCallback((value: string) => {
    setSelectedOrganizationId(value);
    setCurrentPage(1); // Reset to first page when filter changes
  }, []);

  // Show error toast for fetch errors
  if (binsError) {
    toast({
      title: "Error",
      description: "Failed to load bins",
      variant: "destructive",
    });
  }

  const isLoading = isLoadingBins || isFetchingBins;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <EntityHeader
          title="Recycling Bins"
          description={`Manage your recycling bins (${pagination.total} total)`}
        />
        
        <div className="flex items-center space-x-2">
          <Select value={selectedOrganizationId} onValueChange={handleOrganizationChange}>
            <SelectTrigger className="w-[250px]">
              <SelectValue placeholder="Filter by organization" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Organizations</SelectItem>
              {organizations.map((org) => (
                <SelectItem key={org.id} value={org.id}>
                  {org.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button onClick={openCreateModal} className="bg-green-600 hover:bg-green-700">
            <Plus className="mr-2 h-4 w-4" />
            Add Bin
          </Button>
        </div>
      </div>

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
        isLoading={isCreating || isUpdating}
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