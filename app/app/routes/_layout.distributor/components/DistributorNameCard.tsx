import { useState } from "react";
import { Card } from "../../../components/Card";
import FormInput from "../../../components/FormInput";
import { useMutation } from "../../../net";
import {
  alphanumericWithSpecialChars,
  composeValidators,
  maxLength,
  minLength,
  required,
} from "../../../utils/validation";
import { toast } from "react-toastify";
import { Button } from "../../../components/Button";
import { useTranslation } from "~/i18n";

type DistributorNameCardProps = {
  onSuccess: () => void;
};

export const DistributorNameCard = (props: DistributorNameCardProps) => {
  const { t } = useTranslation();
  const [error, setError] = useState<string | null>(null);

  const [distributorName, setDistributorName] = useState("");

  const [updateAmbassadorName, { isMutating }] = useMutation(
    "/v1/orderly_one/vanguard/ambassador_name"
  );

  const distributorNameLabel = t("distributor.distributorNamePlaceholder");
  const distributorNameValidator = composeValidators(
    required(distributorNameLabel),
    minLength(4, distributorNameLabel),
    maxLength(30, distributorNameLabel),
    alphanumericWithSpecialChars(distributorNameLabel)
  );

  const handleUpdateAmbassadorName = async () => {
    try {
      const res = await updateAmbassadorName({
        ambassador_name: distributorName,
      });
      if (res.success) {
        toast.success(t("distributor.toastConfigureProfile"));
        props.onSuccess();
      }
    } catch (error: any) {
      console.error("Error updating ambassador name:", error);
      toast.error(
        error?.message || t("distributor.toastFailedUpdateAmbassadorName")
      );
    }
  };

  const disabled = !!error || !distributorName.trim() || isMutating;

  return (
    <Card className="flex flex-col gap-5 p-4 md:p-6 w-full">
      {/* Header */}
      <p className="text-lg text-base-contrast">
        {t("distributor.distributorDetails")}
      </p>

      {/* Separator line */}
      <div className="h-px w-full bg-base-contrast-12"></div>

      {/* Content */}
      <div className="flex flex-col gap-4 items-start">
        {/* Help text above input */}
        <p className="text-sm text-base-contrast-54">
          {t("distributor.distributorNameHelp")}
        </p>

        <FormInput
          id="distributorName"
          value={distributorName}
          onChange={e => setDistributorName(e.target.value)}
          placeholder={t("distributor.distributorNamePlaceholder")}
          className="w-full"
          required={true}
          minLength={4}
          maxLength={30}
          validator={distributorNameValidator}
          onError={setError}
        />

        {/* Validation hint text */}
        <p className="text-sm text-base-contrast-54">
          {t("distributor.distributorNameValidationHint")}
        </p>
      </div>

      {/* Confirm button */}
      <div className="flex justify-end w-full mt-4">
        <Button
          variant="primary"
          size="md"
          disabled={disabled}
          onClick={handleUpdateAmbassadorName}
          isLoading={isMutating}
        >
          {t("distributor.confirm")}
        </Button>
      </div>
    </Card>
  );
};
