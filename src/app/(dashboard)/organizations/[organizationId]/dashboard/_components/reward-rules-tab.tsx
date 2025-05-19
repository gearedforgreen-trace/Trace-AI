"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { 
  DataTable, 
  DataTablePagination 
} from "@/components/ui/data-table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import type { RewardRule } from "@/types";
import { 
  useGetRewardRulesQuery, 
  useCreateRewardRuleMutation, 
  useUpdateRewardRuleMutation, 
  useDeleteRewardRuleMutation 
} from "@/store/api/rewardRulesApi";

interface RewardRulesTabProps {
  organizationId: string;
}

// Form schema based on the schema.ts file
const rewardRuleFormSchema = z.object({
  name: z
    .string()
    .min(1, "Name cannot be empty")
    .max(50, "Name cannot exceed 50 characters"),
  point: z
    .number()
    .int("Points must be a whole number")
    .min(1, "Points must be at least 1")
    .max(1000000, "Points cannot exceed 1,000,000")
    .or(z.string().regex(/^\d+$/).transform(Number)),
  unit: z
    .number()
    .positive("Unit must be a positive number")
    .min(0.01, "Unit must be at least 0.01")
    .max(1000000, "Unit cannot exceed 1,000,000")
    .or(z.string().regex(/^\d*\.?\d+$/).transform(Number)),
  unitType: z
    .string()
    .min(1, "Unit type cannot be empty")
    .max(50, "Unit type cannot exceed 50 characters"),
  description: z
    .string()
    .max(500, "Description cannot exceed 500 characters")
    .optional()
    .nullable(),
});

type FormValues = z.infer<typeof rewardRuleFormSchema>;

export default function RewardRulesTab({ organizationId }: RewardRulesTabProps) {
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentRewardRule, setCurrentRewardRule] = useState<RewardRule | null>(null);
  const [rewardRuleToDelete, setRewardRuleToDelete] = useState<RewardRule | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [page, setPage] = useState(1);
  const perPage = 10;

  // Use RTK Query hooks
  const { 
    data: rewardRulesData, 
    isLoading, 
    error 
  } = useGetRewardRulesQuery({ 
    page, 
    perPage 
  });

  const [createRewardRule] = useCreateRewardRuleMutation();
  const [updateRewardRule] = useUpdateRewardRuleMutation();
  const [deleteRewardRule] = useDeleteRewardRuleMutation();

  // Set up form
  const form = useForm<FormValues>({
    resolver: zodResolver(rewardRuleFormSchema),
    defaultValues: {
      name: "",
      point: 0,
      unit: 0,
      unitType: "",
      description: "",
    },
  });

  // Reset form when opening modal
  useEffect(() => {
    if (isModalOpen) {
      if (currentRewardRule) {
        form.reset({
          name: currentRewardRule.name,
          point: currentRewardRule.point,
          unit: currentRewardRule.unit,
          unitType: currentRewardRule.unitType,
          description: currentRewardRule.description || "",
        });
      } else {
        form.reset({
          name: "",
          point: 0,
          unit: 0,
          unitType: "",
          description: "",
        });
      }
    }
  }, [isModalOpen, currentRewardRule, form]);

  // Modal handlers
  const openCreateModal = () => {
    setCurrentRewardRule(null);
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (rewardRule: RewardRule) => {
    setCurrentRewardRule(rewardRule);
    setFormError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (!isSubmitting) {
      setIsModalOpen(false);
      setTimeout(() => {
        setCurrentRewardRule(null);
        setFormError(null);
      }, 300);
    }
  };

  // Delete dialog handlers
  const openDeleteDialog = (rewardRule: RewardRule) => {
    setRewardRuleToDelete(rewardRule);
    setIsDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
    setRewardRuleToDelete(null);
  };

  // Save handler
  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    setFormError(null);

    try {
      if (currentRewardRule?.id) {
        // Update existing reward rule
        await updateRewardRule({ 
          id: currentRewardRule.id, 
          rewardRule: data 
        }).unwrap();
        
        toast({
          title: "Success",
          description: "Reward rule updated successfully",
        });
        setIsModalOpen(false);
      } else {
        // Create new reward rule
        await createRewardRule(data).unwrap();
        
        toast({
          title: "Success",
          description: "Reward rule created successfully",
        });
        setIsModalOpen(false);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to save reward rule. Please try again.";

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
    if (!rewardRuleToDelete?.id) return;

    try {
      await deleteRewardRule(rewardRuleToDelete.id).unwrap();
      toast({ title: "Success", description: "Reward rule deleted successfully" });
      closeDeleteDialog();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to delete reward rule",
        variant: "destructive",
      });
    }
  };

  // Show error toast when error changes
  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: "Failed to load reward rules",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const rewardRules = rewardRulesData?.data || [];
  const pagination = rewardRulesData?.meta || {
    currentPage: 1,
    perPage: 10,
    total: 0,
    lastPage: 1,
    prev: null,
    next: null
  };

  // Table columns
  const columns = [
    {
      header: "Name",
      accessorKey: "name",
    },
    {
      header: "Unit Type",
      accessorKey: "unitType",
    },
    {
      header: "Unit",
      accessorKey: "unit",
      cell: ({ row }: any) => row.original.unit.toString(),
    },
    {
      header: "Points",
      accessorKey: "point",
      cell: ({ row }: any) => row.original.point.toString(),
    },
    {
      header: "Description",
      accessorKey: "description",
      cell: ({ row }: any) => row.original.description || "—",
    },
    {
      header: "Actions",
      cell: ({ row }: any) => (
        <div className="flex justify-end gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => openEditModal(row.original)}
          >
            Edit
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="text-destructive hover:bg-destructive/10"
            onClick={() => openDeleteDialog(row.original)}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Reward Rules</h3>
        <Button onClick={openCreateModal}>
          <Plus className="mr-2 h-4 w-4" /> Add Reward Rule
        </Button>
      </div>

      {isLoading ? (
        <Skeleton className="h-[400px] w-full" />
      ) : rewardRules.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 text-center border rounded-md">
          <p className="text-muted-foreground mb-4">
            No reward rules have been created yet.
          </p>
          <Button onClick={openCreateModal}>
            <Plus className="mr-2 h-4 w-4" /> Create First Reward Rule
          </Button>
        </div>
      ) : (
        <div className="rounded-md border">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="h-10 px-4 text-left font-medium">Name</th>
                <th className="h-10 px-4 text-left font-medium">Unit Type</th>
                <th className="h-10 px-4 text-left font-medium">Unit</th>
                <th className="h-10 px-4 text-left font-medium">Points</th>
                <th className="h-10 px-4 text-left font-medium">Description</th>
                <th className="h-10 px-4 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rewardRules.map((rule) => (
                <tr key={rule.id} className="border-b">
                  <td className="p-4 align-middle font-medium">{rule.name}</td>
                  <td className="p-4 align-middle">{rule.unitType}</td>
                  <td className="p-4 align-middle">{rule.unit}</td>
                  <td className="p-4 align-middle">{rule.point}</td>
                  <td className="p-4 align-middle max-w-[200px] truncate">
                    {rule.description || "—"}
                  </td>
                  <td className="p-4 align-middle text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditModal(rule)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:bg-destructive/10"
                        onClick={() => openDeleteDialog(rule)}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {pagination.lastPage > 1 && (
            <div className="flex justify-center p-4">
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={!pagination.prev}
                >
                  Previous
                </Button>
                <div className="flex items-center text-sm px-2">
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

      {/* Form Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{currentRewardRule ? "Edit Reward Rule" : "Create Reward Rule"}</DialogTitle>
            <DialogDescription>
              {currentRewardRule 
                ? "Update the reward rule details below."
                : "Fill out the form below to create a new reward rule."}
            </DialogDescription>
          </DialogHeader>

          {formError && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter rule name"
                        {...field} 
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="unitType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unit Type</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g. Kg, Liter, Piece"
                          {...field} 
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="unit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unit Value</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          step="0.01"
                          min="0.01"
                          placeholder="e.g. 1.5"
                          {...field}
                          onChange={(e) => {
                            const value = e.target.value === '' ? 0 : parseFloat(e.target.value);
                            field.onChange(value);
                          }}
                          value={field.value}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="point"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Points</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        step="1"
                        min="1"
                        placeholder="Points awarded"
                        {...field}
                        onChange={(e) => {
                          const value = e.target.value === '' ? 0 : parseInt(e.target.value);
                          field.onChange(value);
                        }}
                        value={field.value}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter description"
                        {...field}
                        value={field.value || ""}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={closeModal} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting 
                    ? (currentRewardRule ? "Updating..." : "Creating...") 
                    : (currentRewardRule ? "Update Rule" : "Create Rule")}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={closeDeleteDialog}
        onConfirm={handleDelete}
        title="Are you sure?"
        description={`This will permanently delete the reward rule "${rewardRuleToDelete?.name}". This action cannot be undone.`}
        confirmText="Delete"
      />
    </div>
  );
}