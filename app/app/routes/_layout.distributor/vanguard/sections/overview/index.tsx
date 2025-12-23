import { useOverviewScript } from "./Overview.script";
import OverviewUI from "./Overview.ui";

export default function Overview() {
  const {
    data,
    onEditCode,
    configureDistributorCodeModalUiProps,
    onWithdrawClick,
    revenueWithdrawModalUiProps,
    isLoading,
    availableBalance,
    isLoadingBalance,
    isAmbassador,
  } = useOverviewScript();

  return (
    <OverviewUI
      data={data}
      onEditCode={onEditCode}
      configureDistributorCodeModalUiProps={
        configureDistributorCodeModalUiProps
      }
      onWithdrawClick={onWithdrawClick}
      revenueWithdrawModalUiProps={revenueWithdrawModalUiProps}
      isLoading={isLoading}
      availableBalance={availableBalance}
      isLoadingBalance={isLoadingBalance}
      isAmbassador={isAmbassador}
    />
  );
}
