import { baseApi } from './baseApi';
import type { Store } from '@/types';
import { 
  ApiPaginatedResponse, 
  ApiEntityResponse,
  PaginationParams 
} from '@/types/api';

// API parameters
interface GetStoresParams extends PaginationParams {
  organizationId?: string;
  name?: string;
  materials?: string; // comma-separated material IDs
  lat?: number;
  lng?: number;
  maxDistance?: number; // in kilometers
}

// Store API
export const storesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all stores with pagination and optional filtering
    getStores: builder.query<ApiPaginatedResponse<Store>, GetStoresParams | void>({
      query: (params: GetStoresParams = {}) => {
        const { 
          page = 1, 
          perPage = 20, 
          organizationId, 
          name, 
          materials, 
          lat, 
          lng, 
          maxDistance 
        } = params;
        
        let url = `stores?page=${page}&perPage=${perPage}`;
        
        if (organizationId) {
          url += `&organizationId=${organizationId}`;
        }
        if (name) {
          url += `&name=${encodeURIComponent(name)}`;
        }
        if (materials) {
          url += `&materials=${encodeURIComponent(materials)}`;
        }
        if (lat !== undefined && lng !== undefined) {
          url += `&lat=${lat}&lng=${lng}`;
        }
        if (maxDistance !== undefined) {
          url += `&maxDistance=${maxDistance}`;
        }
        
        return url;
      },
      providesTags: (result) => 
        result 
          ? [
              ...result.data.map(({ id }) => ({ type: 'Store' as const, id })),
              { type: 'Store', id: 'LIST' },
            ]
          : [{ type: 'Store', id: 'LIST' }],
    }),
    
    // Get single store by ID
    getStore: builder.query<Store, string>({
      query: (id) => `stores/${id}`,
      transformResponse: (response: ApiEntityResponse<Store>) => response.data,
      providesTags: (result, error, id) => [{ type: 'Store', id }],
    }),
    
    // Create new store
    createStore: builder.mutation<Store, Partial<Store>>({
      query: (store) => ({
        url: 'stores',
        method: 'POST',
        body: store,
      }),
      transformResponse: (response: ApiEntityResponse<Store>) => response.data,
      invalidatesTags: [{ type: 'Store', id: 'LIST' }],
    }),
    
    // Update store
    updateStore: builder.mutation<Store, { id: string; store: Partial<Store> }>({
      query: ({ id, store }) => ({
        url: `stores/${id}`,
        method: 'PUT',
        body: store,
      }),
      transformResponse: (response: ApiEntityResponse<Store>) => response.data,
      invalidatesTags: (result, error, { id }) => [
        { type: 'Store', id },
        { type: 'Store', id: 'LIST' },
      ],
    }),
    
    // Delete store
    deleteStore: builder.mutation<void, string>({
      query: (id) => ({
        url: `stores/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Store', id },
        { type: 'Store', id: 'LIST' },
      ],
    }),
  }),
});

// Export hooks for usage in components
export const {
  useGetStoresQuery,
  useGetStoreQuery,
  useCreateStoreMutation,
  useUpdateStoreMutation,
  useDeleteStoreMutation,
} = storesApi;