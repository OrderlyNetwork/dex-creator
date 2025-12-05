import { usePrivateQuery, useMutation } from "../../../../net";

// ==================== Query Hooks ====================

export const useVanguardSummary = () => {
  const { data, isLoading, error, mutate } = usePrivateQuery<any>(
    "/v1/vanguard/summary",
    {
      refreshInterval: 600000,
    }
  );
  return {
    data: data,
    isLoading,
    error,
    mutate,
  };
};

export const useVanguardInvitees = (page: number, size: number) => {
  const { data, isLoading, error, mutate } = usePrivateQuery<any>(
    `/v1/vanguard/invitees?page=${page}&size=${size}`,
    {
      formatter: data => data,
      refreshInterval: 600000,
    }
  );
  return {
    data: data?.rows || [],
    meta: data?.meta,
    isLoading,
    error,
    mutate,
  };
};

export const useVanguardMinTierList = () => {
  const { data, isLoading, error } = usePrivateQuery<any>(
    "/v1/vanguard/invitees/min_broker_tier_list",
    {
      refreshInterval: 600000,
    }
  );
  return {
    data: data || [],
    isLoading,
    error,
  };
};

export const useVanguardRevenueShareHistory = (page: number, size: number) => {
  const { data, isLoading, error, mutate } = usePrivateQuery<any>(
    `/v1/vanguard/revenue_share_history?page=${page}&size=${size}`,
    {
      formatter: data => data,
      refreshInterval: 600000,
    }
  );
  return {
    data: data?.rows || [],
    meta: data?.meta,
    isLoading,
    error,
    mutate,
  };
};

export const useVanguardRevenueShareDetails = (
  revenueShareId: string | null,
  page: number,
  size: number
) => {
  const { data, isLoading, error } = usePrivateQuery<any>(
    revenueShareId
      ? `/v1/vanguard/revenue_share_history/details?revenue_share_id=${revenueShareId}&page=${page}&size=${size}`
      : null,
    {
      formatter: data => data,
      refreshInterval: 600000,
    }
  );
  return {
    data: data?.rows || [],
    meta: data?.meta,
    summary: data?.summary,
    isLoading,
    error,
  };
};

export const useVerifyDistributorCode = (code: string | null) => {
  const { data, isLoading, error } = usePrivateQuery<any>(
    code ? `/v1/vanguard/verify_code?distributor_code=${code}` : null
  );
  return {
    exists: data?.exist,
    isLoading,
    error,
  };
};

// ==================== Mutation Hooks ====================

export const useUpdateDistributorCode = () => {
  const [trigger, { isMutating, error }] = useMutation(
    "/v1/vanguard/update",
    "POST"
  );
  return {
    trigger,
    isMutating,
    error,
  };
};

export const useUpdateMinBrokerTier = () => {
  const [trigger, { isMutating, error }] = useMutation(
    "/v1/vanguard/invitees/min_broker_tier",
    "POST"
  );
  return {
    trigger,
    isMutating,
    error,
  };
};
