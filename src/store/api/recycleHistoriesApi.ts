import { Recycle, RecycleFilterParams } from "@/lib/api/services/recycles";
import { baseApi } from './baseApi';
import {
  ApiPaginatedResponse,
  ApiEntityResponse,
  PaginationParams
} from '@/types/api';

// Define RecycleHistory type based on the API response
interface RecycleHistory {
  id: string;
  userId: string;
  binId: string;
  points: number;
  materials: Array<{
    id: string;
    name: string;
    description?: string;
  }>;
  mediaUrl?: string;
  totalCount: number;
  createdAt: string;
  updatedAt: string;
}

// API parameters
interface GetRecycleHistoriesParams extends PaginationParams {
  userId?: string;
  binId?: string;
}

// RecycleHistories API
export const recycleHistoriesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all recycle histories with pagination and optional filtering
    getRecycleHistories: builder.query<ApiPaginatedResponse<RecycleHistory>, GetRecycleHistoriesParams | void>({
      query: (params: GetRecycleHistoriesParams = {}) => {
        const { page = 1, perPage = 20, userId, binId } = params;
        let url = `recycle-histories?page=${page}&perPage=${perPage}`;
        if (userId) {
          url += `&userId=${userId}`;
        }
        if (binId) {
          url += `&binId=${binId}`;
        }
        return url;
      },
      providesTags: (result) =>
        result
          ? [
            ...result.data.map(({ id }) => ({ type: 'RecycleHistory' as const, id })),
            { type: 'RecycleHistory', id: 'LIST' },
          ]
          : [{ type: 'RecycleHistory', id: 'LIST' }],
    }),

    // Get single recycle history by ID
    getRecycleHistory: builder.query<RecycleHistory, string>({
      query: (id) => `recycle-histories/${id}`,
      transformResponse: (response: ApiEntityResponse<RecycleHistory>) => response.data,
      providesTags: (result, error, id) => [{ type: 'RecycleHistory', id }],
    }),

    // Submit recycling activity
    submitRecycle: builder.mutation<{
      message: string;
      data: {
        id: string;
        pointsEarned: number;
        totalCount: number;
        material: {
          id: string;
          name: string;
          description?: string;
        };
        store: {
          id: string;
          name: string;
          organizationName?: string;
        };
        rewardRule?: {
          name: string;
          unitType: string;
          unit: number;
          point: number;
        };
        recycledAt: string;
        mediaUrl?: string;
      };
    }, { binId: string; totalCount: number; mediaUrl?: string }>({
      query: ({ binId, totalCount, mediaUrl }) => ({
        url: 'recycle-histories/submit',
        method: 'POST',
        body: { binId, totalCount, mediaUrl },
      }),
      invalidatesTags: [
        { type: 'RecycleHistory', id: 'LIST' },
        'UserTotalPoint',
        { type: 'Bin', id: 'LIST' },
      ],
    }),

    // Delete recycle history
    deleteRecycleHistory: builder.mutation<void, string>({
      query: (id) => ({
        url: `recycle-histories/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'RecycleHistory', id },
        { type: 'RecycleHistory', id: 'LIST' },
      ],
    }),

    getUserRecycles: builder.query<ApiPaginatedResponse<Recycle>, RecycleFilterParams>({
      query: (params: RecycleFilterParams = {}) => {

        const { page = 1, perPage = 20, userId, binId, materialId, storeId, searchMaterial, sortBy, sortOrder } = params;

        const searchParams = new URLSearchParams();

        searchParams.set('page', page.toString());
        searchParams.set('perPage', perPage.toString());

        if (storeId) {
          searchParams.set('storeId', storeId);
        }

        if (userId) {
          searchParams.set('userId', userId);
        }

        if (binId) {
          searchParams.set('binId', binId);
        }

        if (materialId) {
          searchParams.set('materialId', materialId);
        }

        if (searchMaterial) {
          searchParams.set('searchMaterial', searchMaterial);
        }

        if (sortBy) {
          searchParams.set('sortBy', sortBy);
        }

        if (sortOrder) {
          searchParams.set('sortOrder', sortOrder);
        }

        return `/user-recycle-histories?${searchParams.toString()}`;
      },
      providesTags: (result) =>
        result
          ? [
            ...result.data.map(({ id }) => ({ type: 'UserRecycles' as const, id })),
            { type: 'UserRecycles', id: 'LIST' },
          ]
          : [{ type: 'UserRecycles', id: 'LIST' }],
    }),
  }),
});

// Export hooks for usage in components
export const {
  useGetRecycleHistoriesQuery,
  useGetRecycleHistoryQuery,
  useSubmitRecycleMutation,
  useGetUserRecyclesQuery,
  useDeleteRecycleHistoryMutation,
} = recycleHistoriesApi;