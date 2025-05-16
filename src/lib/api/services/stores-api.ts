import { ApiService } from "@/lib/api/api-service";
import type { IStore } from "@/types";

class StoresApiService extends ApiService<IStore> {
  constructor() {
    super("/stores");
  }

  // Example of a custom method
  async getByOrganization(organizationId: string): Promise<IStore[]> {
    return this.request<IStore[]>("GET", "/organization", { organizationId });
  }
}

// Export a singleton instance
export const storesApi = new StoresApiService();
