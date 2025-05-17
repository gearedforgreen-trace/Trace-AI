"use client";

import { useState, useEffect, useCallback } from "react";
import type { ApiService } from "@/lib/api/api-service";
import type { IApiResponse } from "@/types";
import { ApiError } from "@/lib/api/error-handler";

// Hook for fetching data with pagination
export function useApiQuery<T>(
  apiMethod: () => Promise<IApiResponse<T>>,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T[]>([]);
  const [meta, setMeta] = useState<IApiResponse<T>["meta"] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await apiMethod();
      setData(result.data);
      setMeta(result.meta);
    } catch (err) {
      const apiError =
        err instanceof ApiError
          ? err
          : new ApiError(
              err instanceof Error ? err.message : "An error occurred",
              500
            );
      setError(apiError);
      console.error("API error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [apiMethod]);

  useEffect(() => {
    fetchData();
  }, [...dependencies, fetchData]);

  return { data, meta, isLoading, error, refetch: fetchData };
}

// Hook for mutations (create, update, delete)
export function useApiMutation<T, P>(apiMethod: (params: P) => Promise<T>) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = async (params: P) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await apiMethod(params);
      setData(result);
      return result;
    } catch (err) {
      const apiError =
        err instanceof ApiError
          ? err
          : new ApiError(
              err instanceof Error ? err.message : "An error occurred",
              500
            );
      setError(apiError);
      console.error("API error:", err);
      throw apiError; // Re-throw to allow caller to handle
    } finally {
      setIsLoading(false);
    }
  };

  return { data, isLoading, error, mutate };
}

// Hook for CRUD operations on an entity with pagination
export function useApiCrud<T extends { id?: string }>(
  apiService: ApiService<T>
) {
  // State for entities and pagination
  const [entities, setEntities] = useState<T[]>([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    perPage: 20,
    total: 0,
    lastPage: 1,
    prev: null as number | null,
    next: null as number | null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch entities with pagination
  const fetchEntities = useCallback(
    async (page = 1, perPage = 20) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await apiService.getAll(page, perPage);
        setEntities(response.data);
        setPagination({
          currentPage: response.meta.currentPage,
          perPage: response.meta.perPage,
          total: response.meta.total,
          lastPage: response.meta.lastPage,
          prev: response.meta.prev,
          next: response.meta.next,
        });
        return response;
      } catch (err) {
        const apiError =
          err instanceof ApiError
            ? err
            : new ApiError(
                err instanceof Error ? err.message : "Failed to fetch entities",
                500
              );
        setError(apiError);
        console.error("API error:", err);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [apiService]
  );

  // Load entities on mount
  useEffect(() => {
    fetchEntities(1, 20);
  }, [fetchEntities]);

  // Create entity
  const createEntity = async (data: Partial<T>): Promise<T | null> => {
    setIsLoading(true);
    try {
      const newEntity = await apiService.create(data);
      // Refresh the list after creating
      await fetchEntities(pagination.currentPage, pagination.perPage);
      return newEntity;
    } catch (err) {
      const apiError =
        err instanceof ApiError
          ? err
          : new ApiError(
              err instanceof Error ? err.message : "Failed to create entity",
              500
            );
      setError(apiError);
      console.error("API error:", err);
      throw apiError; // Re-throw to allow caller to handle
    } finally {
      setIsLoading(false);
    }
  };

  // Update entity
  const updateEntity = async ({
    id,
    data,
  }: {
    id: string;
    data: Partial<T>;
  }): Promise<T | null> => {
    if (!id) return null;

    setIsLoading(true);
    try {
      const updatedEntity = await apiService.update(id, data);
      // Refresh the list after updating
      await fetchEntities(pagination.currentPage, pagination.perPage);
      return updatedEntity;
    } catch (err) {
      const apiError =
        err instanceof ApiError
          ? err
          : new ApiError(
              err instanceof Error ? err.message : "Failed to update entity",
              500
            );
      setError(apiError);
      console.error("API error:", err);
      throw apiError; // Re-throw to allow caller to handle
    } finally {
      setIsLoading(false);
    }
  };

  // Delete entity
  const deleteEntity = async (id: string): Promise<boolean> => {
    if (!id) return false;

    setIsLoading(true);
    try {
      await apiService.delete(id);
      // Refresh the list after deleting
      await fetchEntities(pagination.currentPage, pagination.perPage);
      return true;
    } catch (err) {
      const apiError =
        err instanceof ApiError
          ? err
          : new ApiError(
              err instanceof Error ? err.message : "Failed to delete entity",
              500
            );
      setError(apiError);
      console.error("API error:", err);
      throw apiError; // Re-throw to allow caller to handle
    } finally {
      setIsLoading(false);
    }
  };

  // Change page
  const changePage = (page: number) => {
    if (page < 1 || page > pagination.lastPage) return;
    fetchEntities(page, pagination.perPage);
  };

  // Go to next page
  const goToNextPage = () => {
    if (pagination.next) {
      fetchEntities(pagination.next, pagination.perPage);
    }
  };

  // Go to previous page
  const goToPrevPage = () => {
    if (pagination.prev) {
      fetchEntities(pagination.prev, pagination.perPage);
    }
  };

  return {
    entities,
    pagination,
    isLoading,
    error,
    createEntity,
    updateEntity,
    deleteEntity,
    changePage,
    goToNextPage,
    goToPrevPage,
    refetch: () => fetchEntities(pagination.currentPage, pagination.perPage),
  };
}
