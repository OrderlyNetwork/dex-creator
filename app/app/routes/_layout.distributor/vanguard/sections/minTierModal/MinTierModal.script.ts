import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { useVanguardMinTierList } from "../../hooks/useVanguard";
import { copyText } from "../../utils";
import type { MinTierModalUIProps } from "./MinTierModal.ui";

export interface ConfigureMinTierModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (tier: string) => Promise<void>;
  inviteeAddress: string;
  currentEffectiveTier: string;
  currentMinTier?: string;
}

export const useConfigureMinTierModalScript = (
  props: ConfigureMinTierModalProps
): MinTierModalUIProps => {
  const {
    open,
    onClose,
    onSave,
    inviteeAddress,
    currentEffectiveTier,
    currentMinTier,
  } = props;

  const initialTier = currentMinTier || currentEffectiveTier;

  const [selectedTier, setSelectedTier] = useState(initialTier);
  const [isSaving, setIsSaving] = useState(false);
  const { data: tierList } = useVanguardMinTierList();

  useEffect(() => {
    if (!open) {
      return;
    }
    setSelectedTier(initialTier);
  }, [open, initialTier]);

  const selectedTierData = useMemo(
    () => tierList.find((item: any) => item.tier === selectedTier),
    [tierList, selectedTier]
  );

  const handleCopyInviteeAddress = useCallback(() => {
    if (!inviteeAddress) {
      return;
    }
    copyText(inviteeAddress);
    toast.success("Copied");
  }, [inviteeAddress]);

  const handleConfirm = useCallback(async () => {
    if (isSaving) {
      return;
    }
    try {
      setIsSaving(true);
      await onSave(selectedTier);
      onClose();
    } catch (error) {
      console.error("Failed to save minimum tier:", error);
    } finally {
      setIsSaving(false);
    }
  }, [isSaving, onClose, onSave, selectedTier]);

  const handleSelectedTierChange = useCallback((tier: string) => {
    setSelectedTier(tier);
  }, []);

  const isChanged = selectedTier !== initialTier;

  return {
    open,
    onClose,
    onConfirm: handleConfirm,
    inviteeAddress,
    currentEffectiveTier,
    tierList,
    selectedTier,
    onSelectedTierChange: handleSelectedTierChange,
    selectedTierData,
    isChanged,
    onCopyInviteeAddress: handleCopyInviteeAddress,
    isSaving,
  };
};
