"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StoresTable } from "./stores-table";
import { StoreModal } from "./stores-modal";
import { IStore } from "@/types";

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
  const [stores, setStores] = useState<IStore[]>(mockStores);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentStore, setCurrentStore] = useState<IStore | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const storesPerPage = 5;

  // Calculate pagination
  const indexOfLastStore = currentPage * storesPerPage;
  const indexOfFirstStore = indexOfLastStore - storesPerPage;
  const currentStores = stores.slice(indexOfFirstStore, indexOfLastStore);
  const totalPages = Math.ceil(stores.length / storesPerPage);

  const handleEdit = (store: IStore) => {
    setCurrentStore(store);
    setIsModalOpen(true);
  };

  const handleDelete = (storeId: string) => {
    setStores(stores.filter((store) => store.id !== storeId));
  };

  const handleSave = (updatedStore: IStore) => {
    if (currentStore) {
      // Update existing store
      setStores(
        stores.map((store) =>
          store.id === updatedStore.id ? updatedStore : store
        )
      );
    } else {
      // Add new store
      const newStore = {
        ...updatedStore,
        id: (stores.length + 1).toString(),
        organizationId: "org_123",
      };
      setStores([...stores, newStore]);
    }
    setIsModalOpen(false);
    setCurrentStore(null);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          onClick={() => {
            setCurrentStore(null);
            setIsModalOpen(true);
          }}
          className="bg-green-600 hover:bg-green-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Store
        </Button>
      </div>

      <StoresTable
        stores={currentStores}
        onEdit={handleEdit}
        onDelete={handleDelete}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />

      <StoreModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setCurrentStore(null);
        }}
        store={currentStore}
        onSave={handleSave}
      />
    </div>
  );
}
