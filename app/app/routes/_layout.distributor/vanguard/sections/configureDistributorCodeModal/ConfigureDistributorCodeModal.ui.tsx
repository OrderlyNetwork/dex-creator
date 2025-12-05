import React from "react";
import ConfirmDialog from "../../components/ConfirmDialog";
import { cn } from "../../utils";
import { ApprovedIcon, LinkIcon, InfoIcon } from "../../icons";
import { Tooltip } from "@orderly.network/ui";

export interface ConfigureDistributorCodeModalUIProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  code: string;
  onCodeChange: (value: string) => void;
  onCodeBlur: () => void;
  onCodeKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  hasError: boolean;
  errorMessage: string | null;
  isLoading: boolean;
  showChecking: boolean;
  urlPreviewText: string;
  isUrlInvalid: boolean;
  isValid: boolean;
  isSaving: boolean;
}

const ConfigureDistributorCodeModalUI: React.FC<
  ConfigureDistributorCodeModalUIProps
> = ({
  open,
  onClose,
  onConfirm,
  code,
  onCodeChange,
  onCodeBlur,
  onCodeKeyDown,
  hasError,
  errorMessage,
  isLoading,
  showChecking,
  urlPreviewText,
  isValid,
  isSaving,
}) => {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={isOpen => {
        if (!isOpen) {
          onClose();
        }
      }}
      title="Configure distributor code"
      onOk={onConfirm}
      onCancel={onClose}
      okText="Save"
      cancelText="Cancel"
      contentClassName="max-w-[480px]"
      confirmDisable={!isValid}
      loading={isLoading || isSaving}
    >
      <div className="flex flex-col gap-5 pb-0">
        <div className="flex flex-col gap-2.5">
          <Tooltip
            open={hasError && !!errorMessage}
            content={errorMessage || ""}
            side="top"
            align="center"
            arrow={{
              className: "!fill-danger",
            }}
            className="max-w-[348px] px-3 !bg-danger py-2 rounded-lg text-xs text-white"
            sideOffset={8}
          >
            <div
              className={cn(
                "w-full flex h-14 items-center gap-2 px-4 py-5 rounded-lg border bg-base-700",
                hasError ? "border-danger" : "border-base-contrast-12"
              )}
            >
              <span className="shrink-0 text-sm font-medium leading-[1.25em] text-base-contrast-54">
                Distributor code
              </span>
              <input
                id="distributor-code"
                value={code}
                onChange={event => onCodeChange(event.target.value)}
                onBlur={onCodeBlur}
                onKeyDown={onCodeKeyDown}
                className="flex-1 bg-transparent text-base-contrast text-sm font-medium leading-[1.2em] outline-none border-none text-right placeholder:text-base-contrast-36"
              />
              {isValid && <ApprovedIcon className="w-4 h-4 shrink-0" />}
            </div>
          </Tooltip>

          <div className="flex items-center gap-0.5 text-xs font-medium leading-[1.25em] text-base-contrast-54">
            <LinkIcon className="w-4 h-4" />
            <span>
              {isLoading && showChecking
                ? "Checking availability..."
                : urlPreviewText}
            </span>
          </div>
        </div>

        <div className="h-px bg-white/10" />
        <div className="flex gap-1 items-start">
          <InfoIcon className="shrink-0 mt-0.5 text-base-contrast-54 w-4 h-4" />
          <div className="text-base-contrast-54 text-[13px] font-medium leading-[1.2em]">
            Once updated, the original distributor code and URL will be
            invalidated.
          </div>
        </div>
      </div>
    </ConfirmDialog>
  );
};

export default ConfigureDistributorCodeModalUI;
