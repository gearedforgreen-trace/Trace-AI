import { ApiService } from "@/lib/api/api-service";
import type { IRewardRule } from "@/types";

class RewardRulesApiService extends ApiService<IRewardRule> {
  constructor() {
    super("/reward-rules");
  }
}

// Export a singleton instance
export const rewardRulesApi = new RewardRulesApiService();
