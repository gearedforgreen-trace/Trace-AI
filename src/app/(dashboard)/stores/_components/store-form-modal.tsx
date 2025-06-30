'use client';

import { z } from 'zod';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { EntityFormModal } from '@/components/ui/entity-form-modal';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import type { IStore } from '@/types';
import { useGetOrganizationsQuery } from "@/store/api/organizationsApi";

// Updated schema to match the API response structure
const storeFormSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Store name is required'),
  description: z.string().nullable(),
  imageUrl: z.string().nullable(),
  status: z.string(),
  organizationId: z.string().nullable().optional(),
  address1: z.string().min(1, 'Address is required'),
  address2: z.string().nullable().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  zip: z
    .string()
    .min(1, 'ZIP code is required')
    .min(5, 'Must be at least 5 characters'),
  country: z.string().min(1, 'Country is required'),
  lat: z.number(),
  lng: z.number(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

type TStoreFormValues = z.infer<typeof storeFormSchema>;

interface IStoreFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  store: IStore | null;
  onSave: (store: IStore) => void;
  isLoading?: boolean;
  error?: string | null;
}

export function StoreFormModal({
  isOpen,
  onClose,
  store,
  onSave,
  isLoading = false,
  error = null,
}: IStoreFormModalProps) {
  // Updated default values to match the API response structure
  const defaultValues: TStoreFormValues = {
    name: store?.name ?? '',
    description: store?.description ?? null,
    imageUrl: store?.imageUrl ?? null,
    status: store?.status ? store.status.toUpperCase() : 'INACTIVE',
    organizationId: store?.organizationId || null,
    address1: store?.address1 ?? '',
    address2: store?.address2 ?? null,
    city: store?.city ?? '',
    state: store?.state ?? '',
    zip: store?.zip ?? '',
    country: store?.country ?? '',
    lat: store?.lat ?? 0,
    lng: store?.lng ?? 0,
  };

  // RTK Query for organizations
  const {
    data: organizationsResponse,
    isLoading: isLoadingOrganizations,
    error: organizationsError,
  } = useGetOrganizationsQuery({ perPage: 100 });

  const organizations = organizationsResponse?.data || [];

  if (organizationsError) {
    return <div>Error: Something went wrong</div>;
  }

  return (
    <EntityFormModal<TStoreFormValues, IStore>
      isOpen={isOpen}
      loading={isLoadingOrganizations}
      onClose={onClose}
      title={store ? 'Edit Store' : 'Add New Store'}
      entity={store}
      formSchema={storeFormSchema}
      defaultValues={defaultValues}
      onSubmit={onSave}
      submitButtonText={
        isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {store ? 'Updating...' : 'Creating...'}
          </>
        ) : store ? (
          'Update Store'
        ) : (
          'Create Store'
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

          <div className="sm:grid grid-cols-1 sm:grid-cols-2 gap-6 max-sm:space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>Store Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter store name"
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
              name="organizationId"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel optional>Organization</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    disabled={isLoading}
                    defaultValue={store?.organizationId || undefined}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select organization" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {organizations.map((organization) => (
                        <SelectItem
                          key={organization.id}
                          value={organization.id}
                        >
                          {organization.name}
                        </SelectItem>
                      ))}
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
                  <FormLabel optional>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter store description"
                      {...field}
                      value={field.value || ''}
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
              name="status"
              render={({ field }) => (
                <FormItem>
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
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Country</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Country"
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
              name="address1"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Street address"
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
              name="address2"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>Address Line 2</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Apartment, suite, etc. (optional)"
                      {...field}
                      value={field.value || ''}
                      disabled={isLoading}
                    />
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
                    <Input placeholder="City" {...field} disabled={isLoading} />
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
                    <Input
                      placeholder="State"
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
              name="zip"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ZIP Code</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="ZIP code"
                      {...field}
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
