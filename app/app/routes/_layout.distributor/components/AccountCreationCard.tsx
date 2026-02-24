import { useState } from "react";
import { Button } from "../../../components/Button";
import { useDex } from "../../../context/DexContext";
import { StepCard } from "./StepCard";
import { useAccount, useChainId, useWalletClient } from "wagmi";
import { BrowserProvider } from "ethers";
import { toast } from "react-toastify";
import { parseWalletError } from "../../../utils/wallet";
import { registerAccount } from "../../../utils/orderly";
import { useDistributor } from "../../../context/DistributorContext";
import { SuccessStepCard } from "./SuccessStepCard";
import { useTranslation } from "~/i18n";

type AccountCreationCardProps = {
  brokerId: string;
  onSuccess: (accountId: string) => void;
};

export const AccountCreationCard = (props: AccountCreationCardProps) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const { address } = useAccount();
  const chainId = useChainId();
  const { data: walletClient } = useWalletClient();
  const { setBrokerId } = useDex();

  const { isAmbassador } = useDistributor();

  const handleCreate = async () => {
    setLoading(true);
    try {
      const provider = new BrowserProvider(walletClient!);
      const signer = await provider.getSigner();

      const res = await registerAccount(
        signer,
        address!,
        chainId || 1,
        props.brokerId
      );
      props.onSuccess(res);
      toast.success(t("distributor.toastCreateAccount"));
      setBrokerId(props.brokerId);
    } catch (error: any) {
      console.error("Error creating account:", error);
      const message =
        parseWalletError(error) || t("distributor.toastFailedCreateAccount");
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (isAmbassador) {
    return <SuccessStepCard title={t("distributor.accountCreation")} />;
  }

  return (
    <StepCard
      title={t("distributor.accountCreation")}
      action={
        <Button
          variant="primary"
          size="md"
          onClick={handleCreate}
          disabled={loading}
          isLoading={loading}
          className="shrink-0"
        >
          {t("distributor.createAccount")}
        </Button>
      }
    />
  );
};
