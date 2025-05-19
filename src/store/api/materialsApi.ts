import { baseApi } from './baseApi';
import type { Material } from '@/types';
import { 
  ApiPaginatedResponse, 
  ApiEntityResponse,
  PaginationParams 
} from '@/types/api';

// API parameters
interface GetMaterialsParams extends PaginationParams {}

// Materials API
export const materialsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all materials with pagination
    getMaterials: builder.query<ApiPaginatedResponse<Material>, GetMaterialsParams | void>({
      query: (params: GetMaterialsParams = {}) => {
        const { page = 1, perPage = 100 } = params;
        return `materials?page=${page}&perPage=${perPage}`;
      },
      providesTags: (result) => 
        result 
          ? [
              ...result.data.map(({ id }) => ({ type: 'Material' as const, id })),
              { type: 'Material', id: 'LIST' },
            ]
          : [{ type: 'Material', id: 'LIST' }],
    }),
    
    // Get single material by ID
    getMaterial: builder.query<Material, string>({
      query: (id) => `materials/${id}`,
      transformResponse: (response: ApiEntityResponse<Material>) => response.data,
      providesTags: (result, error, id) => [{ type: 'Material', id }],
    }),
    
    // Create new material
    createMaterial: builder.mutation<Material, Partial<Material>>({
      query: (material) => ({
        url: 'materials',
        method: 'POST',
        body: material,
      }),
      transformResponse: (response: ApiEntityResponse<Material>) => response.data,
      invalidatesTags: [{ type: 'Material', id: 'LIST' }],
    }),
    
    // Update material
    updateMaterial: builder.mutation<Material, { id: string; material: Partial<Material> }>({
      query: ({ id, material }) => ({
        url: `materials/${id}`,
        method: 'PUT',
        body: material,
      }),
      transformResponse: (response: ApiEntityResponse<Material>) => response.data,
      invalidatesTags: (result, error, { id }) => [
        { type: 'Material', id },
        { type: 'Material', id: 'LIST' },
      ],
    }),
    
    // Delete material
    deleteMaterial: builder.mutation<void, string>({
      query: (id) => ({
        url: `materials/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Material', id },
        { type: 'Material', id: 'LIST' },
      ],
    }),
  }),
});

// Export hooks for usage in components
export const {
  useGetMaterialsQuery,
  useGetMaterialQuery,
  useCreateMaterialMutation,
  useUpdateMaterialMutation,
  useDeleteMaterialMutation,
} = materialsApi;