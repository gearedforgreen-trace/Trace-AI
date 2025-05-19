"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { MaterialFormModal } from "@/app/(dashboard)/materials/_components/material-form-modal";
import { MaterialsTable } from "@/app/(dashboard)/materials/_components/materials-table";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import type { Material } from "@/types";
import { 
  useGetMaterialsQuery, 
  useCreateMaterialMutation, 
  useUpdateMaterialMutation, 
  useDeleteMaterialMutation 
} from "@/store/api/materialsApi";

interface MaterialsTabProps {
  organizationId: string;
}

export default function MaterialsTab({ organizationId }: MaterialsTabProps) {
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentMaterial, setCurrentMaterial] = useState<Material | null>(null);
  const [materialToDelete, setMaterialToDelete] = useState<Material | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [page, setPage] = useState(1);
  const perPage = 10;

  // Use RTK Query hooks
  const { 
    data: materialsData, 
    isLoading, 
    error 
  } = useGetMaterialsQuery({ 
    page, 
    perPage 
  });

  const [createMaterial] = useCreateMaterialMutation();
  const [updateMaterial] = useUpdateMaterialMutation();
  const [deleteMaterial] = useDeleteMaterialMutation();

  // Modal handlers
  const openCreateModal = () => {
    setCurrentMaterial(null);
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (material: Material) => {
    setCurrentMaterial(material);
    setFormError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (!isSubmitting) {
      setIsModalOpen(false);
      setTimeout(() => {
        setCurrentMaterial(null);
        setFormError(null);
      }, 300);
    }
  };

  // Delete dialog handlers
  const openDeleteDialog = (material: Material) => {
    setMaterialToDelete(material);
    setIsDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
    setMaterialToDelete(null);
  };

  // Save handler
  const handleSave = async (material: Material) => {
    setIsSubmitting(true);
    setFormError(null);

    try {
      if (currentMaterial?.id) {
        // Update existing material
        await updateMaterial({ 
          id: currentMaterial.id, 
          material 
        }).unwrap();
        
        toast({
          title: "Success",
          description: "Material updated successfully",
        });
        setIsModalOpen(false);
      } else {
        // Create new material
        await createMaterial(material).unwrap();
        
        toast({
          title: "Success",
          description: "Material created successfully",
        });
        setIsModalOpen(false);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error
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
      await deleteMaterial(materialToDelete.id).unwrap();
      toast({ title: "Success", description: "Material deleted successfully" });
      closeDeleteDialog();
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
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const pagination = materialsData?.meta || {
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
        <h3 className="text-lg font-medium">Materials</h3>
        <Button onClick={openCreateModal}>
          <Plus className="mr-2 h-4 w-4" /> Add Material
        </Button>
      </div>

      {isLoading ? (
        <Skeleton className="h-[400px] w-full" />
      ) : (
        <MaterialsTable
          materials={materialsData?.data || []}
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