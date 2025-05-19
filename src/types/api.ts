// API response types for use with RTK Query

// Standard paginated response from API
export interface ApiPaginatedResponse<T> {
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

// Single entity response
export interface ApiEntityResponse<T> {
  data: T;
}

// Common pagination parameters
export interface PaginationParams {
  page?: number;
  perPage?: number;
}

// Helper types for common CRUD operations
export type GetEntityParams<T> = PaginationParams & Partial<T>;
export type CreateEntityParams<T> = Partial<T>;
export type UpdateEntityParams<T, K = string> = { id: K; data: Partial<T> };
export type DeleteEntityParams<K = string> = K;