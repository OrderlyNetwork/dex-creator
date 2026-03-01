import { useState, useEffect } from "react";
import { useTranslation } from "~/i18n";
import { useAccount, useWalletClient, useChainId, useSwitchChain } from "wagmi";
import { BrowserProvider } from "ethers";
import { toast } from "react-toastify";
import { Button } from "./Button";
import {
  getAccountId,
  loadOrderlyKey,
  delegateWithdraw,
  getClientHolding,
} from "../utils/orderly";
import { cleanMultisigAddress } from "../utils/multisig";
import { getChainById } from "../../../config";

interface FeeWithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
  brokerId: string;
  multisigAddress: string;
  multisigChainId: number;
}

export function FeeWithdrawalModal({
  isOpen,
  onClose,
  brokerId,
  multisigAddress,
  multisigChainId,
}: FeeWithdrawalModalProps) {
  const { t } = useTranslation();
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const [isProcessing, setIsProcessing] = useState(false);
  const [amount, setAmount] = useState("");
  const [usdcBalance, setUsdcBalance] = useState<number | null>(null);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);

  const cleanAddress = cleanMultisigAddress(multisigAddress);
  const accountId = getAccountId(cleanAddress, brokerId);
  const [orderlyKey, setOrderlyKey] = useState<Uint8Array | null>(null);

  const isOnCorrectChain = chainId === multisigChainId;
  const requiredChain = getChainById(multisigChainId);

  useEffect(() => {
    if (isOpen) {
      const savedKey = loadOrderlyKey(accountId);
      if (savedKey) {
        setOrderlyKey(savedKey);
      } else {
        toast.error(t("feeWithdrawalModal.noOrderlyKey"));
        onClose();
      }
    }
  }, [isOpen, accountId, onClose]);

  useEffect(() => {
    if (orderlyKey && accountId) {
      fetchUsdcBalance();
    }
  }, [orderlyKey, accountId]);

  const fetchUsdcBalance = async () => {
    if (!orderlyKey || !accountId) return;

    setIsLoadingBalance(true);
    try {
      const holdings = await getClientHolding(accountId, orderlyKey);
      const usdcHolding = holdings.find(h => h.token === "USDC");
      setUsdcBalance(usdcHolding?.holding || 0);
    } catch (error) {
      console.error("Error fetching USDC balance:", error);
    } finally {
      setIsLoadingBalance(false);
    }
  };

  const handleSetMaxAmount = () => {
    if (usdcBalance !== null) {
      setAmount(usdcBalance.toString());
    }
  };

  const handleSwitchChain = async () => {
    try {
      await switchChain({ chainId: multisigChainId });
    } catch (error) {
      console.error("Failed to switch chain:", error);
      toast.error(t("feeWithdrawalModal.switchToRequiredNetwork"));
    }
  };

  const handleWithdraw = async () => {
    if (!walletClient || !accountId || !orderlyKey || !address) {
      toast.error(t("feeWithdrawalModal.missingData"));
      return;
    }

    if (!isOnCorrectChain) {
      toast.error(
        t("feeWithdrawalModal.pleaseSwitchToWithdraw", {
          chainName:
            requiredChain?.name ||
            t("feeWithdrawalModal.switchToCorrectNetwork"),
        })
      );
      return;
    }

    if (!amount.trim() || parseFloat(amount) <= 0) {
      toast.error(t("feeWithdrawalModal.enterValidAmount"));
      return;
    }

    try {
      const provider = new BrowserProvider(walletClient);
      const signer = await provider.getSigner();

      await delegateWithdraw(
        signer,
        address,
        cleanAddress,
        multisigChainId,
        brokerId,
        cleanAddress,
        "USDC",
        Number(amount),
        accountId,
        orderlyKey
      );

      toast.success(t("feeWithdrawalModal.withdrawalSuccess"));
      onClose();
    } catch (error) {
      console.error("Error withdrawing:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : t("feeWithdrawalModal.withdrawalFailed")
      );
    }
  };

  const handleFullWithdrawal = async () => {
    if (!amount.trim() || parseFloat(amount) <= 0) {
      toast.error(t("feeWithdrawalModal.enterValidAmount"));
      return;
    }

    setIsProcessing(true);
    try {
      await handleWithdraw();
    } catch (error) {
      console.error("Error in full withdrawal:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md mx-auto bg-background-light rounded-xl border border-light/10 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-light/10">
          <h2 className="text-lg font-semibold text-white">
            {t("feeWithdrawalModal.title")}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-200 transition-colors"
          >
            <div className="i-mdi:close w-6 h-6"></div>
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div className="bg-info/10 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <div className="i-mdi:information-outline text-info w-4 h-4 mt-0.5 flex-shrink-0"></div>
              <div>
                <p className="text-xs text-info font-medium mb-1">
                  {t("feeWithdrawalModal.multisigProcess")}
                </p>
                <p className="text-xs text-gray-400">
                  {t("feeWithdrawalModal.multisigDesc")}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-background-card rounded-lg p-3 border border-light/10">
            <label className="block text-xs font-medium text-gray-400 mb-1">
              {t("feeWithdrawalModal.withdrawalAddress")}
            </label>
            <div className="font-mono text-sm text-gray-300 break-all">
              {multisigAddress}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-300">
                {t("feeWithdrawalModal.amountUsdc")}
              </label>
              <div className="flex items-center gap-2">
                {isLoadingBalance ? (
                  <span className="text-xs text-gray-400">
                    {t("feeWithdrawalModal.loadingBalance")}
                  </span>
                ) : usdcBalance !== null ? (
                  <>
                    <span className="text-xs text-gray-400">
                      {t("common.available")}:{" "}
                      {usdcBalance.toFixed(2)} USDC
                    </span>
                    <button
                      onClick={handleSetMaxAmount}
                      className="text-xs text-primary-light hover:text-primary font-medium"
                    >
                      {t("feeWithdrawalModal.max")}
                    </button>
                  </>
                ) : null}
              </div>
            </div>
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="0.00"
              step="0.01"
              min="0"
              className="w-full px-3 py-2 bg-background-dark border border-light/10 rounded-lg text-white placeholder-gray-400 focus:border-primary/50 focus:outline-none"
            />
          </div>

          {!isOnCorrectChain && (
            <div className="bg-warning/10 border border-warning/20 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <div className="i-mdi:alert text-warning w-5 h-5 mt-0.5 flex-shrink-0"></div>
                <div className="flex-1">
                  <p className="text-xs text-warning font-medium mb-1">
                    {t("feeWithdrawalModal.wrongNetwork")}
                  </p>
                  <p className="text-xs text-gray-400">
                    {t("feeWithdrawalModal.switchNetworkDesc", {
                      chainName:
                        requiredChain?.name || `Chain ID ${multisigChainId}`,
                    })}
                  </p>
                </div>
              </div>
            </div>
          )}

          {isOnCorrectChain ? (
            <Button
              onClick={handleFullWithdrawal}
              variant="primary"
              className="w-full"
              isLoading={isProcessing}
              loadingText={t("feeWithdrawalModal.processing")}
              disabled={!amount.trim() || !orderlyKey}
            >
              {t("feeWithdrawalModal.withdrawFees")}
            </Button>
          ) : (
            <Button
              onClick={handleSwitchChain}
              variant="primary"
              className="w-full"
            >
              <div className="flex items-center justify-center gap-2">
                <div className="i-mdi:swap-horizontal w-4 h-4"></div>
                {t("feeWithdrawalModal.switchToNetwork", {
                  chainName:
                    requiredChain?.name ||
                    t("feeWithdrawalModal.switchToCorrectNetwork"),
                })}
              </div>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
