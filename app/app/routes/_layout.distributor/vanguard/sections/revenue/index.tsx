import { useRevenueShareScript } from "./RevenueShareList.script";
import RevenueShareListUI from "./RevenueShareList.ui";

export default function RevenueShareList() {
  const {
    dataSource,
    pagination,
    isLoading,
    onViewDetails,
    revenueShareDetailsModalUiProps,
    currentPage,
  } = useRevenueShareScript();

  return (
    <RevenueShareListUI
      dataSource={dataSource}
      pagination={pagination}
      isLoading={isLoading}
      onViewDetails={onViewDetails}
      revenueShareDetailsModalUiProps={revenueShareDetailsModalUiProps}
      currentPage={currentPage}
    />
  );
}
