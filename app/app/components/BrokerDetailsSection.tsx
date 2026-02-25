import React from "react";
import { useTranslation } from "~/i18n";
import FormInput from "./FormInput";

export interface BrokerDetailsProps {
  brokerName: string;
  handleInputChange: (
    field: string
  ) => (e: React.ChangeEvent<HTMLInputElement>) => void;
  brokerNameValidator: (value: string) => string | null;
}

const BrokerDetailsSection: React.FC<BrokerDetailsProps> = ({
  brokerName,
  handleInputChange,
  brokerNameValidator,
}) => {
  const { t } = useTranslation();
  return (
    <FormInput
      id="brokerName"
      label={t("brokerDetailsSection.label")}
      value={brokerName}
      onChange={handleInputChange("brokerName")}
      placeholder={t("brokerDetailsSection.placeholder")}
      helpText={t("brokerDetailsSection.helpText")}
      required={true}
      minLength={3}
      maxLength={30}
      validator={brokerNameValidator}
    />
  );
};

export default BrokerDetailsSection;
