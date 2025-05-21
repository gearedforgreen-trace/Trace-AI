import { baseApi } from './baseApi';

// Analytics data types
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

export interface DashboardSummary {
  totalUsers: number;
  totalStores: number;
  totalBins: number;
  totalCoupons: number;
  totalPoints: number;
  totalRecyclingActivities: number;
  recentActivities: RecentActivity[];
  monthlyPoints: MonthlyPointsData[];
}

export interface RecentActivity {
  id: string;
  type: 'user_registration' | 'recycling' | 'coupon_redemption' | 'organization_created';
  description: string;
  timestamp: string;
  userId?: string;
  userName?: string;
}

export interface MonthlyPointsData {
  month: string;
  points: number;
  recycleCount: number;
}

// API parameters
interface GetAnalyticsParams {
  organizationId?: string;
  startDate?: string;
  endDate?: string;
}

// Analytics API
export const analyticsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get comprehensive analytics data
    getAnalytics: builder.query<{ data: AnalyticsData }, GetAnalyticsParams | void>({
      query: (params = {}) => {
        const searchParams = new URLSearchParams();
        
        if (params.organizationId) {
          searchParams.append('organizationId', params.organizationId);
        }
        if (params.startDate) {
          searchParams.append('startDate', params.startDate);
        }
        if (params.endDate) {
          searchParams.append('endDate', params.endDate);
        }
        
        const queryString = searchParams.toString();
        return `analytics${queryString ? `?${queryString}` : ''}`;
      },
      providesTags: ['Analytics'],
    }),
    
    // Get dashboard summary data
    getDashboardSummary: builder.query<{ data: DashboardSummary }, void>({
      query: () => 'analytics/dashboard-summary',
      providesTags: ['Dashboard', 'Analytics'],
    }),
  }),
});

// Export hooks for usage in components
export const {
  useGetAnalyticsQuery,
  useGetDashboardSummaryQuery,
} = analyticsApi;