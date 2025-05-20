"use client";

import { useState, useEffect } from "react";
import { EntityHeader } from "@/components/ui/entity-header";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { useToast } from "@/components/ui/use-toast";
import type { IStore, IOrganization } from "@/types";
import { StoreFormModal } from "./store-form-modal";
import { StoresTable } from "./stores-table";
import { StoresMap } from "./stores-map";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

// RTK Query hooks
import {
  useGetStoresQuery,
  useCreateStoreMutation,
  useUpdateStoreMutation,
  useDeleteStoreMutation,
} from "@/store/api/storesApi";
import {
  useGetOrganizationsQuery,
} from "@/store/api/organizationsApi";

export default function StoresClient() {
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentStore, setCurrentStore] = useState<IStore | null>(null);
  const [storeToDelete, setStoreToDelete] = useState<IStore | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [selectedOrganizationId, setSelectedOrganizationId] = useState<string | "all">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(20);

  // RTK Query for stores with automatic filtering and pagination
  const {
    data: storesResponse,
    isLoading: isLoadingStores,
    error: storesError,
    isFetching: isFetchingStores,
  } = useGetStoresQuery({
    page: currentPage,
    perPage,
    ...(selectedOrganizationId !== "all" && { organizationId: selectedOrganizationId }),
  });

  // RTK Query for organizations
  const {
    data: organizationsResponse,
    isLoading: isLoadingOrganizations,
    error: organizationsError,
  } = useGetOrganizationsQuery({ perPage: 100 });

  // RTK Query mutations
  const [createStore, { isLoading: isCreating }] = useCreateStoreMutation();
  const [updateStore, { isLoading: isUpdating }] = useUpdateStoreMutation();
  const [deleteStore, { isLoading: isDeleting }] = useDeleteStoreMutation();

  // Derived data
  const stores = storesResponse?.data || [];
  const pagination = storesResponse?.meta || {
    currentPage: 1,
    perPage: 20,
    total: 0,
    lastPage: 1,
    prev: null,
    next: null,
  };
  const organizations = organizationsResponse?.data || [];
  const isSubmitting = isCreating || isUpdating;
  const isLoading = isLoadingStores || isFetchingStores;

  // Handle organization change
  const handleOrganizationChange = (value: string) => {
    setSelectedOrganizationId(value);
    setCurrentPage(1); // Reset to first page when filtering
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

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
      // Only clear current store after modal is closed
      setTimeout(() => {
        setCurrentStore(null);
        setFormError(null);
      }, 300);
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

  // Save handler with RTK Query mutations
  const handleSave = async (store: IStore) => {
    setFormError(null);

    try {
      let result;
      if (currentStore?.id) {
        // Update existing store
        result = await updateStore({
          id: currentStore.id,
          store,
        }).unwrap();
        
        toast({
          title: "Success",
          description: "Store updated successfully",
        });
      } else {
        // Create new store
        result = await createStore(store).unwrap();
        
        toast({
          title: "Success",
          description: "Store created successfully",
        });
      }
      
      if (result) {
        setIsModalOpen(false);
      }
    } catch (err: any) {
      // Handle the error but keep the modal open
      const errorMessage = err?.data?.error || err?.message || "Failed to save store. Please try again.";
      
      setFormError(errorMessage);
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  // Delete handler with RTK Query mutation
  const handleDelete = async () => {
    if (!storeToDelete?.id) return;

    try {
      await deleteStore(storeToDelete.id).unwrap();
      
      toast({ 
        title: "Success", 
        description: "Store deleted successfully" 
      });
      
      closeDeleteDialog();
    } catch (err: any) {
      const errorMessage = err?.data?.error || err?.message || "Failed to delete store";
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  // Show error toast when there are API errors
  useEffect(() => {
    if (storesError) {
      toast({
        title: "Error",
        description: "Failed to load stores",
        variant: "destructive",
      });
    }
  }, [storesError, toast]);

  useEffect(() => {
    if (organizationsError) {
      toast({
        title: "Error",
        description: "Failed to load organizations",
        variant: "destructive",
      });
    }
  }, [organizationsError, toast]);

  return (
    <div className="space-y-4">
      <EntityHeader
        title="Store Locations"
        description={`Manage your store locations (${pagination.total} total)`}
        onAdd={openCreateModal}
        addButtonText="Add Store"
      />

      <div className="flex items-center gap-4 mb-4">
        <Card className="w-full">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex flex-col gap-1">
                <label htmlFor="org-select" className="text-sm font-medium">
                  Filter by Organization
                </label>
                <Select 
                  value={selectedOrganizationId} 
                  onValueChange={handleOrganizationChange}
                  disabled={isLoadingOrganizations}
                >
                  <SelectTrigger id="org-select" className="w-[240px]">
                    <SelectValue placeholder="All Organizations" />
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
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Map component */}
      <StoresMap stores={stores} />

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
        isLoading={isDeleting}
      />
    </div>
  );
}