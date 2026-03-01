import { useState } from "react";
import { useTranslation } from "~/i18n";
import { MLRUpgradeWarning } from "~/routes/_layout.referral/MultiLevelSettings";
import { CloseIcon } from "~/routes/_layout.distributor/vanguard/icons";
import { Button } from "./Button";

interface MLRConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export default function MLRConfirmModal({
  isOpen,
  onClose,
  onConfirm,
}: MLRConfirmModalProps) {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    if (isLoading) {
      return;
    }

    setIsLoading(true);
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      console.error("Error during MLR upgrade confirmation:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !isLoading) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[50] flex items-center justify-center bg-[#0c0d1d]/80 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="bg-[#0f1123] border border-primary-light/30 rounded-xl w-[440px] max-h-[90vh] overflow-auto mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-5">
          <h2 className="flex-1 text-base font-medium leading-normal text-base-contrast">
            {t("mlrConfirmModal.title")}
          </h2>
          <button
            onClick={onClose}
            className="shrink-0 w-6 h-6 text-base-contrast-54 hover:text-base-contrast transition-colors"
            aria-label="Close"
            type="button"
            disabled={isLoading}
          >
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Divider */}
        <div className="h-px bg-base-contrast-12" />

        {/* Body */}
        <div className="flex flex-col gap-5 p-5">
          {/* Warning box */}
          <MLRUpgradeWarning />
        </div>

        {/* Footer */}
        <div className="flex gap-[10px] p-5">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 h-10 px-5 py-3 rounded-[46px] border border-[#9c75ff] text-base font-medium leading-[1.2] text-base-contrast-80 hover:text-base-contrast hover:border-base-contrast transition-colors inline-flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            type="button"
          >
            {t("common.cancel")}
          </button>
          <Button
            variant="primary"
            onClick={handleConfirm}
            disabled={isLoading}
            isLoading={isLoading}
            className="h-10 px-5 py-3 rounded-[46px] text-base font-medium leading-[1.2]"
          >
            {t("mlrConfirmModal.confirmUpgrade")}
          </Button>
        </div>
      </div>
    </div>
  );
}
