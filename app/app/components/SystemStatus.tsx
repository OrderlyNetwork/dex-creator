import React from "react";
import { clsx } from "clsx";
import { useTranslation } from "~/i18n";

interface SystemStatusProps {
  isMaintenance: boolean;
}

const SystemStatus: React.FC<SystemStatusProps> = props => {
  const { t } = useTranslation();
  const { isMaintenance } = props;
  const statusText = isMaintenance
    ? t("systemStatus.maintenance")
    : t("systemStatus.operational");

  return (
    <div
      className={clsx(
        "inline-flex items-center h-[35px] px-[12px] text-white text-sm font-semibold rounded-full",
        "border-[1px] border-solid",
        isMaintenance
          ? "bg-[rgb(209,150,255,0.06)] border-[#D196FF33]"
          : "[background:linear-gradient(90deg,rgba(51,243,255,0.06)_-2.56%,rgba(0,220,154,0.06)_100%)] border-[rgba(66,255,221,0.05)]"
      )}
    >
      <div
        className={clsx(
          "w-[6px] h-[6px] mr-[6px] rounded-full",
          isMaintenance ? "bg-[#D196FF]" : "bg-[#24AD8F]"
        )}
      />
      <div>{statusText}</div>
    </div>
  );
};

export default SystemStatus;
