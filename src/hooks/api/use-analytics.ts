"use client";

import { useState, useEffect, useCallback } from "react";
import { AnalyticsApiService, AnalyticsData } from "@/lib/api/services/analytics-api";
import { ApiError } from "@/lib/api/error-handler";

const analyticsApi = new AnalyticsApiService();

interface UseAnalyticsParams {
  organizationId?: string;
  startDate?: Date;
  endDate?: Date;
}

export function useAnalytics(params?: UseAnalyticsParams) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAnalytics = useCallback(async (fetchParams?: UseAnalyticsParams) => {
    setIsLoading(true);
    setError(null);

    try {
      const mergedParams = { ...params, ...fetchParams };
      const result = await analyticsApi.getAnalyticsData(mergedParams);
      setData(result);
      return result;
    } catch (err) {
      const apiError =
        err instanceof ApiError
          ? err
          : new ApiError(
              err instanceof Error ? err.message : "Failed to fetch analytics data",
              500
            );
      setError(apiError);
      console.error("Analytics API error:", err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    params?.organizationId, 
    params?.startDate?.toString(), 
    params?.endDate?.toString()
  ]);

  return { data, isLoading, error, refetch: fetchAnalytics };
}