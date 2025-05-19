import { baseApi } from './baseApi';
import type { Coupon } from '@/types';
import { 
  ApiPaginatedResponse, 
  ApiEntityResponse,
  PaginationParams 
} from '@/types/api';

// API parameters
interface GetCouponsParams extends PaginationParams {
  organizationId?: string;
}

// Coupons API
export const couponsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all coupons with pagination and optional filtering
    getCoupons: builder.query<ApiPaginatedResponse<Coupon>, GetCouponsParams | void>({
      query: (params: GetCouponsParams = {}) => {
        const { page = 1, perPage = 20, organizationId } = params;
        let url = `coupons?page=${page}&perPage=${perPage}`;
        if (organizationId) {
          url += `&organizationId=${organizationId}`;
        }
        return url;
      },
      providesTags: (result) => 
        result 
          ? [
              ...result.data.map(({ id }) => ({ type: 'Coupon' as const, id })),
              { type: 'Coupon', id: 'LIST' },
            ]
          : [{ type: 'Coupon', id: 'LIST' }],
    }),
    
    // Get single coupon by ID
    getCoupon: builder.query<Coupon, string>({
      query: (id) => `coupons/${id}`,
      transformResponse: (response: ApiEntityResponse<Coupon>) => response.data,
      providesTags: (result, error, id) => [{ type: 'Coupon', id }],
    }),
    
    // Create new coupon
    createCoupon: builder.mutation<Coupon, Partial<Coupon>>({
      query: (coupon) => ({
        url: 'coupons',
        method: 'POST',
        body: coupon,
      }),
      transformResponse: (response: ApiEntityResponse<Coupon>) => response.data,
      invalidatesTags: [{ type: 'Coupon', id: 'LIST' }],
    }),
    
    // Update coupon
    updateCoupon: builder.mutation<Coupon, { id: string; coupon: Partial<Coupon> }>({
      query: ({ id, coupon }) => ({
        url: `coupons/${id}`,
        method: 'PUT',
        body: coupon,
      }),
      transformResponse: (response: ApiEntityResponse<Coupon>) => response.data,
      invalidatesTags: (result, error, { id }) => [
        { type: 'Coupon', id },
        { type: 'Coupon', id: 'LIST' },
      ],
    }),
    
    // Delete coupon
    deleteCoupon: builder.mutation<void, string>({
      query: (id) => ({
        url: `coupons/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Coupon', id },
        { type: 'Coupon', id: 'LIST' },
      ],
    }),
  }),
});

// Export hooks for usage in components
export const {
  useGetCouponsQuery,
  useGetCouponQuery,
  useCreateCouponMutation,
  useUpdateCouponMutation,
  useDeleteCouponMutation,
} = couponsApi;