// API response types
export interface IApiResponse<T> {
  data: T[];
  meta: {
    total: number;
    lastPage: number;
    currentPage: number;
    perPage: number;
    prev: number | null;
    next: number | null;
  };
}

export interface IStore {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  status: string;
  organizationId: string | null;
  address1: string;
  address2: string | null;
  city: string;
  state: string;
  zip: string;
  country: string;
  lat: number;
  lng: number;
  createdAt: string;
  updatedAt: string;
}

export interface IProduct {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  price: number;
  status: string;
  storeId: string;
  category: string;
  inventory: number;
  sku: string;
}

export interface IUser {
  id: string;
  name: string;
  email: string;
  imageUrl: string;
  role: string;
  status: string;
  lastLogin: string;
  createdAt: string;
}

export type Store = IStore;
export type Product = IProduct;
