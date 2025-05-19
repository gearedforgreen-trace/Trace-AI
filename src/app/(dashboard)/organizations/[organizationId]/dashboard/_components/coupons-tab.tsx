"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Plus, Ticket, Info } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import type { Coupon } from "@/types";
import { 
  useGetCouponsQuery, 
  useCreateCouponMutation, 
  useUpdateCouponMutation, 
  useDeleteCouponMutation 
} from "@/store/api/couponsApi";

interface CouponsTabProps {
  organizationId: string;
}

export default function CouponsTab({ organizationId }: CouponsTabProps) {
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentCoupon, setCurrentCoupon] = useState<Coupon | null>(null);
  const [couponToDelete, setCouponToDelete] = useState<Coupon | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [page, setPage] = useState(1);
  const perPage = 10;

  // Use RTK Query hooks
  const { 
    data: couponsData, 
    isLoading, 
    error 
  } = useGetCouponsQuery({ 
    organizationId, 
    page, 
    perPage 
  });

  const [createCoupon] = useCreateCouponMutation();
  const [updateCoupon] = useUpdateCouponMutation();
  const [deleteCoupon] = useDeleteCouponMutation();

  // Modal handlers
  const openCreateModal = () => {
    setCurrentCoupon(null);
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (coupon: Coupon) => {
    setCurrentCoupon(coupon);
    setFormError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (!isSubmitting) {
      setIsModalOpen(false);
      setTimeout(() => {
        setCurrentCoupon(null);
        setFormError(null);
      }, 300);
    }
  };

  // Delete dialog handlers
  const openDeleteDialog = (coupon: Coupon) => {
    setCouponToDelete(coupon);
    setIsDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
    setCouponToDelete(null);
  };

  // Save handler with improved error handling
  const handleSave = async (coupon: Coupon) => {
    setIsSubmitting(true);
    setFormError(null);

    try {
      // Add organizationId to the coupon data
      const couponWithOrg = {
        ...coupon,
        organizationId,
      };

      if (currentCoupon?.id) {
        // Update existing coupon
        await updateCoupon({ 
          id: currentCoupon.id, 
          coupon: couponWithOrg 
        }).unwrap();
        
        toast({
          title: "Success",
          description: "Coupon updated successfully",
        });
        setIsModalOpen(false);
      } else {
        // Create new coupon
        await createCoupon(couponWithOrg).unwrap();
        
        toast({
          title: "Success",
          description: "Coupon created successfully",
        });
        setIsModalOpen(false);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to save coupon. Please try again.";

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
    if (!couponToDelete?.id) return;

    try {
      await deleteCoupon(couponToDelete.id).unwrap();
      toast({ title: "Success", description: "Coupon deleted successfully" });
      closeDeleteDialog();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to delete coupon",
        variant: "destructive",
      });
    }
  };

  // Show error toast when error changes
  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: "Failed to load coupons",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const pagination = couponsData?.meta || {
    currentPage: 1,
    perPage: 10,
    total: 0,
    lastPage: 1,
    prev: null,
    next: null
  };

  const coupons = couponsData?.data || [];

  // Show grid view of coupons
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Coupons</h3>
        <Button onClick={openCreateModal}>
          <Plus className="mr-2 h-4 w-4" /> Add Coupon
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-[200px] w-full" />
          ))}
        </div>
      ) : coupons.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <Ticket className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No Coupons</h3>
          <p className="text-muted-foreground mb-4">
            This organization doesn't have any coupons yet. Create one to get started.
          </p>
          <Button onClick={openCreateModal}>
            <Plus className="mr-2 h-4 w-4" /> Add Your First Coupon
          </Button>
        </div>
      ) : (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {coupons.map((coupon) => (
              <Card key={coupon.id} className="overflow-hidden">
                <div 
                  className="h-32 bg-gradient-to-r from-primary/20 to-primary/10 flex items-center justify-center"
                >
                  {coupon.imageUrl ? (
                    <img 
                      src={coupon.imageUrl} 
                      alt={coupon.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Ticket className="h-12 w-12 text-primary" />
                  )}
                </div>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-medium">{coupon.name}</h4>
                      <p className="text-sm text-muted-foreground line-clamp-2 h-10">
                        {coupon.description || "No description provided"}
                      </p>
                    </div>
                    <div className="bg-primary/10 text-primary text-sm px-2 py-1 rounded">
                      {coupon.pointsToRedeem} pts
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center mt-4">
                    <div className="flex gap-1 items-center text-xs text-muted-foreground">
                      <Info className="h-3 w-3" />
                      <span>{coupon.status}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => openEditModal(coupon)}
                      >
                        Edit
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="text-destructive hover:bg-destructive/10"
                        onClick={() => openDeleteDialog(coupon)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {pagination.lastPage > 1 && (
            <div className="flex justify-center mt-6">
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={!pagination.prev}
                >
                  Previous
                </Button>
                <div className="flex items-center text-sm">
                  Page {pagination.currentPage} of {pagination.lastPage}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={!pagination.next}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TODO: Add CouponFormModal when it exists */}
      {/* <CouponFormModal
        isOpen={isModalOpen}
        onClose={closeModal}
        coupon={currentCoupon}
        onSave={handleSave}
        isLoading={isSubmitting}
        error={formError}
      /> */}

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