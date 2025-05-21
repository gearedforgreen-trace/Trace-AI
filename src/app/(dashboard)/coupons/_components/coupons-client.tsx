"use client";

import { useState, useCallback } from "react";
import { useGetCouponsQuery, useCreateCouponMutation, useUpdateCouponMutation, useDeleteCouponMutation } from "@/store/api/couponsApi";
import { useGetOrganizationsQuery } from "@/store/api/organizationsApi";
import { EntityHeader } from "@/components/ui/entity-header";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { useToast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import type { Coupon } from "@/types";
import { CouponsTable } from "./coupons-table";
import { CouponFormModal } from "./coupon-form-modal";

export default function CouponsClient() {
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentCoupon, setCurrentCoupon] = useState<Coupon | null>(null);
  const [couponToDelete, setCouponToDelete] = useState<Coupon | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrganizationId, setSelectedOrganizationId] = useState<string>("all");
  const perPage = 20;

  // RTK Query hooks
  const {
    data: couponsResponse,
    isLoading: isLoadingCoupons,
    error: couponsError,
    isFetching: isFetchingCoupons,
  } = useGetCouponsQuery({
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

  const [createCoupon, { isLoading: isCreating }] = useCreateCouponMutation();
  const [updateCoupon, { isLoading: isUpdating }] = useUpdateCouponMutation();
  const [deleteCoupon, { isLoading: isDeleting }] = useDeleteCouponMutation();

  const coupons = couponsResponse?.data || [];
  const pagination = couponsResponse?.meta || {
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
    setCurrentCoupon(null);
    setFormError(null);
    setIsModalOpen(true);
  }, []);

  const openEditModal = useCallback((coupon: Coupon) => {
    setCurrentCoupon(coupon);
    setFormError(null);
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    const isSubmitting = isCreating || isUpdating;
    if (!isSubmitting) {
      setIsModalOpen(false);
      setTimeout(() => {
        setCurrentCoupon(null);
        setFormError(null);
      }, 300);
    }
  }, [isCreating, isUpdating]);

  // Delete dialog handlers
  const openDeleteDialog = useCallback((coupon: Coupon) => {
    setCouponToDelete(coupon);
    setIsDeleteDialogOpen(true);
  }, []);

  const closeDeleteDialog = useCallback(() => {
    setIsDeleteDialogOpen(false);
    setCouponToDelete(null);
  }, []);

  // Save handler with improved error handling
  const handleSave = useCallback(
    async (coupon: Coupon) => {
      setFormError(null);

      try {
        if (currentCoupon?.id) {
          // Update existing coupon
          await updateCoupon({ id: currentCoupon.id, coupon }).unwrap();
          toast({
            title: "Success",
            description: "Coupon updated successfully",
          });
        } else {
          // Create new coupon
          await createCoupon(coupon).unwrap();
          toast({
            title: "Success",
            description: "Coupon created successfully",
          });
        }
        setIsModalOpen(false);
        setTimeout(() => {
          setCurrentCoupon(null);
          setFormError(null);
        }, 300);
      } catch (err: any) {
        const errorMessage = err?.data?.error || err?.message || "Failed to save coupon. Please try again.";
        setFormError(errorMessage);
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
    },
    [createCoupon, currentCoupon, toast, updateCoupon]
  );

  // Delete handler
  const handleDelete = useCallback(async () => {
    if (!couponToDelete?.id) return;

    try {
      await deleteCoupon(couponToDelete.id).unwrap();
      toast({ title: "Success", description: "Coupon deleted successfully" });
      closeDeleteDialog();
    } catch (err: any) {
      const errorMessage = err?.data?.error || err?.message || "Failed to delete coupon";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  }, [couponToDelete, closeDeleteDialog, deleteCoupon, toast]);

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
  if (couponsError) {
    toast({
      title: "Error",
      description: "Failed to load coupons",
      variant: "destructive",
    });
  }

  const isLoading = isLoadingCoupons || isFetchingCoupons;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <EntityHeader
          title="Coupons"
          description={`Manage your reward coupons (${pagination.total} total)`}
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
            Add Coupon
          </Button>
        </div>
      </div>

      <CouponsTable
        coupons={coupons}
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

      <CouponFormModal
        isOpen={isModalOpen}
        onClose={closeModal}
        coupon={currentCoupon}
        onSave={handleSave}
        isLoading={isCreating || isUpdating}
        error={formError}
      />

      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={closeDeleteDialog}
        onConfirm={handleDelete}
        title="Are you sure?"
        description={`This will permanently delete the coupon "${couponToDelete?.name}". This action cannot be undone.`}
        confirmText="Delete"
      />
    </div>
  );
}