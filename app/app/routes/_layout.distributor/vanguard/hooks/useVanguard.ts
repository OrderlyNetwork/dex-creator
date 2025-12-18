import { useMemo, useCallback } from "react";
import { useQuery, usePrivateQuery, useMutation } from "../../../../net";
import { getChainById } from "../../../../../../config";
import { isMainnet } from "../../../../net";

// ==================== Constants ====================
const MAINNET_CHAIN_IDS = [1, 42161, 8453]; // Ethereum, Arbitrum, Base
const TESTNET_CHAIN_IDS = [11155111, 421614, 84532]; // Sepolia, Arbitrum Sepolia, Base Sepolia

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

export type VanguardChain = {
  chain_id: number;
  name: string;
  display_name?: string;
  withdrawal_fee: number;
  cross_chain_withdrawal_fee: number;
  decimals: number;
  isSupported: boolean;
};

export const useTokenInfo = (token: string = "USDC") => {
  const { data, isLoading, error } = useQuery<any>("/v1/public/token", {
    refreshInterval: 600000,
  });

  const tokenInfo = useMemo(() => {
    const rows =
      data?.data?.rows || data?.rows || (Array.isArray(data) ? data : []);
    if (!Array.isArray(rows)) return null;
    return rows.find((item: any) => item.token === token) || null;
  }, [data, token]);

  return {
    tokenInfo,
    isLoading,
    error,
  };
};

export const useVanguardChains = (token: string = "USDC") => {
  const { tokenInfo, isLoading: isLoadingTokenInfo } = useTokenInfo(token);
  const isMainnetEnv = isMainnet();

  const chains = useMemo(() => {
    if (!tokenInfo?.chain_details) {
      return [];
    }

    const supportedChainIds = isMainnetEnv
      ? MAINNET_CHAIN_IDS
      : [...MAINNET_CHAIN_IDS, ...TESTNET_CHAIN_IDS];

    const mappedChains = supportedChainIds
      .map((chainId): VanguardChain | null => {
        const detail = tokenInfo.chain_details.find(
          (item: any) => Number.parseInt(item.chain_id) === chainId
        );

        if (!detail) {
          return null;
        }

        const chainConfig = getChainById(chainId);
        const chainName = chainConfig?.name || `Chain ${chainId}`;

        return {
          chain_id: chainId,
          name: chainName,
          display_name: chainName,
          withdrawal_fee: detail.withdrawal_fee || 0,
          cross_chain_withdrawal_fee: detail.cross_chain_withdrawal_fee || 0,
          decimals: detail.decimals || 6,
          isSupported: true,
        };
      })
      .filter(
        (chain: VanguardChain | null): chain is VanguardChain => chain !== null
      );

    return mappedChains;
  }, [tokenInfo, isMainnetEnv]) as VanguardChain[];

  const findByChainId = useCallback(
    (chainId: number) => chains.find(chain => chain.chain_id === chainId),
    [chains]
  );

  return {
    chains,
    isLoading: isLoadingTokenInfo,
    findByChainId,
  };
};

export const useWithdrawFee = (
  token: string,
  chainId: number | null,
  crossChainWithdraw: boolean
) => {
  const { tokenInfo } = useTokenInfo(token);

  const fee = useMemo(() => {
    if (!tokenInfo || !chainId) {
      return 0;
    }

    const detail = tokenInfo.chain_details?.find(
      (item: any) => Number.parseInt(item.chain_id) === chainId
    );
    if (!detail) return 0;

    if (crossChainWithdraw) {
      return (
        (detail.withdrawal_fee || 0) + (detail.cross_chain_withdrawal_fee || 0)
      );
    }
    return detail.withdrawal_fee || 0;
  }, [tokenInfo, chainId, crossChainWithdraw]);

  return fee;
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
