import {
  FormEvent,
  useState,
  useEffect,
  ChangeEvent,
  useCallback,
  useMemo,
} from "react";
import FormInput from "./FormInput";
import { Button } from "./Button";
import { toast } from "react-toastify";
import { post, get } from "../utils/apiClient";
import { useAuth } from "../context/useAuth";
import { validateBrokerId } from "../utils/validation";
import { Card } from "./Card";
import {
  useBalance,
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
  useSwitchChain,
  useChainId,
  useReadContract,
  useWalletClient,
} from "wagmi";
import { parseUnits } from "viem";
import { BrowserProvider } from "ethers";
import clsx from "clsx";
import { FeeConfigWithCalculator } from "./FeeConfigWithCalculator";
import { BaseFeeExplanation } from "./BaseFeeExplanation";
import {
  cleanMultisigAddress,
  extractChainFromAddress,
} from "../utils/multisig";
import { useModal } from "../context/ModalContext";
import {
  getBaseUrl,
  registerAccount,
  pollAccountRegistration,
  checkAccountRegistration,
  getOffChainDomain,
  loadOrderlyKey,
  getAccountId,
} from "../utils/orderly";
import { getBlockExplorerUrlByChainId } from "../../../config";
import { generateDeploymentUrl } from "../utils/deploymentUrl";
import {
  getSupportedChains,
  getPreferredChain,
  getCurrentEnvironment,
} from "../utils/config";
import {
  ORDER_ADDRESSES,
  USDC_ADDRESSES,
  OrderTokenChainName,
  getChainIcon,
} from "../../../config";
import { SwapFeeWithdrawal } from "./SwapFeeWithdrawal";
import { parseWalletError } from "../utils/wallet";
import { Trans, useTranslation } from "~/i18n";

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

const validateAddress = (address: string): boolean => {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

const getSwapUrl = (chainId: string) => {
  const tokenAddress = ORDER_ADDRESSES[chainId as OrderTokenChainName];
  if (!tokenAddress) {
    console.warn(`No ORDER token address configured for chain: ${chainId}`);
    return "#";
  }
  return `https://swap.defillama.com/?chain=${chainId}&from=0x0000000000000000000000000000000000000000&tab=swap&to=${tokenAddress}`;
};

interface VerifyTxResponse {
  success: boolean;
  message: string;
  amount?: string;
}

interface NewGraduationStatusResponse {
  success: boolean;
  isGraduated: boolean;
  brokerId: string;
  isMultisig?: boolean;
  multisigAddress?: string | null;
  multisigChainId?: number | null;
}

interface FeeConfigResponse {
  success: boolean;
  makerFee: number;
  takerFee: number;
  rwaMakerFee: number;
  rwaTakerFee: number;
  message?: string;
}

interface BrokerIdResponse {
  success: boolean;
  data: {
    rows: {
      broker_id: string;
      broker_name: string;
    }[];
  };
  timestamp: number;
}

interface FeeOptionsResponse {
  usdc: {
    amount: number;
    currency: string;
    stable: boolean;
  };
  order: {
    amount: number;
    currentPrice: number;
    requiredPrice: number;
    minimumPrice: number;
    currency: string;
    stable: boolean;
  };
  receiverAddress: string;
}

interface BrokerTierResponse {
  tier: string;
  stakingVolume: string;
  tradingVolume: string;
  makerFeeRate: string;
  takerFeeRate: string;
  logDate: string;
}

interface GraduationFormProps {
  onNoDexSetup?: () => void;
  onGraduationSuccess?: () => void;
}

export function GraduationForm({
  onNoDexSetup,
  onGraduationSuccess,
}: GraduationFormProps) {
  const { t } = useTranslation();
  const { token } = useAuth();
  const { address } = useAccount();
  const [txHash, setTxHash] = useState("");

  const defaultChain =
    getCurrentEnvironment() === "mainnet" ? "arbitrum" : "arbitrum-sepolia";
  const [chain, setChain] = useState<OrderTokenChainName>(defaultChain);

  const [brokerId, setBrokerId] = useState("");
  const [brokerIdError, setBrokerIdError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<VerifyTxResponse | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [showManualInput, setShowManualInput] = useState(false);
  const [existingBrokerIds, setExistingBrokerIds] = useState<string[]>([]);

  const [makerFee, setMakerFee] = useState<number>(3);
  const [takerFee, setTakerFee] = useState<number>(6);
  const [rwaMakerFee, setRwaMakerFee] = useState<number>(0);
  const [rwaTakerFee, setRwaTakerFee] = useState<number>(5);

  const [graduationStatus, setGraduationStatus] =
    useState<NewGraduationStatusResponse | null>(null);
  const [isFinalizingAdminWallet, setIsFinalizingAdminWallet] = useState(false);
  const [dexData, setDexData] = useState<{ repoUrl?: string } | null>(null);
  const [feeOptions, setFeeOptions] = useState<FeeOptionsResponse | null>(null);
  const [paymentType, setPaymentType] = useState<"usdc" | "order">("order");
  const [brokerTier, setBrokerTier] = useState<BrokerTierResponse | null>(null);
  const { openModal } = useModal();
  const [walletType, setWalletType] = useState<"eoa" | "multisig">("eoa");
  const [multisigAddress, setMultisigAddress] = useState("");
  const [multisigTxHash, setMultisigTxHash] = useState("");
  const [isRegisteringMultisig, setIsRegisteringMultisig] = useState(false);
  const [multisigHasKey, setMultisigHasKey] = useState(false);

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(t("graduationForm.copiedToClipboard", { label }));
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
      toast.error(t("graduationForm.failedToCopyToClipboard"));
    }
  };

  const MESSAGE_TYPES = {
    DelegateSigner: [
      { name: "delegateContract", type: "address" },
      { name: "brokerId", type: "string" },
      { name: "chainId", type: "uint256" },
      { name: "timestamp", type: "uint64" },
      { name: "registrationNonce", type: "uint256" },
      { name: "txHash", type: "bytes32" },
    ],
  };

  const announceDelegateSigner = async (
    delegateContract: string,
    brokerId: string,
    chainId: number,
    txHash: string
  ) => {
    if (!walletClient) {
      throw new Error("Wallet client not available");
    }

    const nonceRes = await fetch(`${getBaseUrl()}/v1/registration_nonce`);
    const nonceJson = await nonceRes.json();
    const registrationNonce = nonceJson.data.registration_nonce as string;

    const delegateSignerMessage = {
      delegateContract,
      brokerId,
      chainId,
      timestamp: Date.now(),
      registrationNonce: Number(registrationNonce),
      txHash,
    };

    const provider = new BrowserProvider(walletClient);
    const signer = await provider.getSigner();
    const signature = await signer.signTypedData(
      getOffChainDomain(chainId),
      { DelegateSigner: MESSAGE_TYPES.DelegateSigner },
      delegateSignerMessage
    );

    const delegateSignerRes = await fetch(
      `${getBaseUrl()}/v1/delegate_signer`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: delegateSignerMessage,
          signature,
          userAddress: address,
        }),
      }
    );
    const registerJson = await delegateSignerRes.json();
    if (!registerJson.success) {
      throw new Error(registerJson.message);
    }
    return registerJson.data;
  };

  const handleRegisterMultisig = async () => {
    if (!multisigAddress.trim()) {
      toast.error(t("graduationForm.enterMultisigAddress"));
      return;
    }

    if (!multisigTxHash.trim()) {
      toast.error(t("graduationForm.enterSafeTransactionHash"));
      return;
    }

    if (!address) {
      toast.error(t("graduationForm.connectWalletFirst"));
      return;
    }

    if (!graduationStatus?.brokerId) {
      toast.error(t("graduationForm.noBrokerIdFound"));
      return;
    }

    setIsRegisteringMultisig(true);
    try {
      const cleanAddress = cleanMultisigAddress(multisigAddress);

      const extractedChain = extractChainFromAddress(multisigAddress);
      if (extractedChain && extractedChain !== connectedChainId) {
        await switchChain({ chainId: extractedChain });
        toast.info(t("graduationForm.switchingToCorrectNetworkForMultisig"));
        return;
      }

      await announceDelegateSigner(
        cleanAddress,
        graduationStatus.brokerId,
        connectedChainId,
        multisigTxHash
      );

      const response = await post<{
        success: boolean;
        message: string;
        isGraduated: boolean;
      }>(
        "api/graduation/finalize-admin-wallet",
        {
          multisigAddress: cleanAddress,
          multisigChainId: connectedChainId,
        },
        token,
        {
          showToastOnError: false,
        }
      );

      if (response.success) {
        toast.success(t("graduationForm.multisigRegisteredSuccess"));
        const statusResponse = await get<NewGraduationStatusResponse>(
          "api/graduation/graduation-status",
          token
        );
        setGraduationStatus(statusResponse);

        if (onGraduationSuccess) {
          onGraduationSuccess();
        }
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error("Error registering multisig:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : t("graduationForm.failedToRegisterMultisig")
      );
    } finally {
      setIsRegisteringMultisig(false);
    }
  };

  const preferredChain = useMemo(() => getPreferredChain(chain), [chain]);
  const currentTokenAddress = useMemo(
    () =>
      paymentType === "usdc"
        ? USDC_ADDRESSES[preferredChain as OrderTokenChainName]
        : ORDER_ADDRESSES[preferredChain as OrderTokenChainName],
    [preferredChain, paymentType]
  );

  const currentChainId =
    SUPPORTED_CHAINS.find(c => c.id === preferredChain)?.chainId || 1;

  const connectedChainId = useChainId();
  const { data: walletClient } = useWalletClient();
  const isCorrectChain = connectedChainId === currentChainId;

  const { switchChain } = useSwitchChain();

  useEffect(() => {
    Object.entries(ORDER_ADDRESSES).forEach(([chain, address]) => {
      if (!address) {
        console.log(`Missing ORDER token address for ${chain}`);
      } else if (!validateAddress(address)) {
        console.log(`Invalid ORDER token address format for ${chain}`);
      }
    });
  }, []);

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
    selectedPaymentType: "usdc" | "order"
  ) => {
    setChain(selectedChain);
    setPaymentType(selectedPaymentType);
  };

  const { data: tokenDecimals, error: decimalsError } = useReadContract({
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
    if (decimalsError) {
      console.warn("Token decimals read failed:", decimalsError);
    }
  }, [decimalsError]);

  useEffect(() => {
    if (isConfirmed && hash) {
      setTxHash(hash);

      verifyTransaction(hash.toString());
    }
  }, [isConfirmed, hash]);

  useEffect(() => {
    async function fetchExistingBrokerIds() {
      try {
        const response = await fetch(`${getBaseUrl()}/v1/public/broker/name`);
        if (!response.ok) {
          throw new Error("Failed to fetch broker IDs");
        }

        const data: BrokerIdResponse = await response.json();

        if (data.success && data.data?.rows) {
          const brokerIds = data.data.rows.map(row => row.broker_id);
          setExistingBrokerIds(brokerIds);
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
      setBrokerIdError(t("graduationForm.brokerIdFormatInvalid"));
      return;
    }

    if (existingBrokerIds.includes(brokerId)) {
      setBrokerIdError(t("graduationForm.brokerIdAlreadyTaken"));
      return;
    }

    setBrokerIdError(null);
  }, [brokerId, existingBrokerIds]);

  const loadFeeConfiguration = useCallback(async () => {
    try {
      const feeResponse = await get<FeeConfigResponse>(
        "api/graduation/fees",
        token
      );

      if (feeResponse.success) {
        setMakerFee(feeResponse.makerFee);
        setTakerFee(feeResponse.takerFee);
        setRwaMakerFee(feeResponse.rwaMakerFee);
        setRwaTakerFee(feeResponse.rwaTakerFee);
      }
    } catch (error) {
      console.error("Error loading fee configuration:", error);
    }
  }, [token, setMakerFee, setTakerFee, setRwaMakerFee, setRwaTakerFee]);

  const loadFeeOptions = useCallback(async () => {
    try {
      const response = await get<FeeOptionsResponse>(
        "api/graduation/fee-options",
        token
      );
      setFeeOptions(response);
    } catch (error) {
      console.error("Error loading fee options:", error);
      toast.error(t("graduationForm.failedToLoadFeeOptions"));
    }
  }, [token]);

  useEffect(() => {
    async function loadStatus() {
      try {
        await Promise.all([loadFeeConfiguration(), loadFeeOptions()]);
      } catch (error) {
        console.error("Error loading graduation status:", error);

        if (
          error instanceof Error &&
          error.message.includes("You must create a DEX first") &&
          onNoDexSetup
        ) {
          onNoDexSetup();
        }
      }
    }

    loadStatus();
  }, [token, hasSubmitted, loadFeeConfiguration, loadFeeOptions, onNoDexSetup]);

  useEffect(() => {
    async function loadGraduationStatus() {
      try {
        const response = await get<NewGraduationStatusResponse>(
          "api/graduation/graduation-status",
          token,
          { showToastOnError: false }
        );

        setGraduationStatus(response);
      } catch (error) {
        console.error("Error loading graduation status:", error);
        setGraduationStatus(null);
      }
    }

    async function loadDexData() {
      try {
        const response = await get<{ repoUrl?: string }>("api/dex", token, {
          showToastOnError: false,
        });
        setDexData(response);
      } catch (error) {
        console.error("Error loading DEX data:", error);
        setDexData(null);
      }
    }

    async function loadBrokerTier() {
      try {
        const response = await get<BrokerTierResponse>(
          "api/graduation/tier",
          token,
          { showToastOnError: false }
        );
        setBrokerTier(response);
      } catch (error) {
        console.error("Error loading broker tier:", error);
        setBrokerTier(null);
      }
    }

    if (token) {
      loadGraduationStatus();
      loadDexData();
      loadBrokerTier();
    }
  }, [token, hasSubmitted]);

  useEffect(() => {
    if (
      graduationStatus?.isMultisig &&
      graduationStatus?.multisigAddress &&
      graduationStatus?.brokerId
    ) {
      const cleanAddress = cleanMultisigAddress(
        graduationStatus.multisigAddress
      );
      const accountId = getAccountId(cleanAddress, graduationStatus.brokerId);
      const savedKey = loadOrderlyKey(accountId);
      setMultisigHasKey(!!savedKey);
    } else {
      setMultisigHasKey(false);
    }
  }, [graduationStatus]);

  const handleFinalizeAdminWallet = async () => {
    if (!address) {
      toast.error(t("graduationForm.connectWalletFirst"));
      return;
    }

    if (!graduationStatus?.brokerId) {
      toast.error(t("graduationForm.noBrokerIdFound"));
      return;
    }

    if (!walletClient) {
      toast.error(t("graduationForm.noWalletClientAvailable"));
      return;
    }

    setIsFinalizingAdminWallet(true);
    try {
      const existingRegistration = await checkAccountRegistration(
        address,
        graduationStatus.brokerId
      );

      if (!existingRegistration.isRegistered) {
        const provider = new BrowserProvider(walletClient);
        const signer = await provider.getSigner();

        await registerAccount(
          signer,
          address,
          connectedChainId || 1,
          graduationStatus.brokerId
        );

        await pollAccountRegistration(
          address,
          graduationStatus.brokerId,
          20,
          1000
        );

        toast.success(t("graduationForm.accountRegisteredSuccessfully"));
      }

      const response = await post<{
        success: boolean;
        message: string;
        isGraduated: boolean;
      }>("api/graduation/finalize-admin-wallet", {}, token, {
        showToastOnError: false,
      });

      if (response.success) {
        toast.success(t("graduationForm.adminWalletSetupSuccess"));
        const statusResponse = await get<NewGraduationStatusResponse>(
          "api/graduation/graduation-status",
          token
        );
        setGraduationStatus(statusResponse);

        if (onGraduationSuccess) {
          onGraduationSuccess();
        }
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error("Error finalizing admin wallet:", error);
      const message =
        parseWalletError(error) ||
        t("graduationForm.failedToFinalizeAdminWallet");
      toast.error(message);
    } finally {
      setIsFinalizingAdminWallet(false);
    }
  };

  const handleTransferOrder = async () => {
    if (!address) {
      toast.error(t("graduationForm.connectWalletFirst"));
      return;
    }

    if (brokerIdError) {
      toast.error(brokerIdError);
      return;
    }

    if (!brokerId) {
      toast.error(t("graduationForm.enterBrokerId"));
      return;
    }

    try {
      console.log(`Initiating ORDER token transfer on ${chain}`);

      if (!currentTokenAddress) {
        console.log(`Missing ORDER token address for ${chain}`);
        toast.error(t("graduationForm.missingTokenAddressConfig"));
        return;
      }

      if (!feeOptions?.receiverAddress) {
        console.log("Missing receiver address from fee options");
        toast.error(t("graduationForm.missingReceiverAddressConfig"));
        return;
      }

      if (tokenDecimals === undefined) {
        toast.error(t("graduationForm.loadingTokenInfo"));
        return;
      }

      if (!validateAddress(feeOptions.receiverAddress)) {
        console.log("Invalid receiver address format");
        toast.error(t("graduationForm.invalidReceiverAddressConfig"));
        return;
      }

      try {
        await switchChain({ chainId: currentChainId });
      } catch (error) {
        console.error("Failed to switch chain:", error);
        toast.error(t("graduationForm.ensureCorrectNetwork"));
        return;
      }

      if (!feeOptions) {
        toast.error(t("graduationForm.feeOptionsNotLoaded"));
        return;
      }

      const selectedOption =
        paymentType === "usdc" ? feeOptions.usdc : feeOptions.order;

      const decimals = tokenDecimals ?? (paymentType === "usdc" ? 6 : 18);
      const amount = parseUnits(selectedOption.amount.toString(), decimals);

      console.log({
        chain: preferredChain,
        decimals,
        requiredAmount: selectedOption.amount,
        calculatedAmount: amount.toString(),
        address: currentTokenAddress as `0x${string}`,
        functionName: "transfer",
        args: [feeOptions.receiverAddress, amount],
        chainId: currentChainId,
      });
      writeContract({
        abi: ERC20_ABI,
        address: currentTokenAddress as `0x${string}`,
        functionName: "transfer",
        args: [feeOptions.receiverAddress, amount],
        chainId: currentChainId,
      });
    } catch (error) {
      console.log("ORDER token transfer error:", error);

      let errorMessage = t("graduationForm.failedToInitiateTransfer");
      if (error instanceof Error) {
        errorMessage = t("graduationForm.failedToInitiateTransferWithReason", {
          message: error.message,
        });
      }

      toast.error(errorMessage);
    }
  };

  const verifyTransaction = async (transactionHash: string) => {
    setResult(null);
    setIsLoading(true);

    toast.info(t("graduationForm.verifyingTransactionWait"));

    try {
      const response = await post<VerifyTxResponse>(
        "api/graduation/verify-tx",
        {
          brokerId,
          chainId: currentChainId,
          // currently only EVM is supported
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
      setHasSubmitted(true);

      if (response.success) {
        toast.success(t("graduationForm.transactionVerifiedSuccessfully"));
        loadFeeConfiguration();
        setTxHash("");
        window.scrollTo({ top: 0, behavior: "smooth" });

        if (onGraduationSuccess) {
          onGraduationSuccess();
        }
      } else {
        toast.error(response.message || t("graduationForm.verificationFailed"));
      }
    } catch (error) {
      console.log("Transaction verification error:", error);

      let errorMessage = t("graduationForm.verificationFailed");
      let is502ErrorLocal = false;

      if (error instanceof Error) {
        errorMessage = error.message;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const statusCode = (error as any)?.status;
        is502ErrorLocal =
          statusCode === 502 ||
          error.message.includes("502") ||
          error.message.includes("Bad Gateway");
        setResult({ success: false, message: error.message });
      } else {
        setResult({
          success: false,
          message: t("graduationForm.unknownErrorOccurred"),
        });
      }

      if (is502ErrorLocal) {
        toast.error(t("graduationForm.connectionLostRefreshing"), {
          autoClose: 3000,
          closeButton: false,
        });
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        toast.error(errorMessage);
      }
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

  const getBlockExplorerUrl = (txHash: string, chainId: string) => {
    const chain = SUPPORTED_CHAINS.find(c => c.id === chainId);
    if (!chain) return null;

    return getBlockExplorerUrlByChainId(txHash, chain.chainId);
  };

  if (
    graduationStatus?.success &&
    graduationStatus.brokerId !== "demo" &&
    !graduationStatus.isGraduated
  ) {
    return (
      <Card className="w-full max-w-2xl mx-auto slide-fade-in">
        <div className="text-center">
          <div className="i-mdi:account-check text-6xl text-primary-light mx-auto mb-2"></div>
          <div className="bg-primary/10 rounded-full text-primary-light px-4 py-2 inline-block text-sm font-medium mb-4">
            {t("graduationForm.brokerIdCreated")}
          </div>
          <h2 className="text-2xl font-bold">
            {t("graduationForm.completeYourGraduation")}
          </h2>
          <p className="text-gray-300 mt-2 mb-6">
            <Trans
              i18nKey={"graduationForm.brokerIdCreatedDescription"}
              values={{ brokerId: graduationStatus.brokerId }}
              components={[
                <span
                  key="0"
                  className="font-mono bg-background-card px-2 py-1 rounded text-primary-light"
                />,
              ]}
            />
          </p>

          <div className="bg-warning/10 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-medium flex items-center mb-2">
              <div className="i-mdi:alert-circle text-warning mr-2 h-5 w-5"></div>
              {t("graduationForm.finalStepRequired")}
            </h3>
            <p className="text-sm text-gray-400 mb-3">
              <strong className="text-warning">
                {t("graduationForm.notEarningFeesYet")}
              </strong>{" "}
              {t("graduationForm.completeAdminWalletSetup")}
            </p>
          </div>

          <div className="bg-light/5 rounded-lg p-4 mb-6 text-left">
            <h3 className="text-md font-medium mb-3 flex items-center">
              <div className="i-mdi:wallet text-primary-light mr-2 h-5 w-5"></div>
              {t("graduationForm.selectWalletType")}
            </h3>

            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setWalletType("eoa")}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                  walletType === "eoa"
                    ? "bg-primary/20 text-primary border border-primary/30"
                    : "bg-background-card text-gray-400 hover:text-gray-300 border border-light/10"
                }`}
              >
                {t("graduationForm.eoaWallet")}
              </button>
              <button
                onClick={() => setWalletType("multisig")}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                  walletType === "multisig"
                    ? "bg-primary/20 text-primary border border-primary/30"
                    : "bg-background-card text-gray-400 hover:text-gray-300 border border-light/10"
                }`}
              >
                {t("graduationForm.gnosisSafe")}
              </button>
            </div>

            {walletType === "eoa" ? (
              <div className="space-y-4">
                <div className="bg-background-card rounded-lg p-4">
                  <h4 className="text-sm font-medium mb-2 flex items-center">
                    <div className="i-mdi:information-outline text-info mr-2 h-4 w-4"></div>
                    {t("graduationForm.whatThisDoes")}
                  </h4>
                  <p className="text-xs text-gray-400 mb-3">
                    {t("graduationForm.eoaDescription")}
                  </p>
                  <div className="text-xs text-gray-500 space-y-1">
                    <p>{t("graduationForm.registersEvmAddress")}</p>
                    <p>{t("graduationForm.createsBrokerAccount")}</p>
                    <p>{t("graduationForm.enablesRevenueSharing")}</p>
                  </div>
                </div>

                <Button
                  onClick={handleFinalizeAdminWallet}
                  isLoading={isFinalizingAdminWallet}
                  loadingText={t("graduationForm.registeringWithOrderly")}
                  variant="primary"
                  className="w-full text-center"
                >
                  {t("graduationForm.registerWithOrderly")}
                </Button>

                <div className="bg-light/5 rounded-lg p-3">
                  <p className="text-xs text-gray-400">
                    {t("graduationForm.signMessagePrompt", {
                      brokerId: graduationStatus.brokerId,
                    })}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-background-card rounded-lg p-4">
                  <h4 className="text-sm font-medium mb-2 flex items-center">
                    <div className="i-mdi:shield-check text-info mr-2 h-4 w-4"></div>
                    {t("graduationForm.gnosisSafeWallet")}
                  </h4>
                  <p className="text-xs text-gray-400 mb-3">
                    {t("graduationForm.gnosisSafeDescription")}
                  </p>
                  <div className="text-xs text-gray-500 space-y-1 mb-4">
                    <p>{t("graduationForm.multisigEnhancedSecurity")}</p>
                    <p>{t("graduationForm.multisigShareControl")}</p>
                    <p>{t("graduationForm.multisigForTeams")}</p>
                  </div>
                </div>

                <Button
                  onClick={() =>
                    openModal("safeInstructions", {
                      brokerId: graduationStatus.brokerId,
                      chainId: connectedChainId,
                    })
                  }
                  variant="secondary"
                  className="w-full"
                >
                  <span className="flex items-center justify-center gap-2">
                    <div className="i-mdi:book-open-variant h-4 w-4"></div>
                    {t("graduationForm.viewSetupInstructions")}
                  </span>
                </Button>

                <div className="bg-background-card rounded-lg p-4 border border-primary/10">
                  <h4 className="text-sm font-medium mb-3 flex items-center">
                    <div className="i-mdi:account-plus text-primary mr-2 h-4 w-4"></div>
                    {t("graduationForm.registerYourMultisig")}
                  </h4>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-2">
                        {t("graduationForm.multisigAddress")}
                      </label>
                      <input
                        type="text"
                        value={multisigAddress}
                        onChange={e => setMultisigAddress(e.target.value)}
                        placeholder={t(
                          "graduationForm.multisigAddressPlaceholder"
                        )}
                        className="w-full px-3 py-2 bg-background-dark border border-light/10 rounded-lg text-white placeholder-gray-400 focus:border-primary/50 focus:outline-none text-sm"
                      />
                      <p className="text-xs text-gray-400 mt-1">
                        {t("graduationForm.multisigAddressHelp")}
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-300 mb-2">
                        {t("graduationForm.transactionHash")}
                      </label>
                      <input
                        type="text"
                        value={multisigTxHash}
                        onChange={e => setMultisigTxHash(e.target.value)}
                        placeholder="0x..."
                        className="w-full px-3 py-2 bg-background-dark border border-light/10 rounded-lg text-white placeholder-gray-400 focus:border-primary/50 focus:outline-none text-sm"
                      />
                      <p className="text-xs text-gray-400 mt-1">
                        {t("graduationForm.transactionHashHelp")}
                      </p>
                    </div>

                    <Button
                      onClick={handleRegisterMultisig}
                      isLoading={isRegisteringMultisig}
                      loadingText={t("graduationForm.registeringMultisig")}
                      variant="primary"
                      className="w-full"
                      disabled={
                        !multisigAddress.trim() ||
                        !multisigTxHash.trim() ||
                        !address
                      }
                    >
                      <span className="flex items-center justify-center gap-2">
                        <div className="i-mdi:account-plus h-4 w-4"></div>
                        {t("graduationForm.registerMultisig")}
                      </span>
                    </Button>

                    {!address && (
                      <p className="text-xs text-warning text-center">
                        {t("graduationForm.connectWalletToRegisterMultisig")}
                      </p>
                    )}
                  </div>
                </div>

                <div className="bg-info/10 rounded-lg p-3 border border-info/20">
                  <div className="flex items-start gap-2">
                    <div className="i-mdi:information-outline text-info w-4 h-4 mt-0.5 flex-shrink-0"></div>
                    <div>
                      <p className="text-xs text-info font-medium mb-1">
                        {t("graduationForm.stepByStepGuide")}
                      </p>
                      <p className="text-xs text-gray-400">
                        {t("graduationForm.viewSetupInstructionsHelp", {
                          brokerId: graduationStatus.brokerId,
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>
    );
  }

  if (graduationStatus?.isGraduated) {
    return (
      <Card className="w-full max-w-2xl mx-auto slide-fade-in">
        <div className="text-center">
          <div className="i-mdi:check-circle text-6xl text-success mx-auto mb-2"></div>
          <div className="bg-success/10 rounded-full text-success px-4 py-2 inline-block text-sm font-medium mb-4">
            {t("graduationForm.graduatedSuccessfully")}
          </div>
          <h2 className="text-2xl font-bold">
            {t("graduationForm.congratulations")}
          </h2>
          <p className="text-gray-300 mt-2 mb-6">
            {t("graduationForm.graduationSuccessDescription", {
              brokerId: graduationStatus.brokerId,
            })}
          </p>

          {dexData?.repoUrl && (
            <div className="bg-success/10 rounded-lg p-4 mb-6 text-left">
              <h3 className="font-medium flex items-center mb-2">
                <div className="i-mdi:check-circle text-success mr-2 h-5 w-5"></div>
                {t("graduationForm.yourDexIsReady")}
              </h3>
              <p className="text-sm text-gray-400 mb-3">
                {t("graduationForm.dexReadyDescription")}
              </p>
              <a
                href={generateDeploymentUrl(dexData.repoUrl)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-success hover:underline font-medium"
              >
                {t("graduationForm.viewYourLiveDex")}
              </a>
            </div>
          )}

          <div className="bg-light/5 rounded-lg p-5 mb-6 text-left">
            <h3 className="text-lg font-semibold mb-3 flex items-center">
              <div className="i-mdi:star text-warning mr-2 h-5 w-5"></div>
              {t("graduationForm.yourDexBenefits")}
            </h3>

            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="bg-success/20 p-1.5 rounded-full mt-0.5">
                  <div className="i-mdi:cash-multiple text-success h-4 w-4"></div>
                </div>
                <div>
                  <span className="font-medium">
                    {t("graduationForm.feeRevenueSharing")}
                  </span>
                  <p className="text-sm text-gray-400 mt-0.5">
                    {t("graduationForm.feeRevenueSharingDescription")}
                  </p>
                </div>
              </li>

              <li className="flex items-start gap-3">
                <div className="bg-warning/20 p-1.5 rounded-full mt-0.5">
                  <div className="i-mdi:cog text-warning h-4 w-4"></div>
                </div>
                <div>
                  <span className="font-medium">
                    {t("graduationForm.customFeeConfiguration")}
                  </span>
                  <p className="text-sm text-gray-400 mt-0.5">
                    {t("graduationForm.customFeeConfigurationDescription")}
                  </p>
                </div>
              </li>
            </ul>
          </div>

          {graduationStatus?.isMultisig && (
            <div className="bg-warning/10 rounded-lg p-5 mb-6 border border-warning/20 text-left">
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                <div className="i-mdi:wallet text-warning mr-2 h-5 w-5"></div>
                {t("graduationForm.multisigFeeWithdrawalTitle")}
              </h3>
              <p className="text-sm text-gray-300 mb-4">
                {t("graduationForm.multisigFeeWithdrawalDescription")}
              </p>
              <div className="bg-background-card rounded-lg p-4">
                <h4 className="font-medium mb-2 flex items-center">
                  <div className="i-mdi:shield-check text-primary mr-2 h-4 w-4"></div>
                  {t("graduationForm.howToWithdrawFees")}
                </h4>
                <ol className="text-sm text-gray-300 space-y-2 list-decimal list-inside">
                  <li>{t("graduationForm.withdrawStep1")}</li>
                  <li>{t("graduationForm.withdrawStep2")}</li>
                  <li>{t("graduationForm.withdrawStep3")}</li>
                  <li>{t("graduationForm.withdrawStep4")}</li>
                </ol>
                <div className="mt-3 p-3 bg-info/10 rounded-lg">
                  <div className="flex items-start gap-2">
                    <div className="i-mdi:information-outline text-info w-4 h-4 mt-0.5 flex-shrink-0"></div>
                    <div>
                      <p className="text-xs text-info font-medium mb-1">
                        {t("graduationForm.importantNote")}
                      </p>
                      <p className="text-xs text-gray-400">
                        {t("graduationForm.multisigWithdrawalsNote")}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  {multisigHasKey ? (
                    <Button
                      onClick={() =>
                        openModal("feeWithdrawal", {
                          brokerId: graduationStatus.brokerId,
                          multisigAddress: graduationStatus.multisigAddress!,
                          multisigChainId: graduationStatus.multisigChainId!,
                        })
                      }
                      variant="primary"
                      className="w-full"
                      disabled={
                        !graduationStatus.multisigAddress ||
                        !graduationStatus.multisigChainId
                      }
                    >
                      <span className="flex items-center justify-center w-full gap-2">
                        <div className="i-mdi:cash-multiple h-4 w-4"></div>
                        {t("graduationForm.withdrawFeesButton")}
                      </span>
                    </Button>
                  ) : (
                    <Button
                      onClick={() =>
                        openModal("orderlyKeyLogin", {
                          brokerId: graduationStatus.brokerId,
                          onSuccess: () => {
                            setMultisigHasKey(true);
                          },
                          onCancel: () => {},
                        })
                      }
                      variant="primary"
                      className="w-full"
                      disabled={!graduationStatus.multisigAddress}
                    >
                      <span className="flex items-center justify-center w-full gap-2">
                        <div className="i-mdi:key-plus h-4 w-4"></div>
                        {t("graduationForm.createOrderlyKeyButton")}
                      </span>
                    </Button>
                  )}

                  {(!graduationStatus.multisigAddress ||
                    !graduationStatus.multisigChainId) && (
                    <p className="text-xs text-warning text-center mt-2">
                      {t("graduationForm.unableToRetrieveMultisigConfig")}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          <SwapFeeWithdrawal isGraduated={graduationStatus.isGraduated} />

          {brokerTier && (
            <div className="bg-light/5 rounded-lg p-5 mb-6">
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                <div className="i-mdi:trophy text-warning mr-2 h-5 w-5"></div>
                {t("graduationForm.yourBrokerTier")}
              </h3>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-2xl font-bold text-primary-light">
                    {brokerTier.tier}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {t("graduationForm.currentTierLevel")}
                  </div>
                </div>
                <div className="bg-primary/20 p-3 rounded-full">
                  <div className="i-mdi:star text-primary w-8 h-8"></div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-background-card rounded-lg p-3">
                  <div className="text-xs text-gray-400 mb-1">
                    {t("graduationForm.stakingVolume")}
                  </div>
                  <div className="font-medium">
                    $
                    {new Intl.NumberFormat("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }).format(parseFloat(brokerTier.stakingVolume))}
                  </div>
                </div>
                <div className="bg-background-card rounded-lg p-3">
                  <div className="text-xs text-gray-400 mb-1">
                    {t("graduationForm.tradingVolume")}
                  </div>
                  <div className="font-medium">
                    $
                    {new Intl.NumberFormat("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }).format(parseFloat(brokerTier.tradingVolume))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-success/10 rounded-lg p-3">
                  <div className="text-xs text-gray-400 mb-1">
                    {t("graduationForm.orderlyMakerFee")}
                  </div>
                  <div className="font-medium text-success">
                    {new Intl.NumberFormat("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 4,
                    }).format(parseFloat(brokerTier.makerFeeRate) / 100)}
                    %
                  </div>
                </div>
                <div className="bg-info/10 rounded-lg p-3">
                  <div className="text-xs text-gray-400 mb-1">
                    {t("graduationForm.orderlyTakerFee")}
                  </div>
                  <div className="font-medium text-info">
                    {new Intl.NumberFormat("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 4,
                    }).format(parseFloat(brokerTier.takerFeeRate) / 100)}
                    %
                  </div>
                </div>
              </div>

              <div className="mt-4 text-xs text-gray-400">
                {t("graduationForm.lastUpdated")}:{" "}
                {new Date(brokerTier.logDate).toLocaleDateString()}
              </div>

              <div className="mt-4 pt-4 border-t border-light/10">
                <p className="text-xs text-gray-400">
                  <Trans
                    i18nKey={
                      "graduationForm.tierBenefitsDescription" as unknown as never
                    }
                    components={[
                      <span
                        key="0"
                        className="text-primary-light font-medium"
                      />,
                    ]}
                  />
                </p>
                <div className="mt-2 bg-warning/10 border border-warning/20 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <div className="i-mdi:information-outline text-warning w-4 h-4 mt-0.5 flex-shrink-0"></div>
                    <div>
                      <p className="text-xs text-warning font-medium mb-1">
                        {t("graduationForm.adminWalletStakingTitle")}
                      </p>
                      <p className="text-xs text-gray-400">
                        {graduationStatus?.isMultisig ? (
                          <Trans
                            i18nKey={
                              "graduationForm.adminWalletStakingDescriptionMultisig"
                            }
                            values={{
                              address: graduationStatus.multisigAddress
                                ? `${graduationStatus.multisigAddress.slice(0, 6)}...${graduationStatus.multisigAddress.slice(-4)}`
                                : "loading...",
                            }}
                            components={[
                              <span
                                key="0"
                                className="font-mono text-primary-light"
                              />,
                            ]}
                          />
                        ) : (
                          t("graduationForm.adminWalletStakingDescriptionEoa")
                        )}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-2 bg-info/10 border border-info/20 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <div className="i-mdi:clock-outline text-info w-4 h-4 mt-0.5 flex-shrink-0"></div>
                    <div>
                      <p className="text-xs text-info font-medium mb-1">
                        {t("graduationForm.dailyTierUpdatesTitle")}
                      </p>
                      <p className="text-xs text-gray-400">
                        {t("graduationForm.dailyTierUpdatesDescription")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <FeeConfigWithCalculator
            makerFee={makerFee}
            takerFee={takerFee}
            rwaMakerFee={rwaMakerFee}
            rwaTakerFee={rwaTakerFee}
            readOnly={false}
            defaultOpenCalculator={true}
            showSaveButton={true}
            useOrderlyApi={true}
            brokerId={graduationStatus?.brokerId}
            onFeesChange={(
              newMakerFee,
              newTakerFee,
              newRwaMakerFee,
              newRwaTakerFee
            ) => {
              setMakerFee(newMakerFee);
              setTakerFee(newTakerFee);
              setRwaMakerFee(newRwaMakerFee || 0);
              setRwaTakerFee(newRwaTakerFee || 5);
            }}
          />

          <BaseFeeExplanation />
        </div>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto slide-fade-in">
      <h2 className="text-xl font-bold mb-4">
        {t("graduationForm.graduateYourDex")}
      </h2>

      <div className="bg-light/5 rounded-lg p-4 mb-6">
        <h3 className="text-md font-medium mb-3">
          {t("graduationForm.whatIsDexGraduation")}
        </h3>
        <p className="text-gray-300 text-sm mb-3">
          {t("graduationForm.graduationIntro")}
        </p>
        <ul className="text-sm space-y-2 mb-3">
          <li className="flex items-start gap-2">
            <div className="i-mdi:cash-multiple text-success w-4 h-4 mt-0.5 flex-shrink-0"></div>
            <span>{t("graduationForm.graduationBenefitRevenue")}</span>
          </li>
          <li className="flex items-start gap-2">
            <div className="i-mdi:cog text-warning w-4 h-4 mt-0.5 flex-shrink-0"></div>
            <span>{t("graduationForm.graduationBenefitCustomFees")}</span>
          </li>
        </ul>
        <p className="text-gray-300 text-sm">
          <span className="font-medium">
            {t("graduationForm.whySendTokens")}
          </span>{" "}
          {t("graduationForm.graduationRequirementDescription")}
        </p>
      </div>

      <BaseFeeExplanation />

      <div className="mb-6">
        <div className="bg-light/5 rounded-xl p-4 mb-4">
          <h3 className="text-md font-medium mb-2 flex items-center">
            <div className="i-mdi:cog text-gray-400 w-5 h-5 mr-2"></div>
            {t("graduationForm.tradingFeeConfigurationTitle")}
          </h3>
          <p className="text-sm text-gray-300 mb-4">
            {t("graduationForm.tradingFeeConfigurationDescription")}
          </p>

          <FeeConfigWithCalculator
            makerFee={makerFee}
            takerFee={takerFee}
            rwaMakerFee={rwaMakerFee}
            rwaTakerFee={rwaTakerFee}
            readOnly={false}
            onFeesChange={(
              newMakerFee,
              newTakerFee,
              newRwaMakerFee,
              newRwaTakerFee
            ) => {
              setMakerFee(newMakerFee);
              setTakerFee(newTakerFee);
              setRwaMakerFee(newRwaMakerFee || 0);
              setRwaTakerFee(newRwaTakerFee || 5);
            }}
            defaultOpenCalculator={false}
            alwaysShowConfig={true}
            showSaveButton={false}
          />
        </div>
      </div>

      <div className="mb-6">
        <FormInput
          id="brokerId"
          label={t("graduationForm.brokerIdLabel")}
          type="text"
          value={brokerId}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setBrokerId(e.target.value)
          }
          placeholder={t("graduationForm.brokerIdPlaceholder")}
          required
          helpText={
            <>
              <span className="text-gray-400 mb-1 block">
                {t("graduationForm.brokerIdHelp1")}
              </span>
              <span className="text-gray-400 mt-1 block">
                {t("graduationForm.brokerIdHelp2")}
              </span>
            </>
          }
          validator={validateBrokerId(existingBrokerIds)}
          onError={error => setBrokerIdError(error)}
        />
        {!brokerIdError && brokerId && (
          <div className="mt-1 text-xs text-success flex items-center">
            <span className="i-mdi:check-circle mr-1"></span>
            {t("graduationForm.brokerIdAvailable")}
          </div>
        )}

        {feeOptions && (
          <div className="mb-6 mt-8">
            <p className="text-gray-300 mb-4">
              {t("graduationForm.choosePaymentMethod")}
            </p>

            {/* Payment Method Selection Button */}
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
                        src={
                          paymentType === "usdc"
                            ? "https://assets.coingecko.com/coins/images/6319/standard/usdc.png"
                            : "https://assets.coingecko.com/coins/images/38501/standard/Orderly_Network_Coingecko_200*200.png"
                        }
                        alt={paymentType === "usdc" ? "USDC" : "ORDER"}
                        className="w-6 h-6 rounded-full"
                        onError={e => {
                          const target = e.currentTarget as HTMLImageElement;
                          target.style.display = "none";
                          const nextElement =
                            target.nextElementSibling as HTMLElement;
                          if (nextElement) {
                            nextElement.style.display = "block";
                          }
                        }}
                      />
                      <span className="text-lg hidden">
                        {paymentType === "usdc" ? "💵" : "🪙"}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium">
                        {paymentType === "usdc" ? "USDC" : "ORDER"}
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
                            const nextElement =
                              target.nextElementSibling as HTMLElement;
                            if (nextElement) {
                              nextElement.style.display = "block";
                            }
                          }}
                        />
                        <div className="w-2 h-2 rounded-full bg-primary hidden"></div>
                        {SUPPORTED_CHAINS.find(c => c.id === preferredChain)
                          ?.name || preferredChain}
                      </div>
                      <div className="text-sm text-gray-400 mt-1">
                        {paymentType === "usdc" ? (
                          `$${feeOptions.usdc.amount.toLocaleString()} USDC`
                        ) : (
                          <div className="flex items-center gap-2">
                            <span>
                              {feeOptions.order.amount.toLocaleString()} ORDER{" "}
                              (~$
                              {(
                                feeOptions.order.amount *
                                feeOptions.order.currentPrice
                              ).toFixed(2)}
                              )
                            </span>
                            <div className="bg-warning/20 text-warning px-2 py-1 rounded-full text-xs font-medium">
                              {t("graduationForm.discount25Off")}
                            </div>
                          </div>
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
                    {t("graduationForm.yourBalance")}:{" "}
                    {parseFloat(tokenBalance.formatted).toFixed(2)}{" "}
                    {paymentType === "usdc" ? "USDC" : "ORDER"}
                  </div>
                )}
              </button>
            </div>

            <div className="bg-warning/10 border border-warning/20 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-3">
                <div className="i-mdi:alert-circle text-warning w-5 h-5 mt-0.5 flex-shrink-0"></div>
                <div>
                  <h4 className="text-warning font-medium text-sm mb-1">
                    {t("graduationForm.doNotSendTokensManuallyTitle")}
                  </h4>
                  <p className="text-xs text-gray-400">
                    {t("graduationForm.doNotSendTokensManuallyDescription")}
                  </p>
                </div>
              </div>
            </div>

            <p className="text-gray-300 text-sm">
              {t("graduationForm.autoTransferDescription")}
              {paymentType === "order" && (
                <a
                  href={getSwapUrl(preferredChain)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-1 text-primary-light hover:underline inline-flex items-center"
                >
                  {t("graduationForm.needOrderTokensCta")}
                  <span className="i-mdi:open-in-new w-3.5 h-3.5 ml-1"></span>
                </a>
              )}
            </p>
          </div>
        )}

        <div className="space-y-4 mt-6">
          <div className="border rounded-xl p-4 bg-primary/10 border-primary/20">
            <h3 className="text-md font-medium mb-2 flex items-center">
              <div className="w-5 h-5 mr-2 i-mdi:rocket-launch text-primary"></div>
              {t("graduationForm.sendTokensTitle", {
                token: paymentType === "usdc" ? "USDC" : "ORDER",
              })}
            </h3>
            <p className="text-sm text-gray-300 mb-4">
              {t("graduationForm.sendTokensDescription", {
                token: paymentType === "usdc" ? "USDC" : "ORDER",
              })}
            </p>

            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <div className="text-xs text-gray-400">
                  {t("graduationForm.usingToken")}
                </div>
                <div className="text-xs bg-info/20 text-info px-2 py-1 rounded-full flex items-center">
                  <div className="i-mdi:information-outline mr-1 w-3.5 h-3.5"></div>
                  <span>
                    {SUPPORTED_CHAINS.find(c => c.id === preferredChain)
                      ?.name || preferredChain}{" "}
                    {paymentType === "usdc" ? "USDC" : "ORDER"}
                  </span>
                </div>
              </div>

              {tokenBalance && (
                <div className="text-xs mb-3 flex items-center">
                  <span className="text-info">
                    {t("graduationForm.yourBalance")}:
                  </span>{" "}
                  <span className="font-medium ml-1">
                    {new Intl.NumberFormat("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }).format(parseFloat(tokenBalance?.formatted || "0"))}{" "}
                    {paymentType === "usdc" ? "USDC" : "ORDER"}
                  </span>
                  {feeOptions &&
                    parseFloat(tokenBalance?.formatted || "0") <
                      (paymentType === "usdc"
                        ? feeOptions.usdc.amount
                        : feeOptions.order.amount) && (
                      <div className="ml-2 text-warning flex items-center">
                        {t("graduationForm.insufficientForGraduation")}
                        {paymentType === "order" && (
                          <a
                            href={getSwapUrl(preferredChain)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-2 text-primary-light hover:underline inline-flex items-center"
                          >
                            {t("graduationForm.buyOrderCta")}
                            <span className="i-mdi:open-in-new w-3 h-3 ml-0.5"></span>
                          </a>
                        )}
                      </div>
                    )}
                </div>
              )}
            </div>

            {paymentType === "order" && (
              <div className="bg-warning/10 border border-warning/20 rounded-lg p-3 mb-4">
                <div className="flex items-center gap-2">
                  <div className="i-mdi:tag text-warning w-4 h-4"></div>
                  <span className="text-warning font-medium text-sm">
                    {t("graduationForm.saveWithOrderTitle")}
                  </span>
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {t("graduationForm.saveWithOrderDescription", {
                    usdcAmount: feeOptions?.usdc.amount.toLocaleString(),
                    orderAmount: feeOptions?.order.amount.toLocaleString(),
                    orderValue: (
                      (feeOptions?.order.amount || 0) *
                      (feeOptions?.order.currentPrice || 0)
                    ).toFixed(2),
                  })}
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 mb-4">
              <div className="text-sm">{t("graduationForm.amount")}:</div>
              <div className="font-medium flex items-center gap-2">
                {feeOptions ? (
                  paymentType === "usdc" ? (
                    `${feeOptions.usdc.amount.toLocaleString()} USDC`
                  ) : (
                    <>
                      {feeOptions.order.amount.toLocaleString()} ORDER
                      <div className="bg-warning/20 text-warning px-2 py-1 rounded-full text-xs font-medium">
                        {t("graduationForm.discount25Off")}
                      </div>
                    </>
                  )
                ) : (
                  t("graduationForm.loading")
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
                  ? t("graduationForm.confirmInWallet")
                  : isConfirming
                    ? t("graduationForm.confirming")
                    : t("graduationForm.verifyingTransactionLoading")
              }
              disabled={
                isCorrectChain &&
                (!!brokerIdError ||
                  !brokerId ||
                  !feeOptions ||
                  isLoading ||
                  (feeOptions && tokenBalance
                    ? parseFloat(tokenBalance?.formatted || "0") <
                      (paymentType === "usdc"
                        ? feeOptions.usdc.amount
                        : feeOptions.order.amount)
                    : false))
              }
              variant="primary"
              className="w-full justify-center"
            >
              {isCorrectChain
                ? !brokerId
                  ? t("graduationForm.enterBrokerIdToContinue")
                  : t("graduationForm.transferTokensCta", {
                      token: paymentType === "usdc" ? "USDC" : "ORDER",
                    })
                : t("graduationForm.switchChainCta")}
            </Button>

            {isConfirmed && hash && !result && (
              <div className="mt-3 bg-success/10 text-success text-sm p-2 rounded">
                <div className="flex items-center justify-between">
                  <span>{t("graduationForm.transferSuccessfulVerifying")}</span>
                  {getBlockExplorerUrl(hash, preferredChain) && (
                    <a
                      href={getBlockExplorerUrl(hash, preferredChain)!}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-light hover:text-primary text-xs flex items-center ml-2"
                    >
                      {t("graduationForm.viewOnExplorer")}
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
                ? t("graduationForm.hideManualOption")
                : t("graduationForm.showManualOption", {
                    token: paymentType === "usdc" ? "USDC" : "ORDER",
                  })}
            </button>
          </div>

          {/* Manual hash form - only show when toggled */}
          {showManualInput && (
            <div className="border rounded-xl p-4 bg-background-card border-base-contrast-12">
              <h3 className="text-md font-medium mb-2 flex items-center">
                <div className="w-5 h-5 mr-2 i-mdi:file-document text-base-contrast-12"></div>
                {t("graduationForm.manualVerificationTitle")}
              </h3>
              <p className="text-sm text-gray-300 mb-4">
                {t("graduationForm.manualVerificationDescription", {
                  token: paymentType === "usdc" ? "USDC" : "ORDER",
                })}
              </p>

              <div className="mb-4">
                <div className="flex justify-between items-center mb-1">
                  <p className="text-xs text-gray-400">
                    {t("graduationForm.recipientAddress")}:
                  </p>
                  <button
                    onClick={() =>
                      copyToClipboard(
                        feeOptions?.receiverAddress || "",
                        t("graduationForm.recipientAddress")
                      )
                    }
                    className="text-primary-light hover:text-primary text-xs flex items-center"
                  >
                    <div className="i-mdi:content-copy w-3 h-3 mr-1"></div>
                    {t("graduationForm.copy")}
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
                    {t("graduationForm.tokenAddressLabel", {
                      token: paymentType === "usdc" ? "USDC" : "ORDER",
                    })}
                    :
                  </p>
                  <a
                    href={getSwapUrl(preferredChain)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-light hover:text-primary text-xs flex items-center"
                  >
                    <div className="i-mdi:cart w-3 h-3 mr-1"></div>
                    {t("graduationForm.buyTokenCta", {
                      token: paymentType === "usdc" ? "USDC" : "ORDER",
                    })}
                  </a>
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
                      {t("graduationForm.transactionVerificationTitle")}
                    </h4>
                    <p className="text-xs text-gray-300">
                      {t("graduationForm.transactionVerificationDescription")}
                    </p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <FormInput
                  id="txHash"
                  label={t("graduationForm.transactionHash")}
                  type="text"
                  value={txHash}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setTxHash(e.target.value)
                  }
                  placeholder="0x..."
                  required
                  helpText={t("graduationForm.txHashHelpText", {
                    token: paymentType === "usdc" ? "USDC" : "ORDER",
                  })}
                />

                <Button
                  type="submit"
                  variant="secondary"
                  isLoading={isLoading}
                  loadingText={t("graduationForm.verifyingTransactionLoading")}
                  className="w-full justify-center"
                  disabled={!txHash || !!brokerIdError || !brokerId}
                >
                  {t("graduationForm.verifyTransactionButton")}
                </Button>

                {(!txHash || !!brokerIdError || !brokerId) && (
                  <div className="mt-2 text-xs text-gray-400 text-center">
                    {!brokerId && (
                      <span>{t("graduationForm.enterBrokerIdToContinue")}</span>
                    )}
                    {brokerId && brokerIdError && (
                      <span>{t("graduationForm.fixBrokerIdError")}</span>
                    )}
                    {brokerId && !brokerIdError && !txHash && (
                      <span>{t("graduationForm.enterTxHashToVerify")}</span>
                    )}
                  </div>
                )}
              </form>
            </div>
          )}
        </div>
      </div>

      {result && (
        <div
          className={`mt-4 p-4 rounded-lg ${result.success ? "bg-success/10" : "bg-error/10"}`}
        >
          <p className={result.success ? "text-success" : "text-error"}>
            {result.message}
          </p>
          {result.success && result.amount && (
            <p className="text-gray-300 text-sm mt-2">
              {t("graduationForm.verifiedTransfer", {
                amount: result.amount,
                token: paymentType === "usdc" ? "USDC" : "ORDER",
              })}
            </p>
          )}
        </div>
      )}
    </Card>
  );
}
