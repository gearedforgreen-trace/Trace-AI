"use client";

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
import type { IStore } from "@/types";

const storeFormSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Store name is required"),
  description: z.string().min(1, "Description is required"),
  imageUrl: z.string().default("/placeholder.svg?height=40&width=40"),
  status: z.enum(["active", "inactive"]),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zip: z.string().min(1, "ZIP code is required"),
  country: z.string().min(1, "Country is required"),
  lat: z.number().optional(),
  lng: z.number().optional(),
  organizationId: z.string().optional(),
});

type StoreFormValues = z.infer<typeof storeFormSchema>;

interface StoreFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  store: IStore | null;
  onSave: (store: IStore) => void;
}

export function StoreFormModal({
  isOpen,
  onClose,
  store,
  onSave,
}: StoreFormModalProps) {
  const defaultValues: StoreFormValues = {
    name: "",
    description: "",
    imageUrl: "/placeholder.svg?height=40&width=40",
    status: "active",
    address: "",
    city: "",
    state: "",
    zip: "",
    country: "USA",
    lat: 0,
    lng: 0,
  };

  return (
    <EntityFormModal<StoreFormValues, IStore>
      isOpen={isOpen}
      onClose={onClose}
      title={store ? "Edit Store" : "Add New Store"}
      entity={store}
      formSchema={storeFormSchema}
      defaultValues={defaultValues}
      onSubmit={onSave}
      renderForm={(form) => (
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Store Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter store name" {...field} />
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
                    placeholder="Enter store description"
                    {...field}
                    rows={3}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="country"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Country</FormLabel>
                <FormControl>
                  <Input placeholder="Country" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Address</FormLabel>
                <FormControl>
                  <Input placeholder="Street address" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>City</FormLabel>
                <FormControl>
                  <Input placeholder="City" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="state"
            render={({ field }) => (
              <FormItem>
                <FormLabel>State</FormLabel>
                <FormControl>
                  <Input placeholder="State" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="zip"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ZIP Code</FormLabel>
                <FormControl>
                  <Input placeholder="ZIP code" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      )}
    />
  );
}
