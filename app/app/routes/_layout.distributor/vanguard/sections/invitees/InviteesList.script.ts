import { useMemo, useState } from "react";
import { toast } from "react-toastify";
import {
  useVanguardInvitees,
  useUpdateMinBrokerTier,
  useVanguardSummary,
} from "../../hooks/useVanguard";
import { useConfigureMinTierModalScript } from "../minTierModal/MinTierModal.script";

export const useInviteesScript = () => {
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);

  const {
    data: inviteesData,
    meta,
    isLoading,
    mutate,
  } = useVanguardInvitees(page, pageSize);
  const { trigger: updateTier } = useUpdateMinBrokerTier();
  const { data: summaryData } = useVanguardSummary();

  const data = useMemo(
    () =>
      inviteesData.map((item: any) => ({
        id: item.address,
        address: item.address,
        brokerId: item.broker_id,
        brokerName: item.broker_name,
        volume: item.volume_last30_days,
        minTier: item.min_tier,
        effectiveTier: item.tier,
        takerFee: item.base_taker_fee_rate,
        makerFee: item.base_maker_fee_rate,
        rwaTakerFee: item.base_rwa_taker_fee_rate,
        rwaMakerFee: item.base_rwa_maker_fee_rate,
        status: item.status,
      })),
    [inviteesData]
  );

  const pagination = {
    current: page,
    pageSize,
    total: meta?.total || 0,
    onPageChange: setPage,
  };

  const canEditTier = !!summaryData?.tier_assignment_privilege;

  const onEditTier = (record: any) => {
    setSelectedRecord(record);
    setIsModalOpen(true);
  };

  const onModalClose = () => {
    setIsModalOpen(false);
    setSelectedRecord(null);
  };

  const onModalSave = async (tier: string) => {
    try {
      await updateTier({
        broker_id: selectedRecord.brokerId,
        min_broker_tier: tier,
      });
      toast.success("Minimum tier updated");
      mutate();
    } catch (e: any) {
      toast.error(e?.message || "Failed to update minimum tier");
      throw e;
    }
  };

  const minTierModalUiProps = useConfigureMinTierModalScript({
    open: isModalOpen,
    onClose: onModalClose,
    onSave: onModalSave,
    inviteeAddress: selectedRecord?.address || "",
    currentEffectiveTier: selectedRecord?.effectiveTier || "",
    currentMinTier: selectedRecord?.minTier || "",
  });

  return {
    dataSource: data,
    pagination,
    isLoading,
    onEditTier,
    minTierModalUiProps,
    canEditTier,
  };
};
