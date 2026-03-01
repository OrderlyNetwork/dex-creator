import { useState } from "react";
import { useTranslation } from "~/i18n";
import { Button } from "./Button";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  entityName: string;
}

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  entityName,
}: DeleteConfirmModalProps) {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      console.error("Error during deletion:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center h-screen">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-background-dark/80 backdrop-blur-sm z-[1001]"
        onClick={isLoading ? undefined : onClose}
      ></div>

      {/* Modal */}
      <div className="relative z-[1002] max-w-md p-6 rounded-xl bg-background-light border border-red-500/20 shadow-2xl slide-fade-in">
        <h3 className="text-xl font-bold mb-4 text-red-500">
          {t("deleteConfirmModal.deleteButton", { entityName })}
        </h3>

        <div className="mb-6 space-y-4">
          <p className="text-gray-300">
            {t("deleteConfirmModal.confirmMessage", {
              entityNameLower: entityName.toLowerCase(),
            })}
          </p>

          <div className="bg-background-dark/50 p-4 rounded-lg border border-red-500/10 text-sm">
            <h4 className="font-semibold mb-2 text-red-400">
              {t("deleteConfirmModal.warningTitle")}
            </h4>
            <p className="text-gray-400">
              {t("deleteConfirmModal.warningDesc", {
                entityNameLower: entityName.toLowerCase(),
              })}
            </p>
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>
            {t("common.cancel")}
          </Button>
          <Button
            variant="danger"
            onClick={handleConfirm}
            isLoading={isLoading}
            loadingText={t("deleteConfirmModal.deleting")}
          >
            {t("deleteConfirmModal.deleteButton", { entityName })}
          </Button>
        </div>
      </div>
    </div>
  );
}
