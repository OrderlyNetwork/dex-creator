import { Button } from "../../../components/Button";
import { useDex } from "../../../context/DexContext";
import { useCreateOrderlyKey } from "../../../hooks/useCreateOrderlyKey";
import { StepCard } from "./StepCard";
import { SuccessStepCard } from "./SuccessStepCard";
import { useTranslation } from "~/i18n";

export const OrderlyKeyCard = () => {
  const { t } = useTranslation();
  const { brokerId } = useDex();
  const { hasValidKey, isCreatingKey, createOrderlyKey, accountId } =
    useCreateOrderlyKey();

  const createKey = () => {
    if (!brokerId || !accountId) {
      return;
    }
    createOrderlyKey({ brokerId, accountId }).then(res => {});
  };

  if (hasValidKey) {
    return <SuccessStepCard title={t("distributor.orderlyKey")} />;
  }

  return (
    <StepCard
      title={t("distributor.orderlyKey")}
      description={t("distributor.orderlyKeyDescription")}
      action={
        <Button
          variant="primary"
          size="md"
          onClick={createKey}
          disabled={isCreatingKey}
          isLoading={isCreatingKey}
          className="shrink-0"
        >
          {t("distributor.createKey")}
        </Button>
      }
    />
  );
};
