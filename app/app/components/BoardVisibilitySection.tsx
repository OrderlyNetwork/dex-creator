import React, { useState } from "react";
import { toast } from "react-toastify";
import { useTranslation } from "~/i18n";
import { post } from "../utils/apiClient";
import type { DexData } from "../types/dex";

interface BoardVisibilitySectionProps {
  dexData: DexData;
  token: string;
  onUpdate: (updatedDex: DexData) => void;
}

const BoardVisibilitySection: React.FC<BoardVisibilitySectionProps> = ({
  dexData,
  token,
  onUpdate,
}) => {
  const { t } = useTranslation();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleToggle = async (checked: boolean) => {
    if (!dexData.isGraduated) {
      toast.info(t("dexCard.visibility.toast.mustGraduate"));
      return;
    }

    setIsUpdating(true);
    try {
      const response = await post<{ dex: DexData }>(
        `api/dex/${dexData.id}/board-visibility`,
        { showOnBoard: checked },
        token
      );

      if (response && response.dex) {
        onUpdate(response.dex);
        toast.success(
          checked
            ? t("dexCard.visibility.toast.showOnBoard")
            : t("dexCard.visibility.toast.hiddenFromBoard")
        );
      }
    } catch (error) {
      console.error("Error updating board visibility:", error);
      toast.error(t("dexCard.visibility.toast.updateFailed"));
    } finally {
      setIsUpdating(false);
    }
  };

  const isEnabled = dexData.showOnBoard ?? true;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="text-sm font-medium text-gray-200">
            {t("dexCard.visibility.heading")}
            {!dexData.isGraduated && (
              <span className="text-xs text-gray-500 font-normal ml-2">
                {t("dexCard.visibility.afterGraduation")}
              </span>
            )}
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            {t("dexCard.visibility.description")}
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={isEnabled}
          onClick={() => handleToggle(!isEnabled)}
          disabled={isUpdating || !dexData.isGraduated}
          className={`
            relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-background-dark ml-4
            ${isEnabled ? "bg-primary" : "bg-gray-600"}
            ${isUpdating || !dexData.isGraduated ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
          `}
        >
          <span
            className={`
              inline-block h-4 w-4 transform rounded-full bg-white transition-transform
              ${isEnabled ? "translate-x-6" : "translate-x-1"}
            `}
          />
        </button>
      </div>
      {isUpdating && (
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <div className="i-svg-spinners:pulse-rings-multiple h-4 w-4"></div>
          {t("dexCard.visibility.updating")}
        </div>
      )}
    </div>
  );
};

export default BoardVisibilitySection;
