import { ApiService } from "../api-service";
import type { IOrganization } from "@/types";
import api from "@/lib/api/axios-config";
import { ApiError } from "@/lib/api/error-handler";
import type { IApiResponse } from "@/types";

class OrganizationsApiService extends ApiService<IOrganization> {
  constructor() {
    super("/organizations");
  }

  // Get all organizations without pagination
  async getAllOrganizations(): Promise<IOrganization[]> {
    try {
      const response = await api.get<IApiResponse<IOrganization>>(this.endpoint, {
        params: { page: 1, perPage: 100 },
      });
      return response.data.data;
    } catch (error) {
      console.error("Error fetching organizations:", error);
      // Return empty array on error to avoid breaking the UI
      return [];
    }
  }
  
  // Fetch unique organizations from stores
  async getOrganizationsFromStores(): Promise<IOrganization[]> {
    try {
      // Get all stores
      const response = await api.get('/stores', {
        params: { page: 1, perPage: 100 }
      });
      
      // Extract unique organization IDs and names
      const orgMap = new Map<string, IOrganization>();
      
      if (response.data && response.data.data) {
        response.data.data.forEach((store: any) => {
          if (store.organizationId) {
            orgMap.set(store.organizationId, {
              id: store.organizationId,
              name: store.organizationName || `Organization ${store.organizationId}`,
              slug: null,
              logo: null,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              metadata: null
            });
          }
        });
      }
      
      return Array.from(orgMap.values());
    } catch (error) {
      console.error("Error fetching organizations from stores:", error);
      return [];
    }
  }
}

// Export a singleton instance
export const organizationsApi = new OrganizationsApiService();