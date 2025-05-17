"use client";
import { z } from "zod";
import { useState, useEffect } from "react";
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
import type { IBin, IMaterial, IStore } from "@/types";
import { ApiService } from "@/lib/api/api-service";

// Create API services for materials and stores
const materialsApi = new ApiService<IMaterial>("/materials");
const storesApi = new ApiService<IStore>("/stores");

// Schema for bin form - updated to make description required
const binFormSchema = z.object({
  id: z.string().optional(),
  number: z.string().min(1, "Bin number is required"),
  materialId: z.string().min(1, "Material is required"),
  storeId: z.string().min(1, "Store is required"),
  description: z.string().min(1, "Description is required"), // Changed from nullable to required
  imageUrl: z.string().nullable(),
  status: z.string(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

type TBinFormValues = z.infer<typeof binFormSchema>;

interface IBinFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  bin: IBin | null;
  onSave: (bin: IBin) => void;
  isLoading?: boolean;
  error?: string | null;
}

export function BinFormModal({
  isOpen,
  onClose,
  bin,
  onSave,
  isLoading = false,
  error = null,
}: IBinFormModalProps) {
  // State for materials and stores
  const [materials, setMaterials] = useState<IMaterial[]>([]);
  const [stores, setStores] = useState<IStore[]>([]);
  const [materialsLoading, setMaterialsLoading] = useState(false);
  const [storesLoading, setStoresLoading] = useState(false);

  // Fetch materials and stores only once when the component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        setMaterialsLoading(true);
        setStoresLoading(true);

        // Fetch materials
        const materialsResponse = await materialsApi.getAll();
        setMaterials(materialsResponse.data);

        // Fetch stores
        const storesResponse = await storesApi.getAll();
        setStores(storesResponse.data);
      } catch (error) {
        console.error("Error fetching dropdown data:", error);
      } finally {
        setMaterialsLoading(false);
        setStoresLoading(false);
      }
    };

    fetchData();
  }, []); // Empty dependency array means this runs once on mount

  // Default values for the form - updated to include empty string for description
  const defaultValues: TBinFormValues = {
    number: "",
    materialId: "",
    storeId: "",
    description: "", // Changed from null to empty string
    imageUrl: null,
    status: "ACTIVE",
  };

  return (
    <EntityFormModal<TBinFormValues, IBin>
      isOpen={isOpen}
      onClose={onClose}
      title={bin ? "Edit Bin" : "Add New Bin"}
      entity={bin}
      formSchema={binFormSchema}
      defaultValues={defaultValues}
      onSubmit={onSave}
      submitButtonText={
        isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {bin ? "Updating..." : "Creating..."}
          </>
        ) : bin ? (
          "Update Bin"
        ) : (
          "Create Bin"
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
              name="number"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>Bin Number</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter bin number"
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
              name="materialId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Material</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                    disabled={isLoading || materialsLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select material" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {materialsLoading ? (
                        <SelectItem value="loading" disabled>
                          Loading materials...
                        </SelectItem>
                      ) : materials.length === 0 ? (
                        <SelectItem value="none" disabled>
                          No materials available
                        </SelectItem>
                      ) : (
                        materials.map((material) => (
                          <SelectItem key={material.id} value={material.id}>
                            {material.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="storeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Store</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                    disabled={isLoading || storesLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select store" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {storesLoading ? (
                        <SelectItem value="loading" disabled>
                          Loading stores...
                        </SelectItem>
                      ) : stores.length === 0 ? (
                        <SelectItem value="none" disabled>
                          No stores available
                        </SelectItem>
                      ) : (
                        stores.map((store) => (
                          <SelectItem key={store.id} value={store.id}>
                            {store.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>Status</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                    disabled={isLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="INACTIVE">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>
                    Description <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter bin description"
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
          </div>
        </div>
      )}
    />
  );
}
