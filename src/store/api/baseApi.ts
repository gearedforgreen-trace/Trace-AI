import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Create a base API with reusable configuration
export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ 
    baseUrl: '/api/',
    prepareHeaders: (headers) => {
      // Add any common headers here
      return headers;
    },
  }),
  tagTypes: [
    'Organization', 
    'Store', 
    'Bin', 
    'Material',
    'Coupon',
    'RecycleHistory',
    'RedeemHistory',
    'RewardRule',
    'Analytics',
    'Dashboard',
    'UserTotalPoint',
    'UserRecycles',
  ],
  endpoints: () => ({}), // Empty endpoints - will be extended by injected endpoints
});