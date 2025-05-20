import { ApiService } from "@/lib/api/api-service";

// User interface
export interface User {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  username: string;
  displayUsername: string;
  image: string;
  phoneNumber: string;
  address: string;
  postalCode: string;
  state: string;
  status: string;
  role: string;
  organizations: {
    id: string;
    name: string;
    role: string;
  }[];
  totalPoints: number;
  createdAt: Date;
}

// Filter parameters
export interface UserFilterParams {
  page?: number;
  perPage?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  status?: string;
  role?: string;
  state?: string;
}

// Filter options
export interface UserFilterOptions {
  states: string[];
  statusOptions: string[];
  roleOptions: string[];
}

export class UsersApiService extends ApiService<User> {
  constructor() {
    super("users");
  }

  // Get single user by ID
  async getUser(id: string): Promise<User> {
    try {
      const response = await this.request<{ data: User }>("GET", `/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error in getUser:", error);
      throw error;
    }
  }

  // Update user
  async updateUser(id: string, userData: Partial<User>): Promise<User> {
    try {
      const response = await this.request<{ data: User }>("PUT", `/${id}`, userData);
      return response.data;
    } catch (error) {
      console.error("Error in updateUser:", error);
      throw error;
    }
  }

  // Update user status specifically (suspend, activate, ban)
  async updateUserStatus(id: string, status: "active" | "suspended" | "banned"): Promise<User> {
    try {
      const response = await this.request<{ data: User }>("PUT", `/${id}`, { status });
      return response.data;
    } catch (error) {
      console.error("Error in updateUserStatus:", error);
      throw error;
    }
  }

  // Get users with filters
  async getUsers(filters: UserFilterParams = {}): Promise<{
    data: User[];
    meta: {
      total: number;
      currentPage: number;
      perPage: number;
      lastPage: number;
      prev: number | null;
      next: number | null;
    };
    filters: UserFilterOptions;
  }> {
    try {
      // Build query parameters
      const queryParams: string[] = [];
      
      if (filters.page !== undefined) {
        queryParams.push(`page=${filters.page}`);
      }
      
      if (filters.perPage !== undefined) {
        queryParams.push(`perPage=${filters.perPage}`);
      }
      
      if (filters.sortBy) {
        queryParams.push(`sortBy=${filters.sortBy}`);
      }
      
      if (filters.sortOrder) {
        queryParams.push(`sortOrder=${filters.sortOrder}`);
      }
      
      if (filters.search) {
        queryParams.push(`search=${encodeURIComponent(filters.search)}`);
      }
      
      if (filters.status) {
        queryParams.push(`status=${filters.status}`);
      }
      
      if (filters.role) {
        queryParams.push(`role=${filters.role}`);
      }
      
      if (filters.state) {
        queryParams.push(`state=${filters.state}`);
      }
      
      const queryString = queryParams.length > 0 ? `?${queryParams.join("&")}` : "";
      
      const response = await this.request<{
        data: User[];
        meta: {
          total: number;
          currentPage: number;
          perPage: number;
          lastPage: number;
          prev: number | null;
          next: number | null;
        };
        filters: UserFilterOptions;
      }>("GET", queryString);
      
      return response;
    } catch (error) {
      console.error("Error in getUsers:", error);
      throw error;
    }
  }
}