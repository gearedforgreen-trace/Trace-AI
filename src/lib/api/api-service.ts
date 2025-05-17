import api from "@/lib/api/axios-config";
import type { IApiResponse } from "@/types";
import { ApiError } from "@/lib/api/error-handler";

// Generic API service class
export class ApiService<T> {
  endpoint: string;

  constructor(endpoint: string) {
    this.endpoint = endpoint;
  }

  // Get all items with pagination
  async getAll(page = 1, perPage = 20): Promise<IApiResponse<T>> {
    try {
      console.log(`Fetching page ${page} with ${perPage} items per page`);
      const response = await api.get<IApiResponse<T>>(this.endpoint, {
        params: { page, perPage },
      });
      console.log("API Response:", response.data);
      return response.data;
    } catch (error) {
      console.error(`Error fetching ${this.endpoint}:`, error);
      throw ApiError.fromResponse(error);
    }
  }

  // Get item by ID
  async getById(id: string): Promise<T> {
    try {
      const response = await api.get<{ data: T }>(`${this.endpoint}/${id}`);
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching ${this.endpoint}/${id}:`, error);
      throw ApiError.fromResponse(error);
    }
  }

  // Create new item
  async create(data: Partial<T>): Promise<T> {
    try {
      const response = await api.post<{ data: T }>(this.endpoint, data);
      return response.data.data;
    } catch (error) {
      console.error(`Error creating ${this.endpoint}:`, error);
      throw ApiError.fromResponse(error);
    }
  }

  // Update item
  async update(id: string, data: Partial<T>): Promise<T> {
    try {
      const response = await api.put<{ data: T }>(
        `${this.endpoint}/${id}`,
        data
      );
      return response.data.data;
    } catch (error) {
      console.error(`Error updating ${this.endpoint}/${id}:`, error);
      throw ApiError.fromResponse(error);
    }
  }

  // Delete item
  async delete(id: string): Promise<void> {
    try {
      await api.delete(`${this.endpoint}/${id}`);
    } catch (error) {
      console.error(`Error deleting ${this.endpoint}/${id}:`, error);
      throw ApiError.fromResponse(error);
    }
  }

  // Custom request method for flexibility
  async request<R>(method: string, url: string, data?: any): Promise<R> {
    try {
      const response = await api.request<R>({
        method,
        url: `${this.endpoint}${url}`,
        data,
      });
      return response.data;
    } catch (error) {
      console.error(
        `Error in custom request to ${this.endpoint}${url}:`,
        error
      );
      throw ApiError.fromResponse(error);
    }
  }
}
