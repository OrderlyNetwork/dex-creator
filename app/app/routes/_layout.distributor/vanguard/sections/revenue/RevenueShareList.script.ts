import { useMemo, useState } from "react";
import { formatUTCToLocalDateTime } from "../../utils";
import { useVanguardRevenueShareHistory } from "../../hooks/useVanguard";
import { useRevenueShareDetailsModalScript } from "../revenueShareDetailsModal/RevenueShareDetailsModal.script";

export const useRevenueShareScript = () => {
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);

  const {
    data: revenueData,
    meta,
    isLoading,
  } = useVanguardRevenueShareHistory(page, pageSize);

  const data = useMemo(
    () =>
      revenueData.map((item: any) => ({
        id: item.revenue_share_id,
        distributionTime: formatUTCToLocalDateTime(item.distribution_time),
        totalRevenueShare: item.total_revenue_share,
        totalInviteeVolume: item.total_invitee_volume,
        brokerTier: item.tier,
        revenueShareId: item.revenue_share_id,
        periodStartTime: formatUTCToLocalDateTime(
          item.revenue_share_start_time
        ),
        periodEndTime: formatUTCToLocalDateTime(item.revenue_share_end_time),
      })),
    [revenueData]
  );

  const pagination = {
    current: page,
    pageSize,
    total: meta?.total || 0,
    onPageChange: setPage,
    currentPage: meta?.current_page || page,
  };

  const onViewDetails = (record: any) => {
    setSelectedRecord(record);
    setIsModalOpen(true);
  };

  const onModalClose = () => {
    setIsModalOpen(false);
    setSelectedRecord(null);
  };

  const revenueShareDetailsModalUiProps = useRevenueShareDetailsModalScript({
    open: isModalOpen,
    onClose: onModalClose,
    data: selectedRecord,
  });

  return {
    dataSource: data,
    pagination,
    isLoading,
    onViewDetails,
    revenueShareDetailsModalUiProps,
    currentPage: meta?.current_page || page,
  };
};
