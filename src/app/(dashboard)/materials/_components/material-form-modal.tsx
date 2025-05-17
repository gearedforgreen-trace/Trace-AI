"use client";

import { useEffect, useState } from "react";
import { z } from "zod";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EntityFormModal } from "@/components/ui/entity-form-modal";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { rewardRulesApi } from "@/lib/api/services/reward-rules-api";
import type { IMaterial, IRewardRule } from "@/types";

// Material form schema
const materialFormSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  rewardRuleId: z.string().min(1, "Reward Rule is required"),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

type TMaterialFormValues = z.infer<typeof materialFormSchema>;

interface IMaterialFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  material: IMaterial | null;
  onSave: (material: IMaterial) => void;
  isLoading?: boolean;
  error?: string | null;
}

export function MaterialFormModal({
  isOpen,
  onClose,
  material,
  onSave,
  isLoading = false,
  error = null,
}: IMaterialFormModalProps) {
  const [rewardRules, setRewardRules] = useState<IRewardRule[]>([]);
  const [isLoadingRewardRules, setIsLoadingRewardRules] = useState(false);

  // Fetch reward rules
  useEffect(() => {
    const fetchRewardRules = async () => {
      if (!isOpen) return;

      setIsLoadingRewardRules(true);
      try {
        const response = await rewardRulesApi.getAll();
        setRewardRules(response.data);
      } catch (error) {
        console.error("Failed to fetch reward rules:", error);
      } finally {
        setIsLoadingRewardRules(false);
      }
    };

    fetchRewardRules();
  }, [isOpen]);

  // Default values for the form
  const defaultValues: TMaterialFormValues = {
    name: "",
    description: "",
    rewardRuleId: "",
  };

  return (
    <EntityFormModal<TMaterialFormValues, IMaterial>
      isOpen={isOpen}
      onClose={onClose}
      title={material ? "Edit Material" : "Add New Material"}
      entity={material}
      formSchema={materialFormSchema}
      defaultValues={defaultValues}
      onSubmit={onSave}
      submitButtonText={
        isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {material ? "Updating..." : "Creating..."}
          </>
        ) : material ? (
          "Update Material"
        ) : (
          "Create Material"
        )
      }
      renderForm={(form) => (
        <div className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>Material Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter material name"
                      {...field}
                      disabled={isLoading}
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
                <FormItem className="col-span-2">
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter material description"
                      {...field}
                      value={field.value || ""}
                      rows={3}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="rewardRuleId"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>Reward Rule</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                    disabled={isLoading || isLoadingRewardRules}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a reward rule" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {isLoadingRewardRules ? (
                        <SelectItem value="loading" disabled>
                          Loading reward rules...
                        </SelectItem>
                      ) : rewardRules.length === 0 ? (
                        <SelectItem value="none" disabled>
                          No reward rules available
                        </SelectItem>
                      ) : (
                        rewardRules.map((rule) => (
                          <SelectItem key={rule.id} value={rule.id}>
                            {rule.unitType} ({rule.unit} {rule.unitType} ={" "}
                            {rule.point} points)
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      )}
    />
  );
}
