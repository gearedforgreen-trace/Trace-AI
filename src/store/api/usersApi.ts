import { baseApi } from './baseApi';

// Response type for delete user operation
interface DeleteUserResponse {
  message: string;
  success: boolean;
}

// User API
export const usersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Delete current user account
    // This endpoint allows an authenticated user to delete their own account
    // Required by Apple App Store guidelines
    deleteCurrentUser: builder.mutation<DeleteUserResponse, void>({
      query: () => ({
        url: 'user',
        method: 'DELETE',
      }),
      invalidatesTags: [
        { type: 'User', id: 'CURRENT' },
        { type: 'RecycleHistory', id: 'LIST' },
        { type: 'RedeemHistory', id: 'LIST' },
        { type: 'UserTotalPoint', id: 'LIST' },
      ],
    }),
  }),
});

// Export hooks for usage in components
export const {
  useDeleteCurrentUserMutation,
} = usersApi;
