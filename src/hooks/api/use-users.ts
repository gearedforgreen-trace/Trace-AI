"use client";

import { useState, useEffect, useCallback } from "react";
import { UsersApiService, User, UserFilterParams } from "@/lib/api/services/users-api";
import { ApiError } from "@/lib/api/error-handler";

const usersApi = new UsersApiService();

export function useUsers(initialFilters: UserFilterParams = {}) {
  const [users, setUsers] = useState<User[]>([]);
  const [filterOptions, setFilterOptions] = useState<{
    states: string[];
    statusOptions: string[];
    roleOptions: string[];
  }>({
    states: [],
    statusOptions: [],
    roleOptions: [],
  });
  const [pagination, setPagination] = useState({
    currentPage: initialFilters.page || 1,
    perPage: initialFilters.perPage || 10,
    total: 0,
    lastPage: 1,
    prev: null as number | null,
    next: null as number | null,
  });
  const [filters, setFilters] = useState<UserFilterParams>(initialFilters);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchUsers = useCallback(async (updatedFilters?: UserFilterParams) => {
    setIsLoading(true);
    setError(null);

    try {
      const mergedFilters = { ...filters, ...updatedFilters };
      const result = await usersApi.getUsers(mergedFilters);
      
      setUsers(result.data);
      setPagination({
        currentPage: result.meta.currentPage,
        perPage: result.meta.perPage,
        total: result.meta.total,
        lastPage: result.meta.lastPage,
        prev: result.meta.prev,
        next: result.meta.next,
      });
      setFilterOptions(result.filters);
      
      if (updatedFilters) {
        setFilters(mergedFilters);
      }
      
      return result;
    } catch (err) {
      const apiError =
        err instanceof ApiError
          ? err
          : new ApiError(
              err instanceof Error ? err.message : "Failed to fetch users",
              500
            );
      setError(apiError);
      console.error("Users API error:", err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  // Initial fetch
  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update filters and fetch data
  const updateFilters = useCallback(
    async (newFilters: UserFilterParams) => {
      // Reset to page 1 when changing filters other than page
      const filtersToApply = { ...newFilters };
      if (
        (newFilters.search !== undefined && newFilters.search !== filters.search) ||
        (newFilters.status !== undefined && newFilters.status !== filters.status) ||
        (newFilters.role !== undefined && newFilters.role !== filters.role) ||
        (newFilters.state !== undefined && newFilters.state !== filters.state) ||
        (newFilters.sortBy !== undefined && newFilters.sortBy !== filters.sortBy) ||
        (newFilters.sortOrder !== undefined && newFilters.sortOrder !== filters.sortOrder) ||
        (newFilters.perPage !== undefined && newFilters.perPage !== filters.perPage)
      ) {
        filtersToApply.page = 1;
      }

      return fetchUsers(filtersToApply);
    },
    [fetchUsers, filters]
  );

  // Change page
  const changePage = useCallback(
    (page: number) => {
      if (page < 1 || page > pagination.lastPage) return;
      return updateFilters({ page });
    },
    [updateFilters, pagination.lastPage]
  );

  return {
    users,
    isLoading,
    error,
    pagination,
    filters,
    filterOptions,
    updateFilters,
    changePage,
    refetch: fetchUsers,
  };
}