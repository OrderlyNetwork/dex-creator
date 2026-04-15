import {
  useState,
  useEffect,
  useCallback,
  useMemo,
  FormEvent,
  ChangeEvent,
} from "react";
import FormInput from "./FormInput";
import { Button } from "./Button";
import { toast } from "react-toastify";
import { post, get } from "../utils/apiClient";
import { useAuth } from "../context/useAuth";
import { validateBrokerId } from "../utils/validation";
import { useModal } from "../context/ModalContext";
import { useTranslation } from "~/i18n";
import {
  useBalance,
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
  useSwitchChain,
  useChainId,
  useReadContract,
} from "wagmi";
import { parseUnits } from "viem";
import clsx from "clsx";
import { getBlockExplorerUrlByChainId } from "../../../config";
import {
  ORDER_ADDRESSES,
  USDC_ADDRESSES,
  USDT_ADDRESSES,
  OrderTokenChainName,
  getChainIcon,
} from "../../../config";
import {
  getSupportedChains,
  getPreferredChain,
  getCurrentEnvironment,
} from "../utils/config";

const ERC20_ABI = [
  {
    constant: false,
    inputs: [
      { name: "_to", type: "address" },
      { name: "_value", type: "uint256" },
    ],
    name: "transfer",
    outputs: [{ name: "", type: "bool" }],
    type: "function",
  },
];

const SUPPORTED_CHAINS = getSupportedChains();

const TOKEN_META: Record<
  string,
  { symbol: string; icon: string; emoji: string }
> = {
  usdc: {
    symbol: "USDC",
    icon: "https://assets.coingecko.com/coins/images/6319/standard/usdc.png",
    emoji: "\uD83D\uDCB5",
  },
  usdt: {
    symbol: "USDT",
    icon: "https://assets.coingecko.com/coins/images/325/standard/Tether.png",
    emoji: "\uD83D\uDCB5",
  },
  order: {
    symbol: "ORDER",
    icon: "https://assets.coingecko.com/coins/images/38501/standard/Orderly_Network_Coingecko_200*200.png",
    emoji: "\uD83E\uDE99",
  },
};

interface VerifyTxResponse {
  success: boolean;
  message: string;
  amount?: string;
}

interface BrokerIdResponse {
  success: boolean;
  data: { rows: { broker_id: string; broker_name: string }[] };
  timestamp: number;
}

interface FeeOptionsResponse {
  usdc: { amount: number; currency: string; stable: boolean };
  order: {
    amount: number;
    currentPrice: number;
    currency: string;
    stable: boolean;
  };
  usdt: { amount: number; currency: string; stable: boolean };
  receiverAddress: string;
}

let globalOnDexCreate: (() => Promise<boolean>) | null = null;
let isPaymentDone = false;

export function setDexCreateCallback(cb: (() => Promise<boolean>) | null) {
  globalOnDexCreate = cb;
}

export function getIsPaymentDone() {
  return isPaymentDone;
}

export function resetPaymentDone() {
  isPaymentDone = false;
}

export default function GraduationPaymentSection() {
  const { t } = useTranslation();
  const { token } = useAuth();
  const { address } = useAccount();

  const defaultChain =
    getCurrentEnvironment() === "mainnet" ? "arbitrum" : "arbitrum-sepolia";
  const [chain, setChain] = useState<OrderTokenChainName>(defaultChain);

  const [brokerId, setBrokerId] = useState("");
  const [brokerIdError, setBrokerIdError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<VerifyTxResponse | null>(null);
  const [showManualInput, setShowManualInput] = useState(false);
  const [txHash, setTxHash] = useState("");
  const [existingBrokerIds, setExistingBrokerIds] = useState<string[]>([]);
  const [isPaymentComplete, setIsPaymentComplete] = useState(false);

  const [makerFee] = useState(3);
  const [takerFee] = useState(6);
  const [rwaMakerFee] = useState(0);
  const [rwaTakerFee] = useState(5);

  const [feeOptions, setFeeOptions] = useState<FeeOptionsResponse | null>(null);
  const [paymentType, setPaymentType] = useState<"usdc" | "order" | "usdt">(
    "order"
  );
  const { openModal } = useModal();

  const connectedChainId = useChainId();

  const preferredChain = useMemo(() => getPreferredChain(chain), [chain]);
  const TOKEN_ADDRESSES: Record<string, Record<string, string>> = {
    usdc: USDC_ADDRESSES as Record<string, string>,
    order: ORDER_ADDRESSES as Record<string, string>,
    usdt: USDT_ADDRESSES as Record<string, string>,
  };

  const currentTokenAddress = useMemo(
    () => TOKEN_ADDRESSES[paymentType]?.[preferredChain] ?? "",
    [preferredChain, paymentType]
  );

  const currentChainId =
    SUPPORTED_CHAINS.find(c => c.id === preferredChain)?.chainId || 1;

  const isCorrectChain = connectedChainId === currentChainId;
  const { switchChain } = useSwitchChain();

  const { data: tokenBalance } = useBalance({
    address,
    token: currentTokenAddress as `0x${string}`,
    chainId: currentChainId,
    query: {
      enabled: !!address && !!currentChainId,
      retry: 3,
      staleTime: 60_000,
    },
  });

  const handleTokenSelection = (
    selectedChain: OrderTokenChainName,
    selectedPaymentType: "usdc" | "order" | "usdt"
  ) => {
    setChain(selectedChain);
    setPaymentType(selectedPaymentType);
  };

  const { data: tokenDecimals } = useReadContract({
    address: currentTokenAddress as `0x${string}`,
    abi: [
      {
        name: "decimals",
        type: "function",
        stateMutability: "view",
        inputs: [],
        outputs: [{ name: "", type: "uint8" }],
      },
    ],
    functionName: "decimals",
    chainId: currentChainId,
    query: {
      enabled: !!currentChainId,
      retry: 3,
      staleTime: 60_000,
    },
  });

  const { data: hash, isPending, writeContract } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
      confirmations: 1,
    });

  useEffect(() => {
    if (isConfirmed && hash) {
      setTxHash(hash.toString());
      verifyTransaction(hash.toString());
    }
  }, [isConfirmed, hash]);

  useEffect(() => {
    async function fetchExistingBrokerIds() {
      try {
        const baseUrl = getBaseUrl();
        const response = await fetch(`${baseUrl}/v1/public/broker/name`);
        if (!response.ok) throw new Error("Failed to fetch broker IDs");
        const data: BrokerIdResponse = await response.json();
        if (data.success && data.data?.rows) {
          setExistingBrokerIds(data.data.rows.map(row => row.broker_id));
        }
      } catch (error) {
        console.error("Error fetching broker IDs:", error);
      }
    }
    fetchExistingBrokerIds();
  }, []);

  useEffect(() => {
    if (!brokerId) {
      setBrokerIdError(null);
      return;
    }
    const isValidFormat = /^[a-z0-9_-]+$/.test(brokerId);
    if (!isValidFormat) {
      setBrokerIdError(t("graduation.form.brokerIdFormatInvalid"));
      return;
    }
    if (existingBrokerIds.includes(brokerId)) {
      setBrokerIdError(t("graduation.form.brokerIdAlreadyTaken"));
      return;
    }
    setBrokerIdError(null);
  }, [brokerId, existingBrokerIds, t]);

  const loadFeeOptions = useCallback(async () => {
    try {
      const response = await get<FeeOptionsResponse>(
        "api/graduation/fee-options?isCustom=true",
        token
      );
      setFeeOptions(response);
    } catch (error) {
      console.error("Error loading fee options:", error);
      toast.error(t("graduation.form.failedToLoadFeeOptions"));
    }
  }, [token, t]);

  useEffect(() => {
    loadFeeOptions();
  }, [loadFeeOptions]);

  const markComplete = useCallback(() => {
    setIsPaymentComplete(true);
    isPaymentDone = true;
  }, []);

  const handleTransferOrder = async () => {
    if (globalOnDexCreate) {
      const created = await globalOnDexCreate();
      if (!created) return;
    }

    if (!address) {
      toast.error(t("common.pleaseConnectYourWallet"));
      return;
    }
    if (brokerIdError) {
      toast.error(brokerIdError);
      return;
    }
    if (!brokerId) {
      toast.error(t("graduation.form.enterBrokerId"));
      return;
    }

    try {
      if (!currentTokenAddress) {
        toast.error(t("graduation.form.missingTokenAddressConfig"));
        return;
      }
      if (!feeOptions?.receiverAddress) {
        toast.error(t("graduation.form.missingReceiverAddressConfig"));
        return;
      }
      if (tokenDecimals === undefined) {
        toast.error(t("graduation.form.loadingTokenInfo"));
        return;
      }
      if (!/^(0x)?[a-fA-F0-9]{40}$/.test(feeOptions.receiverAddress)) {
        toast.error(t("graduation.form.invalidReceiverAddressConfig"));
        return;
      }

      try {
        await switchChain({ chainId: currentChainId });
      } catch (error) {
        console.error("Failed to switch chain:", error);
        toast.error(t("graduation.form.ensureCorrectNetwork"));
        return;
      }

      if (!feeOptions) {
        toast.error(t("graduation.form.feeOptionsNotLoaded"));
        return;
      }

      const selectedOption =
        feeOptions[
          paymentType as keyof Omit<FeeOptionsResponse, "receiverAddress">
        ];

      const decimals = tokenDecimals ?? (paymentType !== "order" ? 6 : 18);
      const amount = parseUnits(selectedOption.amount.toString(), decimals);

      writeContract({
        abi: ERC20_ABI,
        address: currentTokenAddress as `0x${string}`,
        functionName: "transfer",
        args: [feeOptions.receiverAddress, amount],
        chainId: currentChainId,
      });
    } catch (error) {
      let errorMessage = t("graduation.form.failedToInitiateTransfer");
      if (error instanceof Error) {
        errorMessage = t("graduation.form.failedToInitiateTransferWithReason", {
          message: error.message,
        });
      }
      toast.error(errorMessage);
    }
  };

  const verifyTransaction = async (transactionHash: string) => {
    if (globalOnDexCreate) {
      const created = await globalOnDexCreate();
      if (!created) return;
    }

    setResult(null);
    setIsLoading(true);
    toast.info(t("graduation.form.verifyingTransactionWait"));

    try {
      const response = await post<VerifyTxResponse>(
        "api/graduation/verify-tx",
        {
          brokerId,
          chainId: currentChainId,
          chain_type: "EVM",
          chain: preferredChain,
          txHash: transactionHash,
          makerFee,
          takerFee,
          rwaMakerFee,
          rwaTakerFee,
          paymentType,
        },
        token,
        { showToastOnError: false }
      );

      setResult(response);

      if (response.success) {
        toast.success(t("graduation.form.transactionVerifiedSuccessfully"));
        markComplete();
      } else {
        toast.error(
          response.message || t("graduation.form.verificationFailed")
        );
      }
    } catch (error) {
      let errorMessage = t("graduation.form.verificationFailed");
      if (error instanceof Error) {
        errorMessage = error.message;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const statusCode = (error as any)?.status;
        const is502 =
          statusCode === 502 ||
          error.message.includes("502") ||
          error.message.includes("Bad Gateway");
        setResult({ success: false, message: error.message });

        if (is502) {
          toast.error(t("graduation.form.connectionLostRefreshing"), {
            autoClose: 3000,
            closeButton: false,
          });
          setTimeout(() => window.location.reload(), 2000);
          setIsLoading(false);
          return;
        }
      } else {
        setResult({
          success: false,
          message: t("graduation.form.unknownErrorOccurred"),
        });
      }
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (brokerIdError) {
      toast.error(brokerIdError);
      return;
    }
    await verifyTransaction(txHash);
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(t("graduation.form.copiedToClipboard", { label }));
    } catch {
      toast.error(t("graduation.form.failedToCopyToClipboard"));
    }
  };

  const getBlockExplorerUrl = (txHashStr: string, chainIdStr: string) => {
    const chain = SUPPORTED_CHAINS.find(c => c.id === chainIdStr);
    if (!chain) return null;
    return getBlockExplorerUrlByChainId(txHashStr, chain.chainId);
  };

  function getBaseUrl(): string {
    return (
      process.env.NEXT_PUBLIC_ORDERLY_API_BASE_URL ||
      "https://api.orderly.network"
    );
  }

  if (isPaymentComplete && result?.success) {
    return (
      <div className="p-4 bg-success/10 border border-success/20 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <div className="i-mdi:check-circle text-success w-5 h-5"></div>
          <span className="text-success font-medium">
            {t("graduation.form.transactionVerifiedSuccessfully")}
          </span>
        </div>
        {result.amount && (
          <p className="text-sm text-gray-300">
            {t("graduation.form.verifiedTransfer", {
              amount: result.amount,
              token: TOKEN_META[paymentType].symbol,
            })}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <FormInput
          id="brokerId"
          label={t("graduation.form.brokerIdLabel")}
          type="text"
          value={brokerId}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setBrokerId(e.target.value)
          }
          placeholder="my-broker-id"
          required
          helpText={
            <>
              <span className="text-gray-400 mb-1 block">
                {t("graduation.form.brokerIdHelp1")}
              </span>
              <span className="text-gray-400 mt-1 block">
                {t("graduation.form.brokerIdHelp2")}
              </span>
            </>
          }
          validator={validateBrokerId(existingBrokerIds)}
          onError={error => setBrokerIdError(error)}
        />
        {!brokerIdError && brokerId && (
          <div className="mt-1 text-xs text-success flex items-center">
            <span className="i-mdi:check-circle mr-1"></span>
            {t("common.brokerIdIsAvailable")}
          </div>
        )}
      </div>

      {feeOptions && (
        <div>
          <p className="text-gray-300 mb-4">
            {t("graduation.form.choosePaymentMethod")}
          </p>

          <div className="mb-4">
            <button
              onClick={() =>
                openModal("tokenSelection", {
                  onSelect: handleTokenSelection,
                  currentChain: chain,
                  currentPaymentType: paymentType,
                })
              }
              className="w-full p-4 border border-light/10 bg-background-card hover:border-light/20 rounded-xl transition-colors text-left"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-background-card flex items-center justify-center overflow-hidden">
                    <img
                      src={TOKEN_META[paymentType].icon}
                      alt={TOKEN_META[paymentType].symbol}
                      className="w-6 h-6 rounded-full"
                      onError={e => {
                        const target = e.currentTarget as HTMLImageElement;
                        target.style.display = "none";
                        const nextElement =
                          target.nextElementSibling as HTMLElement;
                        if (nextElement) nextElement.style.display = "block";
                      }}
                    />
                    <span className="text-lg hidden">
                      {TOKEN_META[paymentType].emoji}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium">
                      {TOKEN_META[paymentType].symbol}
                    </div>
                    <div className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                      <img
                        src={getChainIcon(preferredChain)}
                        alt={
                          SUPPORTED_CHAINS.find(c => c.id === preferredChain)
                            ?.name || preferredChain
                        }
                        className="w-3 h-3 rounded-full"
                        onError={e => {
                          const target = e.currentTarget as HTMLImageElement;
                          target.style.display = "none";
                        }}
                      />
                      {SUPPORTED_CHAINS.find(c => c.id === preferredChain)
                        ?.name || preferredChain}
                    </div>
                    <div className="text-sm text-gray-400 mt-1">
                      {paymentType !== "order" ? (
                        `$${feeOptions[paymentType].amount.toLocaleString()} ${TOKEN_META[paymentType].symbol}`
                      ) : (
                        <span>
                          {feeOptions.order.amount.toLocaleString()} ORDER (~$
                          {(
                            feeOptions.order.amount *
                            feeOptions.order.currentPrice
                          ).toFixed(2)}
                          )
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-primary-light">
                  <div className="i-mdi:chevron-right w-5 h-5"></div>
                </div>
              </div>
              {tokenBalance && (
                <div className="mt-2 text-xs text-gray-400">
                  {t("graduation.form.yourBalance")}:{" "}
                  {parseFloat(tokenBalance.formatted).toFixed(2)}{" "}
                  {TOKEN_META[paymentType].symbol}
                </div>
              )}
            </button>
          </div>

          <div className="bg-warning/10 border border-warning/20 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-3">
              <div className="i-mdi:alert-circle text-warning w-5 h-5 mt-0.5 flex-shrink-0"></div>
              <div>
                <h4 className="text-warning font-medium text-sm mb-1">
                  {t("graduation.form.doNotSendTokensManuallyTitle")}
                </h4>
                <p className="text-xs text-gray-400">
                  {t("graduation.form.doNotSendTokensManuallyDescription")}
                </p>
              </div>
            </div>
          </div>

          <p className="text-gray-300 text-sm">
            {t("graduation.form.autoTransferDescription")}
          </p>
        </div>
      )}

      <div className="space-y-4">
        <div className="border rounded-xl p-4 bg-primary/10 border-primary/20">
          <h3 className="text-md font-medium mb-2 flex items-center">
            <div className="w-5 h-5 mr-2 i-mdi:rocket-launch text-primary"></div>
            {t("graduation.form.sendTokensTitle", {
              token: TOKEN_META[paymentType].symbol,
            })}
          </h3>
          <p className="text-sm text-gray-300 mb-4">
            {t("graduation.form.sendTokensDescription", {
              token: TOKEN_META[paymentType].symbol,
            })}
          </p>

          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <div className="text-xs text-gray-400">
                {t("graduation.form.usingToken")}
              </div>
              <div className="text-xs bg-info/20 text-info px-2 py-1 rounded-full flex items-center">
                <div className="i-mdi:information-outline mr-1 w-3.5 h-3.5"></div>
                <span>
                  {SUPPORTED_CHAINS.find(c => c.id === preferredChain)?.name ||
                    preferredChain}{" "}
                  {TOKEN_META[paymentType].symbol}
                </span>
              </div>
            </div>

            {tokenBalance && (
              <div className="text-xs mb-3 flex items-center">
                <span className="text-info">
                  {t("graduation.form.yourBalance")}:
                </span>{" "}
                <span className="font-medium ml-1">
                  {new Intl.NumberFormat("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }).format(parseFloat(tokenBalance?.formatted || "0"))}{" "}
                  {TOKEN_META[paymentType].symbol}
                </span>
                {feeOptions &&
                  parseFloat(tokenBalance?.formatted || "0") <
                    (paymentType !== "order"
                      ? feeOptions[paymentType].amount
                      : feeOptions.order.amount) && (
                    <div className="ml-2 text-warning flex items-center">
                      {t("graduation.form.insufficientForGraduation")}
                    </div>
                  )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 mb-4">
            <div className="text-sm">{t("graduation.form.amount")}:</div>
            <div className="font-medium flex items-center gap-2">
              {feeOptions ? (
                paymentType !== "order" ? (
                  `$${feeOptions[paymentType].amount.toLocaleString()} ${TOKEN_META[paymentType].symbol}`
                ) : (
                  <>
                    {feeOptions.order.amount.toLocaleString()} ORDER
                    <span className="text-gray-500 text-xs ml-1">
                      (~$
                      {(
                        feeOptions.order.amount * feeOptions.order.currentPrice
                      ).toFixed(2)}
                      )
                    </span>
                  </>
                )
              ) : (
                t("graduation.form.loading")
              )}
            </div>
          </div>

          <Button
            onClick={
              isCorrectChain
                ? handleTransferOrder
                : () => switchChain({ chainId: currentChainId })
            }
            isLoading={isPending || isConfirming || isLoading}
            loadingText={
              isPending
                ? t("graduation.form.confirmInWallet")
                : isConfirming
                  ? t("graduation.form.confirming")
                  : t("graduation.form.verifyingTransactionLoading")
            }
            disabled={
              isCorrectChain &&
              (!!brokerIdError ||
                !brokerId ||
                !feeOptions ||
                isLoading ||
                (feeOptions && tokenBalance
                  ? parseFloat(tokenBalance?.formatted || "0") <
                    (paymentType !== "order"
                      ? feeOptions[paymentType].amount
                      : feeOptions.order.amount)
                  : false))
            }
            variant="primary"
            className="w-full justify-center"
          >
            {isCorrectChain
              ? !brokerId
                ? t("graduation.form.enterBrokerIdToContinue")
                : t("graduation.form.transferTokensCta", {
                    token: TOKEN_META[paymentType].symbol,
                  })
              : t("graduation.form.switchChainCta")}
          </Button>

          {isConfirmed && hash && !result && (
            <div className="mt-3 bg-success/10 text-success text-sm p-2 rounded">
              <div className="flex items-center justify-between">
                <span>{t("graduation.form.transferSuccessfulVerifying")}</span>
                {getBlockExplorerUrl(hash, preferredChain) && (
                  <a
                    href={getBlockExplorerUrl(hash, preferredChain)!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-light hover:text-primary text-xs flex items-center ml-2"
                  >
                    {t("graduation.form.viewOnExplorer")}
                    <span className="i-mdi:open-in-new w-3 h-3 ml-1"></span>
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="text-center">
          <button
            type="button"
            onClick={() => setShowManualInput(!showManualInput)}
            className="text-sm text-primary-light hover:text-primary flex items-center gap-1 mx-auto"
          >
            <div
              className={clsx(
                "transition-transform",
                showManualInput ? "rotate-90" : ""
              )}
            >
              <div className="i-mdi:chevron-right w-4 h-4"></div>
            </div>
            {showManualInput
              ? t("graduation.form.hideManualOption")
              : t("graduation.form.showManualOption", {
                  token: TOKEN_META[paymentType].symbol,
                })}
          </button>
        </div>

        {showManualInput && (
          <div className="border rounded-xl p-4 bg-background-card border-base-contrast-12">
            <h3 className="text-md font-medium mb-2 flex items-center">
              <div className="w-5 h-5 mr-2 i-mdi:file-document text-base-contrast-12"></div>
              {t("graduation.form.manualVerificationTitle")}
            </h3>
            <p className="text-sm text-gray-300 mb-4">
              {t("graduation.form.manualVerificationDescription", {
                token: TOKEN_META[paymentType].symbol,
              })}
            </p>

            <div className="mb-4">
              <div className="flex justify-between items-center mb-1">
                <p className="text-xs text-gray-400">
                  {t("graduation.form.recipientAddress")}:
                </p>
                <button
                  onClick={() =>
                    copyToClipboard(
                      feeOptions?.receiverAddress || "",
                      t("graduation.form.recipientAddress")
                    )
                  }
                  className="text-primary-light hover:text-primary text-xs flex items-center"
                >
                  <div className="i-mdi:content-copy w-3 h-3 mr-1"></div>
                  {t("common.copy")}
                </button>
              </div>
              <div className="bg-background-dark/70 p-2 rounded overflow-hidden">
                <code className="text-xs font-mono break-all w-full block">
                  {feeOptions?.receiverAddress || "Loading..."}
                </code>
              </div>
            </div>

            <div className="mt-3">
              <div className="flex justify-between items-center mb-1">
                <p className="text-xs text-gray-400">
                  {t("graduation.form.tokenAddressLabel", {
                    token: TOKEN_META[paymentType].symbol,
                  })}
                  :
                </p>
              </div>
              <div className="bg-background-dark/70 p-2 rounded overflow-hidden">
                <code className="text-xs font-mono break-all w-full block">
                  {currentTokenAddress}
                </code>
              </div>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 my-4">
              <div className="flex items-start space-x-3">
                <div className="i-mdi:information-outline text-blue-400 mt-0.5 h-5 w-5 flex-shrink-0"></div>
                <div>
                  <h4 className="text-sm font-medium text-blue-400 mb-1">
                    {t("graduation.form.transactionVerificationTitle")}
                  </h4>
                  <p className="text-xs text-gray-300">
                    {t("graduation.form.transactionVerificationDescription")}
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <FormInput
                id="txHash"
                label={t("graduation.form.transactionHash")}
                type="text"
                value={txHash}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setTxHash(e.target.value)
                }
                placeholder="0x..."
                required
                helpText={t("graduation.form.txHashHelpText", {
                  token: TOKEN_META[paymentType].symbol,
                })}
              />

              <Button
                type="submit"
                variant="secondary"
                isLoading={isLoading}
                loadingText={t("graduation.form.verifyingTransactionLoading")}
                className="w-full justify-center"
                disabled={!txHash || !!brokerIdError || !brokerId}
              >
                {t("graduation.form.verifyTransactionButton")}
              </Button>

              {(!txHash || !!brokerIdError || !brokerId) && (
                <div className="mt-2 text-xs text-gray-400 text-center">
                  {!brokerId && (
                    <span>{t("graduation.form.enterBrokerIdToContinue")}</span>
                  )}
                  {brokerId && brokerIdError && (
                    <span>{t("graduation.form.fixBrokerIdError")}</span>
                  )}
                  {brokerId && !brokerIdError && !txHash && (
                    <span>{t("graduation.form.enterTxHashToVerify")}</span>
                  )}
                </div>
              )}
            </form>
          </div>
        )}
      </div>

      {result && !result.success && (
        <div className="p-4 rounded-lg bg-error/10">
          <p className="text-error">{result.message}</p>
        </div>
      )}
    </div>
  );
}
