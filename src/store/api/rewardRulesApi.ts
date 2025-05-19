import { baseApi } from './baseApi';
import type { RewardRule } from '@/types';
import { 
  ApiPaginatedResponse, 
  ApiEntityResponse,
  PaginationParams 
} from '@/types/api';

// API parameters
interface GetRewardRulesParams extends PaginationParams {}

// Reward Rules API
export const rewardRulesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all reward rules with pagination
    getRewardRules: builder.query<ApiPaginatedResponse<RewardRule>, GetRewardRulesParams | void>({
      query: (params: GetRewardRulesParams = {}) => {
        const { page = 1, perPage = 20 } = params;
        return `reward-rules?page=${page}&perPage=${perPage}`;
      },
      providesTags: (result) => 
        result 
          ? [
              ...result.data.map(({ id }) => ({ type: 'RewardRule' as const, id })),
              { type: 'RewardRule', id: 'LIST' },
            ]
          : [{ type: 'RewardRule', id: 'LIST' }],
    }),
    
    // Get single reward rule by ID
    getRewardRule: builder.query<RewardRule, string>({
      query: (id) => `reward-rules/${id}`,
      transformResponse: (response: ApiEntityResponse<RewardRule>) => response.data,
      providesTags: (result, error, id) => [{ type: 'RewardRule', id }],
    }),
    
    // Create new reward rule
    createRewardRule: builder.mutation<RewardRule, Partial<RewardRule>>({
      query: (rewardRule) => ({
        url: 'reward-rules',
        method: 'POST',
        body: rewardRule,
      }),
      transformResponse: (response: ApiEntityResponse<RewardRule>) => response.data,
      invalidatesTags: [{ type: 'RewardRule', id: 'LIST' }],
    }),
    
    // Update reward rule
    updateRewardRule: builder.mutation<RewardRule, { id: string; rewardRule: Partial<RewardRule> }>({
      query: ({ id, rewardRule }) => ({
        url: `reward-rules/${id}`,
        method: 'PUT',
        body: rewardRule,
      }),
      transformResponse: (response: ApiEntityResponse<RewardRule>) => response.data,
      invalidatesTags: (result, error, { id }) => [
        { type: 'RewardRule', id },
        { type: 'RewardRule', id: 'LIST' },
      ],
    }),
    
    // Delete reward rule
    deleteRewardRule: builder.mutation<void, string>({
      query: (id) => ({
        url: `reward-rules/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'RewardRule', id },
        { type: 'RewardRule', id: 'LIST' },
      ],
    }),
  }),
});

// Export hooks for usage in components
export const {
  useGetRewardRulesQuery,
  useGetRewardRuleQuery,
  useCreateRewardRuleMutation,
  useUpdateRewardRuleMutation,
  useDeleteRewardRuleMutation,
} = rewardRulesApi;