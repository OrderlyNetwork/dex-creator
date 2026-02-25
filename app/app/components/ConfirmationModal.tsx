import { useState } from "react";
import { useTranslation } from "~/i18n";
import { Button } from "./Button";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  title: string;
  message: string;
  warningMessage?: string;
  confirmButtonText: string;
  confirmButtonVariant?:
    | "primary"
    | "secondary"
    | "danger"
    | "warning"
    | "ghost"
    | "success";
  cancelButtonText?: string;
  isDestructive?: boolean;
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  warningMessage,
  confirmButtonText,
  confirmButtonVariant = "primary",
  cancelButtonText,
  isDestructive = false,
}: ConfirmationModalProps) {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      console.error("Error during confirmation action:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getModalBorderColor = () => {
    switch (confirmButtonVariant) {
      case "danger":
        return "border-error/20";
      case "warning":
        return "border-warning/20";
      case "success":
        return "border-success/20";
      default:
        return "border-primary/20";
    }
  };

  const getTitleColor = () => {
    switch (confirmButtonVariant) {
      case "danger":
        return "text-error";
      case "warning":
        return "text-warning";
      case "success":
        return "text-success";
      default:
        return "text-primary-light";
    }
  };

  const getWarningBorderColor = () => {
    switch (confirmButtonVariant) {
      case "danger":
        return "border-error/10";
      case "warning":
        return "border-warning/10";
      case "success":
        return "border-success/10";
      default:
        return "border-primary/10";
    }
  };

  const getWarningTitleColor = () => {
    switch (confirmButtonVariant) {
      case "danger":
        return "text-error";
      case "warning":
        return "text-warning";
      case "success":
        return "text-success";
      default:
        return "text-primary-light";
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
      <div
        className={`relative z-[1002] max-w-md p-6 rounded-xl bg-background-light border ${getModalBorderColor()} shadow-2xl slide-fade-in`}
      >
        <h3 className={`text-xl font-bold mb-4 ${getTitleColor()}`}>{title}</h3>

        <div className="mb-6 space-y-4">
          <p className="text-gray-300">{message}</p>

          {warningMessage && (
            <div
              className={`bg-background-dark/50 p-4 rounded-lg border ${getWarningBorderColor()} text-sm`}
            >
              <h4 className={`font-semibold mb-2 ${getWarningTitleColor()}`}>
                {isDestructive
                  ? t("confirmationModal.warning")
                  : t("confirmationModal.important")}
              </h4>
              <p className="text-gray-400">{warningMessage}</p>
            </div>
          )}
        </div>

        <div className="flex gap-3 justify-end">
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>
            {cancelButtonText ?? t("confirmationModal.cancel")}
          </Button>
          <Button
            variant={confirmButtonVariant}
            onClick={handleConfirm}
            isLoading={isLoading}
            loadingText={t("confirmationModal.processing")}
          >
            {confirmButtonText}
          </Button>
        </div>
      </div>
    </div>
  );
}
