import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { BrowserProvider } from "ethers";
import { formatUnits, parseUnits } from "viem";
import { useAccount, useChainId, useSwitchChain, useWalletClient } from "wagmi";
import {
  getAccountId,
  loadOrderlyKey,
  withdraw,
} from "../../../../../utils/orderly";
import {
  useTokenInfo,
  useVanguardChains,
  useWithdrawFee,
} from "../../hooks/useVanguard";
import { useDex } from "../../../../../context/DexContext";
import { parseWalletError } from "../../../../../utils/wallet";

export interface RevenueWithdrawModalScriptProps {
  open: boolean;
  onClose: () => void;
  availableBalance: number;
  isLoadingBalance: boolean;
  onWithdrawSuccess?: () => void;
}

// Helper function to avoid scientific notation
const toNonExponential = (num: number): string => {
  if (num === 0) return "0";
  const str = num.toString();
  if (str.indexOf("e") === -1) return str;
  const [base, exponent] = str.split("e");
  const exp = Number.parseInt(exponent);
  const [intPart, decPart = ""] = base.split(".");
  const totalDecimals = decPart.length;
  if (exp > 0) {
    const zeros = "0".repeat(exp - totalDecimals);
    return intPart + decPart + zeros;
  } else {
    const absExp = Math.abs(exp);
    const zeros = "0".repeat(absExp - 1);
    return "0." + zeros + intPart + decPart;
  }
};

export const useRevenueWithdrawModalScript = (
  props: RevenueWithdrawModalScriptProps
) => {
  const {
    open,
    onClose,
    availableBalance,
    isLoadingBalance,
    onWithdrawSuccess,
  } = props;

  const { address, connector, chainId: accountChainId } = useAccount();
  const hookChainId = useChainId();
  const { switchChain } = useSwitchChain();
  const { data: walletClient } = useWalletClient();
  const { brokerId } = useDex();

  const chainId = hookChainId ?? accountChainId;

  const accountId = useMemo(() => {
    if (!address || !brokerId) return null;
    return getAccountId(address, brokerId);
  }, [address, brokerId]);

  const walletName = useMemo(() => connector?.name, [connector]);

  const { chains } = useVanguardChains("USDC");
  const [selectedChainId, setSelectedChainId] = useState<number | null>(null);

  const defaultChainId = useMemo(() => {
    if (!chainId || chains.length === 0) {
      return chains.length > 0 ? chains[0].chain_id : null;
    }
    const matched = chains.find(chain => chain.chain_id === chainId);
    return matched ? matched.chain_id : chains[0]?.chain_id || null;
  }, [chainId, chains]);

  useEffect(() => {
    if (open && defaultChainId !== null) {
      setSelectedChainId(defaultChainId);
    }
  }, [open, defaultChainId]);

  useEffect(() => {
    if (!selectedChainId && defaultChainId !== null) {
      setSelectedChainId(defaultChainId);
    }
  }, [defaultChainId, selectedChainId]);

  const onChainChange = useCallback(
    async (chainIdValue: number) => {
      setSelectedChainId(chainIdValue);
      try {
        await switchChain({ chainId: chainIdValue });
      } catch (error) {
        console.warn("Automatic network switch failed", error);
      }
    },
    [switchChain]
  );

  const fee = useWithdrawFee("USDC", selectedChainId, false);
  const { tokenInfo } = useTokenInfo("USDC");
  const minimumWithdrawAmount = tokenInfo?.minimum_withdraw_amount || 0;

  const selectedChain = useMemo(
    () => chains.find(chain => chain.chain_id === selectedChainId),
    [chains, selectedChainId]
  );
  const tokenDecimals = selectedChain?.decimals ?? 6;

  const [quantity, setQuantity] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const parsedAmount = useMemo(() => parseFloat(quantity), [quantity]);

  useEffect(() => {
    if (open) {
      setQuantity("");
    }
  }, [open]);

  useEffect(() => {
    if (!open) {
      setIsSubmitting(false);
    }
  }, [open]);

  const qtyGreaterThanMaxAmount = useMemo<boolean>(() => {
    if (!quantity) {
      return false;
    }
    const quantityNum = parseFloat(quantity);
    if (Number.isNaN(quantityNum)) {
      return false;
    }
    if (
      !availableBalance ||
      Number.isNaN(availableBalance) ||
      availableBalance <= 0
    ) {
      return quantityNum > 0;
    }
    return quantityNum > availableBalance;
  }, [quantity, availableBalance]);

  const minAmountWarningMessage = useMemo(() => {
    if (!quantity) {
      return null;
    }

    const quantityNum = parseFloat(quantity);
    if (Number.isNaN(quantityNum)) {
      return null;
    }

    const minAmount = (minimumWithdrawAmount || 0) + (fee || 0);

    if (quantityNum < minAmount) {
      return `You can't withdraw less than ${toNonExponential(minAmount)} USDC. Please adjust your amount.`;
    }

    return null;
  }, [quantity, fee, minimumWithdrawAmount]);

  const balanceErrorMessage = useMemo(() => {
    if (qtyGreaterThanMaxAmount) {
      return `Insufficient balance. Available: ${availableBalance.toFixed(2)} USDC`;
    }
    return null;
  }, [qtyGreaterThanMaxAmount, availableBalance]);

  const errorMessage = balanceErrorMessage || minAmountWarningMessage;

  const showQty = useMemo(() => {
    if (!quantity || qtyGreaterThanMaxAmount) {
      return "";
    }

    try {
      const tokenAmount = parseUnits(quantity, tokenDecimals);
      const feeAmount = parseUnits(String(fee ?? 0), tokenDecimals);
      const netAmount = tokenAmount - feeAmount;

      if (netAmount < 0n) {
        return "";
      }

      return formatUnits(netAmount, tokenDecimals);
    } catch {
      return "";
    }
  }, [fee, quantity, qtyGreaterThanMaxAmount, tokenDecimals]);

  const confirmDisabled =
    !quantity ||
    Number(quantity) === 0 ||
    Number.isNaN(parsedAmount) ||
    parsedAmount <= 0 ||
    qtyGreaterThanMaxAmount ||
    !!minAmountWarningMessage;

  const submitWithdraw = useCallback(async () => {
    if (isSubmitting) {
      return;
    }

    if (
      !address ||
      !accountId ||
      !brokerId ||
      !selectedChainId ||
      !walletClient
    ) {
      toast.error("Missing required data for withdrawal");
      return;
    }

    const orderlyKey = loadOrderlyKey(accountId);
    if (!orderlyKey) {
      toast.error("Orderly key not found; please create one first");
      return;
    }

    setIsSubmitting(true);
    try {
      const provider = new BrowserProvider(walletClient);
      const signer = await provider.getSigner();

      await withdraw(
        signer,
        address,
        accountId,
        orderlyKey,
        selectedChainId,
        "USDC",
        quantity,
        address,
        brokerId,
        false,
        tokenDecimals
      );

      toast.success("Withdrawal request submitted");
      onClose();
      onWithdrawSuccess?.();
    } catch (error: unknown) {
      const message = parseWalletError(error) || "Failed to submit withdrawal";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }, [
    accountId,
    address,
    brokerId,
    isSubmitting,
    onClose,
    onWithdrawSuccess,
    selectedChainId,
    tokenDecimals,
    walletClient,
    quantity,
  ]);

  const handleConfirm = useCallback(() => {
    if (!confirmDisabled && !Number.isNaN(parsedAmount)) {
      submitWithdraw();
    }
  }, [confirmDisabled, parsedAmount, submitWithdraw]);

  const handleMaxClick = () => {
    setQuantity(availableBalance.toString());
  };

  return {
    ...props,
    onClose,
    quantity,
    onQuantityChange: setQuantity,
    confirmDisabled,
    onMaxClick: handleMaxClick,
    onConfirm: handleConfirm,
    showQty,
    minAmountWarningMessage: errorMessage,
    fee,
    selectedChainId,
    chains,
    onChainChange,
    walletAddress: address || "",
    walletName,
    isLoadingBalance,
    isSubmitting,
  };
};
