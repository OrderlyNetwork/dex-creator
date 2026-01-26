import React from "react";
import ConfirmDialog from "../../components/ConfirmDialog";
import { cn, formatBps, formatUTCTimeToLocal, formatTier } from "../../utils";
import { CopyIcon, InfoIcon } from "../../icons";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components";

export interface MinTierModalUIProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  inviteeAddress: string;
  currentEffectiveTier: string;
  tierList: any[];
  selectedTier: string;
  onSelectedTierChange: (tier: string) => void;
  selectedTierData?: any;
  isChanged: boolean;
  onCopyInviteeAddress: () => void;
  isSaving: boolean;
}

const MinTierModalUI: React.FC<MinTierModalUIProps> = ({
  open,
  onClose,
  onConfirm,
  inviteeAddress,
  currentEffectiveTier,
  tierList,
  selectedTier,
  onSelectedTierChange,
  selectedTierData,
  isChanged,
  onCopyInviteeAddress,
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
      title="Configure minimum tier"
      onOk={onConfirm}
      onCancel={onClose}
      okText="Save"
      cancelText="Cancel"
      contentClassName="max-w-[480px]"
      confirmDisable={!isChanged}
      loading={isSaving}
    >
      <div className="flex flex-col gap-5 pb-0">
        <div className="flex gap-5">
          <div className="flex-1 flex flex-col gap-1">
            <div className="text-base-contrast-54 text-xs mb-1">
              Invitee address
            </div>
            <div className="text-base-contrast-80 text-sm font-medium flex items-center gap-2">
              {inviteeAddress}
              <button
                onClick={onCopyInviteeAddress}
                className="text-base-contrast-54 hover:text-base-contrast transition-colors"
                aria-label="Copy address"
              >
                <CopyIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col gap-1">
          <div className="text-base-contrast-54 text-xs mb-1">
            Current effective tier
          </div>
          <div className="text-base-contrast-80 text-sm font-medium">
            {formatTier(currentEffectiveTier)}
          </div>
        </div>

        <div className="h-px bg-white/10" />

        <div
          className={cn(
            "w-full flex h-14 items-center gap-2 rounded-lg border bg-base-700",
            "border-base-contrast-12"
          )}
        >
          <Select value={selectedTier} onValueChange={onSelectedTierChange}>
            <SelectTrigger
              prefix={
                <span className="text-sm font-medium leading-[1.25em] pl-4 text-base-contrast-54">
                  Minimum tier
                </span>
              }
              valueAlign="right"
              className="flex-1 h-full bg-transparent border-none text-base-contrast text-sm font-medium pr-4 focus:ring-0 focus:ring-offset-0"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-base-700 border-base-contrast-12 text-base-contrast">
              {tierList.map((item: any) => (
                <SelectItem
                  key={item.tier}
                  value={item.tier}
                  className="text-base-contrast focus:bg-base-contrast-8 focus:text-base-contrast"
                >
                  {formatTier(item.tier)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-row gap-5">
          <div className="flex-1 flex flex-col gap-5">
            <div className="flex flex-col gap-1">
              <div className="text-base-contrast-54 text-xs">
                Base taker fee
              </div>
              <div className="text-base-contrast text-base font-normal">
                {formatBps(selectedTierData?.base_taker_fee_rate, 2)}
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <div className="text-base-contrast-54 text-xs">
                Base maker fee
              </div>
              <div className="text-base-contrast text-base font-normal">
                {formatBps(selectedTierData?.base_maker_fee_rate, 2)}
              </div>
            </div>
          </div>
          <div className="flex-1 flex flex-col gap-5">
            <div className="flex flex-col gap-1">
              <div className="text-base-contrast-54 text-xs">
                Base taker fee (RWA)
              </div>
              <div className="text-base-contrast text-base font-normal">
                {formatBps(selectedTierData?.base_rwa_taker_fee_rate, 2)}
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <div className="text-base-contrast-54 text-xs">
                Base maker fee (RWA)
              </div>
              <div className="text-base-contrast text-base font-normal">
                {formatBps(selectedTierData?.base_rwa_maker_fee_rate, 2)}
              </div>
            </div>
          </div>
        </div>

        <div className="h-px bg-white/10" />

        <div className="flex gap-1 items-start">
          <InfoIcon className="shrink-0 mt-0.5 text-base-contrast-54 w-4 h-4" />
          <div className="text-base-contrast-54 text-[13px] font-medium leading-[1.2em]">
            Any changes to the minimum tier configuration will only take effect
            the next day at {formatUTCTimeToLocal()}.
          </div>
        </div>
      </div>
    </ConfirmDialog>
  );
};

export default MinTierModalUI;
