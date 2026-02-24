import { useDex } from "../../../context/DexContext";
import { CreateDexButton } from "./CreateDexButton";
import { StepCard } from "./StepCard";
import { SuccessStepCard } from "./SuccessStepCard";
import { useTranslation } from "~/i18n";

export const DexCreationCard = () => {
  const { t } = useTranslation();
  const { dexData } = useDex();

  if (dexData) {
    return (
      <SuccessStepCard
        title={t("distributor.dexCreation")}
        value={dexData.brokerName}
      />
    );
  }

  return (
    <StepCard
      title={t("distributor.dexCreation")}
      description={t("distributor.dexCreationDesc")}
      action={<CreateDexButton />}
    />
  );
};
