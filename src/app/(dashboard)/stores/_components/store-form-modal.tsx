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
import { Button } from "@/components/ui/button";
import { EntityFormModal } from "@/components/ui/entity-form-modal";
import { Loader2, MapPin } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import type { IStore } from "@/types";
import { useGetOrganizationsQuery } from "@/store/api/organizationsApi";
import { useState, useEffect, useCallback } from "react";

// Updated schema to match the API response structure
const storeFormSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Store name is required"),
  description: z.string().nullable(),
  imageUrl: z.string().nullable(),
  status: z.string(),
  organizationId: z.string().nullable().optional(),
  address1: z.string().min(1, "Address is required"),
  address2: z.string().nullable().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zip: z
    .string()
    .min(1, "ZIP code is required")
    .min(5, "Must be at least 5 characters"),
  country: z.string().min(1, "Country is required"),
  lat: z.coerce.number(),
  lng: z.coerce.number(),
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
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [autoGeocoding, setAutoGeocoding] = useState(false);
  const [lastGeocodedAddress, setLastGeocodedAddress] = useState<string>('');
  const [formRef, setFormRef] = useState<any>(null);
  // Updated default values to match the API response structure
  const defaultValues: TStoreFormValues = {
    name: store?.name ?? "",
    description: store?.description ?? null,
    imageUrl: store?.imageUrl ?? null,
    status: store?.status ? store.status.toUpperCase() : "INACTIVE",
    organizationId: store?.organizationId || null,
    address1: store?.address1 ?? "",
    address2: store?.address2 ?? null,
    city: store?.city ?? "",
    state: store?.state ?? "",
    zip: store?.zip ?? "",
    country: store?.country ?? "",
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

  // Geocoding function
  const geocodeAddress = async (form: any) => {
    setIsGeocoding(true);
    
    const address1 = form.getValues('address1');
    const city = form.getValues('city');
    const state = form.getValues('state');
    const zip = form.getValues('zip');
    const country = form.getValues('country');

    if (!address1 || !city || !state || !zip) {
      alert('Please fill in address, city, state, and zip code before geocoding');
      setIsGeocoding(false);
      return;
    }

    const fullAddress = `${address1}, ${city}, ${state} ${zip}, ${country}`;
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(fullAddress)}&key=${apiKey}`
      );
      
      const data = await response.json();
      
      if (data.status === 'OK' && data.results.length > 0) {
        const { lat, lng } = data.results[0].geometry.location;
        const formattedAddress = data.results[0].formatted_address;
        form.setValue('lat', lat);
        form.setValue('lng', lng);
        alert(`✅ Address geocoded successfully!\nFound: ${formattedAddress}\nLatitude: ${lat}\nLongitude: ${lng}`);
      } else if (data.status === 'ZERO_RESULTS') {
        alert('❌ No results found for this address. Please check the address and try again.');
      } else if (data.status === 'REQUEST_DENIED') {
        alert('❌ Geocoding request denied. Please check your Google Maps API key permissions.');
      } else {
        alert('❌ Could not geocode address. Please enter coordinates manually or check the address.');
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      alert('Error geocoding address. Please enter coordinates manually.');
    }
    
    setIsGeocoding(false);
  };

  // Automatic geocoding function (silent, no alerts)
  const autoGeocodeAddress = useCallback(async (form: any) => {
    const address1 = form.getValues('address1');
    const city = form.getValues('city');
    const state = form.getValues('state');
    const zip = form.getValues('zip');
    const country = form.getValues('country');

    if (!address1 || !city || !state || !zip) {
      return; // Don't geocode if required fields are missing
    }

    const fullAddress = `${address1}, ${city}, ${state} ${zip}, ${country}`;
    
    // Don't geocode if address hasn't changed
    if (fullAddress === lastGeocodedAddress) {
      return;
    }

    setAutoGeocoding(true);
    setLastGeocodedAddress(fullAddress);
    
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(fullAddress)}&key=${apiKey}`
      );
      
      const data = await response.json();
      
      if (data.status === 'OK' && data.results.length > 0) {
        const { lat, lng } = data.results[0].geometry.location;
        form.setValue('lat', lat);
        form.setValue('lng', lng);
      }
    } catch (error) {
      console.error('Auto-geocoding error:', error);
    }
    
    setAutoGeocoding(false);
  }, [lastGeocodedAddress]);

  // Auto-geocode when address fields change (for editing stores)
  useEffect(() => {
    if (!store || !formRef) return; // Only auto-geocode when editing existing stores

    const subscription = formRef.watch((values: any, { name }: any) => {
      // Only geocode when address-related fields change
      if (['address1', 'city', 'state', 'zip', 'country'].includes(name || '')) {
        // Debounce the geocoding to avoid too many API calls
        const timeoutId = setTimeout(() => {
          autoGeocodeAddress(formRef);
        }, 1000); // 1 second delay

        return () => clearTimeout(timeoutId);
      }
    });

    return () => subscription.unsubscribe();
  }, [formRef, store, autoGeocodeAddress]);

  if (organizationsError) {
    return <div>Error: Something went wrong</div>;
  }

  return (
    <EntityFormModal<TStoreFormValues, IStore>
      isOpen={isOpen}
      loading={isLoadingOrganizations}
      onClose={onClose}
      title={store ? "Edit Store" : "Add New Store"}
      entity={store}
      formSchema={storeFormSchema}
      defaultValues={defaultValues}
      onSubmit={onSave}
      submitButtonText={
        isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {store ? "Updating..." : "Creating..."}
          </>
        ) : store ? (
          "Update Store"
        ) : (
          "Create Store"
        )
      }
      renderForm={(form) => {
        // Capture form reference for useEffect
        if (form !== formRef) {
          setFormRef(form);
        }

        return (
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
                    onValueChange={(value) => {
                      // Convert "none" back to null for the form
                      field.onChange(value === "none" ? null : value);
                    }}
                    disabled={isLoading}
                    value={field.value || "none"}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select organization (optional)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">No Organization</SelectItem>
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
                      value={field.value || ""}
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
            {/* Geocoding section */}
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => geocodeAddress(form)}
                  disabled={isLoading || isGeocoding || autoGeocoding}
                  className="flex items-center gap-2"
                >
                  {(isGeocoding || autoGeocoding) ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <MapPin className="h-4 w-4" />
                  )}
                  {isGeocoding ? 'Geocoding...' : autoGeocoding ? 'Auto-updating...' : 'Get Coordinates from Address'}
                </Button>
                <span className="text-sm text-muted-foreground">
                  {store ? 'Coordinates auto-update when address changes, or click to manually update' : 'Click to automatically fill coordinates from address'}
                </span>
              </div>
            </div>

            <FormField
              control={form.control}
              name="lat"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Latitude</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="any"
                      placeholder="Latitude (auto-filled or manual)"
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
              name="lng"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Longitude</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="any"
                      placeholder="Longitude (auto-filled or manual)"
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
        );
      }}
    />
  );
}
