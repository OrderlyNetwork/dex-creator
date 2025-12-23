import React from "react";
import RevenueWithdrawModalUI from "./revenueWithdrawModal.ui";
import {
  RevenueWithdrawModalScriptProps,
  useRevenueWithdrawModalScript,
} from "./revenueWithdrawModal.script";

export type RevenueWithdrawModalProps = RevenueWithdrawModalScriptProps;

const RevenueWithdrawModal: React.FC<RevenueWithdrawModalProps> = props => {
  const uiProps = useRevenueWithdrawModalScript(props);
  return <RevenueWithdrawModalUI {...uiProps} />;
};

export default RevenueWithdrawModal;
