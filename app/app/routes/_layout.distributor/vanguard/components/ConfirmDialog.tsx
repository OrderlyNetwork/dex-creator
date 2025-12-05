import React from "react";
import { cn } from "../utils";
import { CloseIcon } from "../icons";
import { Button } from "../../../../components/Button";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: React.ReactNode;
  onOk?: () => void | Promise<void>;
  onCancel?: () => void;
  okText?: string;
  cancelText?: string;
  confirmDisable?: boolean;
  loading?: boolean;
  footer?: React.ReactNode;
  contentClassName?: string;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  onOpenChange,
  title,
  children,
  onOk,
  onCancel,
  okText = "Confirm",
  cancelText = "Cancel",
  confirmDisable = false,
  loading = false,
  footer,
  contentClassName,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div
        className={cn(
          "bg-[#0f1123] border border-primary-light/30 rounded-xl shadow-xl max-h-[90vh] overflow-auto mx-4",
          contentClassName || "w-full max-w-md"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-base-contrast-12">
          <h2 className="text-lg font-semibold text-base-contrast">{title}</h2>
          <button
            onClick={() => onOpenChange(false)}
            className="text-base-contrast-54 hover:text-base-contrast transition-colors"
            aria-label="Close"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4">{children}</div>

        {/* Footer */}
        {footer !== null && (
          <div className="flex justify-end gap-[10px] px-6 pb-4">
            {footer ?? (
              <>
                {onCancel && (
                  <button
                    onClick={onCancel}
                    className="flex-1 h-[40px] px-[20px] rounded-full text-xs font-semibold border border-base-contrast-12 text-base-contrast-54 hover:text-base-contrast hover:border-base-contrast transition-colors inline-flex items-center justify-center"
                  >
                    {cancelText}
                  </button>
                )}
                {onOk && (
                  <Button
                    variant="primary"
                    size="sm"
                    withGlow
                    onClick={onOk}
                    disabled={confirmDisable}
                    isLoading={loading}
                    className="flex-1 h-[40px] justify-center"
                  >
                    {okText}
                  </Button>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConfirmDialog;
