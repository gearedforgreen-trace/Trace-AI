import { baseApi } from './baseApi';
import type { Bin } from '@/types';
import { 
  ApiPaginatedResponse, 
  ApiEntityResponse,
  PaginationParams 
} from '@/types/api';

// API parameters
interface GetBinsParams extends PaginationParams {
  storeIds?: string[];
  organizationId?: string;
}

// Bins API
export const binsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all bins with pagination and optional filtering
    getBins: builder.query<ApiPaginatedResponse<Bin>, GetBinsParams | void>({
      query: (params: GetBinsParams = {}) => {
        const { page = 1, perPage = 20, storeIds, organizationId } = params;
        let url = `bins?page=${page}&perPage=${perPage}`;
        if (storeIds && storeIds.length > 0) {
          url += `&storeIds=${storeIds.join(',')}`;
        }
        if (organizationId) {
          url += `&organizationId=${organizationId}`;
        }
        return url;
      },
      providesTags: (result) => 
        result 
          ? [
              ...result.data.map(({ id }) => ({ type: 'Bin' as const, id })),
              { type: 'Bin', id: 'LIST' },
            ]
          : [{ type: 'Bin', id: 'LIST' }],
    }),
    
    // Get single bin by ID
    getBin: builder.query<Bin, string>({
      query: (id) => `bins/${id}`,
      transformResponse: (response: ApiEntityResponse<Bin>) => response.data,
      providesTags: (result, error, id) => [{ type: 'Bin', id }],
    }),
    
    // Create new bin
    createBin: builder.mutation<Bin, Partial<Bin>>({
      query: (bin) => ({
        url: 'bins',
        method: 'POST',
        body: bin,
      }),
      transformResponse: (response: ApiEntityResponse<Bin>) => response.data,
      invalidatesTags: [{ type: 'Bin', id: 'LIST' }],
    }),
    
    // Update bin
    updateBin: builder.mutation<Bin, { id: string; bin: Partial<Bin> }>({
      query: ({ id, bin }) => ({
        url: `bins/${id}`,
        method: 'PUT',
        body: bin,
      }),
      transformResponse: (response: ApiEntityResponse<Bin>) => response.data,
      invalidatesTags: (result, error, { id }) => [
        { type: 'Bin', id },
        { type: 'Bin', id: 'LIST' },
      ],
    }),
    
    // Delete bin
    deleteBin: builder.mutation<void, string>({
      query: (id) => ({
        url: `bins/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Bin', id },
        { type: 'Bin', id: 'LIST' },
      ],
    }),

    // Scan bin QR code
    scanBin: builder.mutation<{
      message: string;
      data: {
        bin: {
          id: string;
          number: string;
          description?: string;
          status: string;
        };
        material: {
          id: string;
          name: string;
          description?: string;
        };
        store: {
          id: string;
          name: string;
          address1: string;
          city: string;
          state: string;
          organizationName?: string;
        };
        rewardRule?: {
          id: string;
          name: string;
          description?: string;
          unitType: string;
          unit: number;
          point: number;
        };
        instructions: string;
      };
    }, { binId: string }>({
      query: ({ binId }) => ({
        url: 'bins/scan',
        method: 'POST',
        body: { binId },
      }),
      invalidatesTags: [],
    }),
  }),
});

// Export hooks for usage in components
export const {
  useGetBinsQuery,
  useGetBinQuery,
  useCreateBinMutation,
  useUpdateBinMutation,
  useDeleteBinMutation,
  useScanBinMutation,
} = binsApi;