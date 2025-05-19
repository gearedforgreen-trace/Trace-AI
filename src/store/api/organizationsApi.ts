import { baseApi } from './baseApi';
import type { Organization } from '@/types';
import { 
  ApiPaginatedResponse, 
  ApiEntityResponse, 
  PaginationParams 
} from '@/types/api';

// API parameters
interface GetOrganizationsParams extends PaginationParams {}

// Organization API
export const organizationsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all organizations with pagination
    getOrganizations: builder.query<ApiPaginatedResponse<Organization>, GetOrganizationsParams | void>({
      query: (params: GetOrganizationsParams = {}) => {
        const { page = 1, perPage = 20 } = params;
        return `organizations?page=${page}&perPage=${perPage}`;
      },
      providesTags: (result) => 
        result 
          ? [
              ...result.data.map(({ id }) => ({ type: 'Organization' as const, id })),
              { type: 'Organization', id: 'LIST' },
            ]
          : [{ type: 'Organization', id: 'LIST' }],
    }),
    
    // Get single organization by ID
    getOrganization: builder.query<Organization, string>({
      query: (id) => `organizations/${id}`,
      transformResponse: (response: ApiEntityResponse<Organization>) => response.data,
      providesTags: (result, error, id) => [{ type: 'Organization', id }],
    }),
    
    // Create new organization
    createOrganization: builder.mutation<Organization, Partial<Organization>>({
      query: (organization) => ({
        url: 'organizations',
        method: 'POST',
        body: organization,
      }),
      transformResponse: (response: ApiEntityResponse<Organization>) => response.data,
      invalidatesTags: [{ type: 'Organization', id: 'LIST' }],
    }),
    
    // Update organization
    updateOrganization: builder.mutation<Organization, { id: string; organization: Partial<Organization> }>({
      query: ({ id, organization }) => ({
        url: `organizations/${id}`,
        method: 'PUT',
        body: organization,
      }),
      transformResponse: (response: ApiEntityResponse<Organization>) => response.data,
      invalidatesTags: (result, error, { id }) => [
        { type: 'Organization', id },
        { type: 'Organization', id: 'LIST' },
      ],
    }),
    
    // Delete organization
    deleteOrganization: builder.mutation<void, string>({
      query: (id) => ({
        url: `organizations/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Organization', id },
        { type: 'Organization', id: 'LIST' },
      ],
    }),
  }),
});

// Export hooks for usage in components
export const {
  useGetOrganizationsQuery,
  useGetOrganizationQuery,
  useCreateOrganizationMutation,
  useUpdateOrganizationMutation,
  useDeleteOrganizationMutation,
} = organizationsApi;