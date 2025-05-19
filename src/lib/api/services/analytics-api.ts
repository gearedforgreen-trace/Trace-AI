import { ApiService } from "@/lib/api/api-service";

// Types for analytics data
export interface UsersByOrganization {
  organizationId: string;
  organizationName: string;
  userCount: number;
}

export interface StoresByOrganization {
  organizationId: string;
  organizationName: string;
  storeCount: number;
}

export interface BinsByStore {
  storeId: string;
  storeName: string;
  materialId: string;
  materialName: string;
  organizationId: string;
  organizationName: string;
  binCount: number;
}

export interface RecyclingActivityByMaterial {
  materialId: string;
  materialName: string;
  recycleCount: number;
  totalPoints: number;
}

export interface UserEngagement {
  userId: string;
  userName: string;
  recycleCount: number;
  totalPoints: number;
  activeDays: number;
  lastActivity: Date;
}

export interface PointsAndRewards {
  totalPointsEarned: number;
  totalRecyclingCount: number;
  totalPointsRedeemed: number;
  redeemedPointsPercent: number;
  availableCoupons: number;
}

export interface AnalyticsData {
  usersByOrganization: UsersByOrganization[];
  storesByOrganization: StoresByOrganization[];
  binsByStore: BinsByStore[];
  recyclingActivityByMaterial: RecyclingActivityByMaterial[];
  userEngagement: UserEngagement[];
  pointsAndRewards: PointsAndRewards;
}

export class AnalyticsApiService extends ApiService<AnalyticsData> {
  constructor() {
    super("analytics");
  }

  // Get analytics data with optional filters
  async getAnalyticsData(params?: {
    organizationId?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<AnalyticsData> {
    try {
      // Create query parameters
      const queryParams: string[] = [];
      
      if (params?.organizationId) {
        queryParams.push(`organizationId=${encodeURIComponent(params.organizationId)}`);
      }
      
      if (params?.startDate) {
        queryParams.push(`startDate=${encodeURIComponent(params.startDate.toISOString())}`);
      }
      
      if (params?.endDate) {
        queryParams.push(`endDate=${encodeURIComponent(params.endDate.toISOString())}`);
      }
      
      const queryString = queryParams.length > 0 ? `?${queryParams.join("&")}` : "";
      
      // Use the custom request method to handle this special endpoint
      const response = await this.request<{ data: AnalyticsData }>("GET", queryString);
      
      return response.data;
    } catch (error) {
      console.error("Error fetching analytics data:", error);
      throw error;
    }
  }
}