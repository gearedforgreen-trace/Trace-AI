import { ApiService } from "@/lib/api/api-service";
import type { IBin } from "@/types";

class BinsApiService extends ApiService<IBin> {
  constructor() {
    super("/bins");
  }

  // Example of a custom method
  async getByStore(storeId: string): Promise<IBin[]> {
    return this.request<IBin[]>("GET", "/by-store", { storeId });
  }

  // Example of a custom method
  async getByMaterial(materialId: string): Promise<IBin[]> {
    return this.request<IBin[]>("GET", "/by-material", { materialId });
  }
}

// Export a singleton instance
export const binsApi = new BinsApiService();
