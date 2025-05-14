"use client";

import { useState } from "react";
import { useEntityCrud } from "@/hooks/use-entity-crud";
import { EntityHeader } from "@/components/ui/entity-header";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import type { IStore } from "@/types";
import { StoresTable } from "./stores-table";
import { StoreFormModal } from "./store-form-modal";

// Mock data for demonstration
const mockStores: IStore[] = [
  {
    id: "1",
    name: "Downtown Market",
    description: "Premium grocery store in the heart of downtown",
    imageUrl: "/placeholder.svg?height=40&width=40",
    status: "active",
    address: "123 Main Street",
    city: "New York",
    state: "NY",
    zip: "10001",
    country: "USA",
    lat: 40.7128,
    lng: -74.006,
    organizationId: "org_123",
  },
  {
    id: "2",
    name: "Westside Pharmacy",
    description: "24/7 pharmacy with prescription services",
    imageUrl: "/placeholder.svg?height=40&width=40",
    status: "active",
    address: "456 West Avenue",
    city: "Los Angeles",
    state: "CA",
    zip: "90001",
    country: "USA",
    lat: 34.0522,
    lng: -118.2437,
    organizationId: "org_123",
  },
  {
    id: "3",
    name: "Northside Electronics",
    description: "Electronics and gadgets store",
    imageUrl: "/placeholder.svg?height=40&width=40",
    status: "inactive",
    address: "789 North Blvd",
    city: "Chicago",
    state: "IL",
    zip: "60007",
    country: "USA",
    lat: 41.8781,
    lng: -87.6298,
    organizationId: "org_123",
  },
  {
    id: "4",
    name: "Eastside Cafe",
    description: "Cozy cafe with fresh pastries",
    imageUrl: "/placeholder.svg?height=40&width=40",
    status: "active",
    address: "321 East Road",
    city: "Boston",
    state: "MA",
    zip: "02108",
    country: "USA",
    lat: 42.3601,
    lng: -71.0589,
    organizationId: "org_123",
  },
  {
    id: "5",
    name: "Southside Apparel",
    description: "Fashion and clothing store",
    imageUrl: "/placeholder.svg?height=40&width=40",
    status: "active",
    address: "654 South Street",
    city: "Miami",
    state: "FL",
    zip: "33101",
    country: "USA",
    lat: 25.7617,
    lng: -80.1918,
    organizationId: "org_123",
  },
];

export default function StoresClient() {
  const [searchTerm, setSearchTerm] = useState("");

  const {
    entities: stores,
    currentEntity: currentStore,
    isModalOpen,
    isDeleteDialogOpen,
    entityToDelete,
    openCreateModal,
    openEditModal,
    closeModal,
    openDeleteDialog,
    closeDeleteDialog,
    handleSave,
    handleDelete,
  } = useEntityCrud<IStore>({
    initialEntities: mockStores,
  });

  return (
    <div className="space-y-4">
      <EntityHeader
        title="Store Locations"
        description="Manage your store locations and details"
        onAdd={openCreateModal}
        addButtonText="Add Store"
      />

      <StoresTable
        stores={stores}
        onEdit={openEditModal}
        onDelete={openDeleteDialog}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      <StoreFormModal
        isOpen={isModalOpen}
        onClose={closeModal}
        store={currentStore}
        onSave={handleSave}
      />

      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={closeDeleteDialog}
        onConfirm={handleDelete}
        title="Are you sure?"
        description={`This will permanently delete the store "${entityToDelete?.name}". This action cannot be undone.`}
        confirmText="Delete"
      />
    </div>
  );
}
