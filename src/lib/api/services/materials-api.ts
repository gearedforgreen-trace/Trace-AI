import { ApiService } from "@/lib/api/api-service";
import type { IMaterial } from "@/types";

class MaterialsApiService extends ApiService<IMaterial> {
  constructor() {
    super("/materials");
  }
}

// Export a singleton instance
export const materialsApi = new MaterialsApiService();
