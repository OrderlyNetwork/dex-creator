import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { useAccount } from "wagmi";
import {
  getClientHolding,
  getAccountId,
  loadOrderlyKey,
} from "../../../../../utils/orderly";
import {
  useVanguardSummary,
  useUpdateDistributorCode,
} from "../../hooks/useVanguard";
import { useConfigureDistributorCodeModalScript } from "../configureDistributorCodeModal/ConfigureDistributorCodeModal.script";
import { useDex } from "../../../../../context/DexContext";
import { useDistributor } from "../../../../../context/DistributorContext";
export const useOverviewScript = () => {
  const { address } = useAccount();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [availableBalance, setAvailableBalance] = useState<number>(0);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const { data: summaryData, isLoading, mutate } = useVanguardSummary();
  const { trigger: updateCode } = useUpdateDistributorCode();
  const { brokerId } = useDex();
  const { isAmbassador } = useDistributor();

  const accountId = useMemo(() => {
    if (!address || !brokerId) return null;
    return getAccountId(address, brokerId);
  }, [address, brokerId]);

  const refreshBalance = useCallback(async () => {
    if (!accountId) {
      setAvailableBalance(0);
      return;
    }
    setIsLoadingBalance(true);
    try {
      const orderlyKey = loadOrderlyKey(accountId);
      if (!orderlyKey) {
        setAvailableBalance(0);
        return;
      }
      const holdings = await getClientHolding(accountId, orderlyKey);
      const usdcHolding = holdings.find(holding => holding.token === "USDC");
      setAvailableBalance(usdcHolding?.holding || 0);
    } catch (error) {
      console.error("Failed to fetch balance", error);
      setAvailableBalance(0);
    } finally {
      setIsLoadingBalance(false);
    }
  }, [accountId]);

  // Fetch available balance when accountId is available
  useEffect(() => {
    refreshBalance();
  }, [refreshBalance]);

  const data = useMemo(
    () => ({
      distributorCode: summaryData?.distributor_code || "--",
      historicalRevenueShare: summaryData?.revenue_share_all_time || 0,
      brokerTier: summaryData?.tier || "--",
      distributorUrl: summaryData?.distributor_url || "--",
    }),
    [summaryData]
  );

  const onEditCode = () => {
    setIsModalOpen(true);
  };

  const onModalClose = () => {
    setIsModalOpen(false);
  };

  const onModalSave = async (code: string) => {
    if (!brokerId) {
      toast.error("Broker id not found");
      return;
    }

    try {
      await updateCode({
        broker_id: brokerId,
        distributor_code: code,
      });
      toast.success("Distributor code updated");
      mutate();
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to update distributor code";
      toast.error(message);
      throw error;
    }
  };

  const configureDistributorCodeModalUiProps =
    useConfigureDistributorCodeModalScript({
      open: isModalOpen,
      onClose: onModalClose,
      currentCode: data.distributorCode,
      onSave: onModalSave,
    });

  const onWithdrawClick = () => {
    setIsWithdrawModalOpen(true);
  };

  const onWithdrawModalClose = () => {
    setIsWithdrawModalOpen(false);
  };

  const revenueWithdrawModalUiProps = {
    open: isWithdrawModalOpen,
    onClose: onWithdrawModalClose,
    availableBalance,
    isLoadingBalance,
    onWithdrawSuccess: () => {
      mutate();
      refreshBalance();
    },
  };

  return {
    data,
    isLoading,
    onEditCode,
    configureDistributorCodeModalUiProps,
    onWithdrawClick,
    revenueWithdrawModalUiProps,
    availableBalance,
    isLoadingBalance,
    isAmbassador,
  };
};
