import { useState } from "react";
import { useTranslation } from "~/i18n";
import { Button } from "./Button";
import { useModal } from "../context/ModalContext";
import { useDex } from "../context/DexContext";
import { useAuth } from "../context/useAuth";
import { put } from "../utils/apiClient";
import { toast } from "react-toastify";

export function SwapFeeConfig() {
  const { t } = useTranslation();
  const { token } = useAuth();
  const { dexData, refreshDexData } = useDex();
  const { openModal } = useModal();
  const [isSaving, setIsSaving] = useState(false);

  const currentFeeBps = dexData?.swapFeeBps ?? null;
  const dexId = dexData?.id;

  const handleSave = async (feeBps: number) => {
    if (!token || !dexId) return;

    setIsSaving(true);
    try {
      await put(`api/dex/${dexId}/swap-fee`, { swapFeeBps: feeBps }, token);
      await refreshDexData();
      toast.success(t("swapFeeConfig.updateSuccess"));
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : t("swapFeeConfig.updateFailed")
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenConfig = () => {
    openModal("swapFeeConfig", {
      currentFeeBps,
      onSave: handleSave,
    });
  };

  return (
    <div className="bg-light/5 rounded-lg p-5 mb-6 border border-light/10 text-left">
      <h3 className="text-lg font-semibold mb-3 flex items-center">
        <div className="i-mdi:swap-horizontal text-blue-400 mr-2 h-5 w-5"></div>
        {t("swapFeeConfig.title")}
      </h3>
      <p className="text-sm text-gray-300 mb-4">
        {t("swapFeeConfig.description")}
      </p>

      <div className="flex items-center justify-between bg-background-card rounded-lg p-4 mb-4">
        <div>
          <span className="text-sm text-gray-400">
            {t("swapFeeConfig.currentFee")}
          </span>
          <div className="text-xl font-bold mt-1">
            {currentFeeBps !== null ? (
              <>
                {currentFeeBps} bps{" "}
                <span className="text-sm font-normal text-gray-400">
                  ({(currentFeeBps / 100).toFixed(2)}%)
                </span>
              </>
            ) : (
              <span className="text-warning text-base">
                {t("swapFeeConfig.notSet")}
              </span>
            )}
          </div>
        </div>
        {currentFeeBps !== null && (
          <div className="text-right">
            <div className="text-xs text-gray-400">
              {t("swapFeeConfig.yourEarnings")}
            </div>
            <div className="text-sm font-medium text-success">
              {((currentFeeBps / 100) * 0.7).toFixed(3)}%
            </div>
          </div>
        )}
      </div>

      <Button
        onClick={handleOpenConfig}
        variant="primary"
        className="w-full"
        disabled={isSaving}
      >
        <span className="flex items-center justify-center w-full gap-2">
          <div className="i-mdi:cog h-4 w-4"></div>
          {isSaving
            ? t("swapFeeConfig.saving")
            : currentFeeBps !== null
              ? t("swapFeeConfig.editFee")
              : t("swapFeeConfig.setFee")}
        </span>
      </Button>
    </div>
  );
}
