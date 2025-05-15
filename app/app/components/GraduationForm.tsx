import {
  FormEvent,
  useState,
  useEffect,
  ChangeEvent,
  useCallback,
} from "react";
import FormInput from "./FormInput";
import { Button } from "./Button";
import { toast } from "react-toastify";
import { post, get } from "../utils/apiClient";
import { useAuth } from "../context/useAuth";
import { Card } from "./Card";
import {
  useBalance,
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
  useSwitchChain,
  useChainId,
} from "wagmi";
import { parseEther } from "viem";
import clsx from "clsx";
import {
  FeeConfigWithCalculator,
  MIN_MAKER_FEE,
  MIN_TAKER_FEE,
  MAX_FEE,
} from "./FeeConfigWithCalculator";
import { BaseFeeExplanation } from "./BaseFeeExplanation";

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

const SUPPORTED_CHAINS = [
  { id: "arbitrum", name: "Arbitrum", chainId: 42161 },
  { id: "ethereum", name: "Ethereum", chainId: 1 },
];

const REQUIRED_ORDER_AMOUNT = parseInt(
  import.meta.env.VITE_REQUIRED_ORDER_AMOUNT || "1000"
);

const DEFAULT_ETH_ORDER_ADDRESS = "0xABD4C63d2616A5201454168269031355f4764337";
const DEFAULT_ARB_ORDER_ADDRESS = "0x4E200fE2f3eFb977d5fd9c430A41531FB04d97B8";

const ORDER_TOKEN_ADDRESSES: Record<string, string> = {
  ethereum: import.meta.env.VITE_ETH_ORDER_ADDRESS || DEFAULT_ETH_ORDER_ADDRESS,
  arbitrum: import.meta.env.VITE_ARB_ORDER_ADDRESS || DEFAULT_ARB_ORDER_ADDRESS,
};

// Remove default receiver addresses - require environment variables
const ORDER_RECEIVER_ADDRESSES: Record<string, string> = {
  ethereum: import.meta.env.VITE_ETH_RECEIVER_ADDRESS || "",
  arbitrum: import.meta.env.VITE_ARB_RECEIVER_ADDRESS || "",
};

// Validate receiver addresses
const validateAddress = (address: string): boolean => {
  // Basic Ethereum address validation - checks if it's a 0x followed by 40 hex characters
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

// Check validity of receiver addresses
Object.entries(ORDER_RECEIVER_ADDRESSES).forEach(([chain, address]) => {
  if (!address) {
    console.log(`Missing receiver address for ${chain}`);
  } else if (!validateAddress(address)) {
    console.log(`Invalid receiver address format for ${chain}`);
  }
});

const getSwapUrl = (chainId: string) => {
  const tokenAddress = ORDER_TOKEN_ADDRESSES[chainId];
  return `https://swap.defillama.com/?chain=${chainId}&from=0x0000000000000000000000000000000000000000&tab=swap&to=${tokenAddress}`;
};

interface VerifyTxResponse {
  success: boolean;
  message: string;
  amount?: string;
  preferredBrokerId?: string;
  telegramGroupLink?: string;
  makerFee?: number;
  takerFee?: number;
}

interface GraduationStatusResponse {
  success: boolean;
  preferredBrokerId: string | null;
  currentBrokerId: string;
  approved: boolean;
  telegramGroupLink?: string;
}

interface FeeConfigResponse {
  success: boolean;
  makerFee: number;
  takerFee: number;
  canUpdate: boolean;
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

interface DexData {
  id: string;
  brokerName: string;
  brokerId: string;
  preferredBrokerId?: string | null;
  themeCSS?: string | null;
  primaryLogo?: string | null;
  secondaryLogo?: string | null;
  favicon?: string | null;
  telegramLink?: string | null;
  discordLink?: string | null;
  xLink?: string | null;
  walletConnectProjectId?: string | null;
  privyAppId?: string | null;
  privyTermsOfUse?: string | null;
  enabledMenus?: string | null;
  repoUrl?: string | null;
  customDomain?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface GraduationFormProps {
  onNoDexSetup?: () => void;
}

export function GraduationForm({ onNoDexSetup }: GraduationFormProps) {
  const { token } = useAuth();
  const { address } = useAccount();
  const [txHash, setTxHash] = useState("");
  const [chain, setChain] = useState<string>("arbitrum");
  const [preferredBrokerId, setPreferredBrokerId] = useState("");
  const [brokerIdError, setBrokerIdError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<VerifyTxResponse | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [showManualInput, setShowManualInput] = useState(false);
  const [existingBrokerIds, setExistingBrokerIds] = useState<string[]>([]);
  const [status, setStatus] = useState<GraduationStatusResponse | null>(null);

  const [dexData, setDexData] = useState<DexData | null>(null);
  const [deploymentUrl, setDeploymentUrl] = useState<string | null>(null);

  const [makerFee, setMakerFee] = useState<number>(3);
  const [takerFee, setTakerFee] = useState<number>(6);
  const [makerFeeError, setMakerFeeError] = useState<string | null>(null);
  const [takerFeeError, setTakerFeeError] = useState<string | null>(null);

  const currentReceiverAddress = ORDER_RECEIVER_ADDRESSES[chain];
  const currentTokenAddress = ORDER_TOKEN_ADDRESSES[chain];
  const currentChainId =
    SUPPORTED_CHAINS.find(c => c.id === chain)?.chainId || 1;

  const connectedChainId = useChainId();
  const isCorrectChain = connectedChainId === currentChainId;

  // Use the regular wagmi useSwitchChain hook
  const { switchChain } = useSwitchChain();

  // Handle chain selection change
  const handleChainChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const newChain = e.target.value;
    setChain(newChain);

    // Get the chain ID for the selected chain
    const chainId = SUPPORTED_CHAINS.find(c => c.id === newChain)?.chainId;

    // If we have a chain ID, prompt the user to switch
    if (chainId) {
      try {
        switchChain({ chainId });
      } catch (error) {
        console.error("Chain switch error:", error);
      }
    }
  };

  useEffect(() => {
    if (!token) return;

    async function fetchDexData() {
      try {
        const response = await get<DexData>("api/dex", token);
        if (response) {
          setDexData(response);

          if (response.repoUrl) {
            const repoName = response.repoUrl.split("/").pop();
            setDeploymentUrl(`https://dex.orderly.network/${repoName}/`);
          } else {
            setDeploymentUrl(null);
          }
        }
      } catch (error) {
        console.error("Failed to fetch DEX data", error);
      }
    }

    fetchDexData();
  }, [token]);

  const { data: tokenBalance } = useBalance({
    address,
    token: currentTokenAddress as `0x${string}`,
    chainId: currentChainId,
  });

  const { data: hash, isPending, writeContract } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
      confirmations: 1,
    });

  useEffect(() => {
    if (isConfirmed && hash) {
      setTxHash(hash);

      verifyTransaction(hash.toString());
    }
  }, [isConfirmed, hash]);

  useEffect(() => {
    async function fetchExistingBrokerIds() {
      try {
        const response = await fetch(
          "https://api.orderly.org/v1/public/broker/name"
        );
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
    if (!preferredBrokerId) {
      setBrokerIdError(null);
      return;
    }

    const isValidFormat = /^[a-z0-9_-]+$/.test(preferredBrokerId);
    if (!isValidFormat) {
      setBrokerIdError(
        "Broker ID must contain only lowercase letters, numbers, hyphens, and underscores"
      );
      return;
    }

    if (existingBrokerIds.includes(preferredBrokerId)) {
      setBrokerIdError(
        "This broker ID is already taken. Please choose another one."
      );
      return;
    }

    setBrokerIdError(null);
  }, [preferredBrokerId, existingBrokerIds]);

  const loadFeeConfiguration = useCallback(async () => {
    try {
      const feeResponse = await get<FeeConfigResponse>(
        "api/graduation/fees",
        token
      );

      if (feeResponse.success) {
        setMakerFee(feeResponse.makerFee);
        setTakerFee(feeResponse.takerFee);
      }
    } catch (error) {
      console.error("Error loading fee configuration:", error);
    }
  }, [token, setMakerFee, setTakerFee]);

  useEffect(() => {
    async function loadStatus() {
      try {
        const response = await get<GraduationStatusResponse>(
          "api/graduation/status",
          token,
          { showToastOnError: false }
        );

        setStatus(response);

        if (response.preferredBrokerId || response.approved) {
          await loadFeeConfiguration();
        }
      } catch (error) {
        console.error("Error loading graduation status:", error);

        // Make sure status is null, not undefined
        setStatus(null);

        // Check if this is a 400 error (no DEX setup)
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
  }, [token, hasSubmitted, loadFeeConfiguration, onNoDexSetup]);

  // Handle fee changes
  const handleMakerFeeChange = (value: number) => {
    setMakerFee(value);
    validateMakerFee(value);
  };

  const handleTakerFeeChange = (value: number) => {
    setTakerFee(value);
    validateTakerFee(value);
  };

  // Validate maker fee
  const validateMakerFee = (value: number): boolean => {
    if (isNaN(value)) {
      setMakerFeeError("Please enter a valid number");
      return false;
    }

    if (value < MIN_MAKER_FEE) {
      setMakerFeeError(`Maker fee must be at least ${MIN_MAKER_FEE} bps`);
      return false;
    }

    if (value > MAX_FEE) {
      setMakerFeeError(`Maker fee cannot exceed ${MAX_FEE} bps`);
      return false;
    }

    setMakerFeeError(null);
    return true;
  };

  // Validate taker fee
  const validateTakerFee = (value: number): boolean => {
    if (isNaN(value)) {
      setTakerFeeError("Please enter a valid number");
      return false;
    }

    if (value < MIN_TAKER_FEE) {
      setTakerFeeError(`Taker fee must be at least ${MIN_TAKER_FEE} bps`);
      return false;
    }

    if (value > MAX_FEE) {
      setTakerFeeError(`Taker fee cannot exceed ${MAX_FEE} bps`);
      return false;
    }

    setTakerFeeError(null);
    return true;
  };

  // Check if the fee configuration is valid
  const isValidFeeConfiguration = (): boolean => {
    const isMakerValid = validateMakerFee(makerFee);
    const isTakerValid = validateTakerFee(takerFee);

    return isMakerValid && isTakerValid;
  };

  const handleTransferOrder = async () => {
    if (!isCorrectChain) {
      await switchChain({ chainId: currentChainId });
      return;
    }

    if (brokerIdError) {
      toast.error(brokerIdError);
      return;
    }

    if (!preferredBrokerId) {
      toast.error("Please enter a preferred broker ID");
      return;
    }

    if (!isValidFeeConfiguration()) {
      return;
    }

    try {
      // Log token transfer attempt
      console.log(`Initiating ORDER token transfer on ${chain}`);

      // Check if addresses are valid
      if (!currentTokenAddress) {
        console.log(`Missing ORDER token address for ${chain}`);
        toast.error("Missing token address configuration");
        return;
      }

      if (!currentReceiverAddress) {
        console.log(`Missing receiver address for ${chain}`);
        toast.error("Missing receiver address configuration");
        return;
      }

      if (!validateAddress(currentReceiverAddress)) {
        console.log(`Invalid receiver address format for ${chain}`);
        toast.error("Invalid receiver address configuration");
        return;
      }

      const amount = parseEther(REQUIRED_ORDER_AMOUNT.toString());

      console.log({
        address: currentTokenAddress as `0x${string}`,
        functionName: "transfer",
        args: [currentReceiverAddress, amount],
        chainId: currentChainId,
      });
      writeContract({
        abi: ERC20_ABI,
        address: currentTokenAddress as `0x${string}`,
        functionName: "transfer",
        args: [currentReceiverAddress, amount],
        chainId: currentChainId,
      });
    } catch (error) {
      console.log("ORDER token transfer error:", error);

      // More detailed error message
      let errorMessage = "Failed to initiate transfer";
      if (error instanceof Error) {
        errorMessage = `Failed to initiate transfer: ${error.message}`;
      }

      toast.error(errorMessage);
    }
  };

  const verifyTransaction = async (transactionHash: string) => {
    setResult(null);
    setIsLoading(true);

    try {
      if (!isValidFeeConfiguration()) {
        setIsLoading(false);
        return;
      }

      const response = await post<VerifyTxResponse>(
        "api/graduation/verify-tx",
        {
          txHash: transactionHash,
          chain,
          preferredBrokerId,
          makerFee,
          takerFee,
        },
        token,
        { showToastOnError: false }
      );

      setResult(response);
      setHasSubmitted(true);

      if (response.success) {
        toast.success("Transaction verified successfully!");
        // Update local state with the returned fee values if they exist
        if (response.makerFee !== undefined) {
          setMakerFee(response.makerFee);
        }
        if (response.takerFee !== undefined) {
          setTakerFee(response.takerFee);
        }
      } else {
        toast.error(response.message || "Verification failed");
      }
    } catch (error) {
      console.log("Transaction verification error:", error);

      let errorMessage = "Verification failed";

      if (error instanceof Error) {
        errorMessage = error.message;
        setResult({ success: false, message: error.message });
      } else {
        setResult({ success: false, message: "Unknown error occurred" });
      }

      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Add the handleSubmit function back
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (brokerIdError) {
      toast.error(brokerIdError);
      return;
    }

    await verifyTransaction(txHash);
  };

  if (status?.approved) {
    return (
      <Card className="w-full max-w-lg mx-auto slide-fade-in">
        <div className="text-center">
          <div className="i-mdi:check-circle text-6xl text-success mx-auto mb-2"></div>
          <div className="bg-success/10 rounded-full text-success px-4 py-2 inline-block text-sm font-medium mb-4">
            Approved and Ready!
          </div>
          <h2 className="text-2xl font-bold">Congratulations!</h2>
          <p className="text-gray-300 mt-2 mb-6">
            Your DEX has successfully graduated to the revenue-sharing tier.
            Your custom broker ID{" "}
            <span className="font-mono bg-background-card px-2 py-1 rounded text-primary-light">
              {status.currentBrokerId}
            </span>{" "}
            has been approved.
          </p>

          {status.telegramGroupLink && (
            <div className="mt-6 mb-6 border border-info/20 rounded-lg p-4 bg-info/5">
              <h4 className="text-md font-medium mb-2 flex items-center">
                <div className="i-mdi:telegram text-info w-5 h-5 mr-2"></div>
                Join the Orderly Community
              </h4>
              <p className="text-gray-300 text-sm mb-3 text-left">
                Connect with other DEX builders and get support from the Orderly
                team in our community Telegram group.
              </p>
              <a
                href={status.telegramGroupLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-info/20 hover:bg-info/30 transition-colors text-info rounded-lg py-3 px-4 w-full"
              >
                <div className="i-mdi:telegram w-5 h-5"></div>
                Join Telegram Community
              </a>
            </div>
          )}

          <div className="bg-light/5 rounded-lg p-5 mb-6 text-left">
            <h3 className="text-lg font-semibold mb-3 flex items-center">
              <div className="i-mdi:star text-warning mr-2 h-5 w-5"></div>
              Your DEX Benefits
            </h3>

            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="bg-success/20 p-1.5 rounded-full mt-0.5">
                  <div className="i-mdi:cash-multiple text-success h-4 w-4"></div>
                </div>
                <div>
                  <span className="font-medium">Fee Revenue Sharing</span>
                  <p className="text-sm text-gray-400 mt-0.5">
                    You now earn a percentage of all trading fees generated
                    through your DEX.
                  </p>
                </div>
              </li>

              <li className="flex items-start gap-3">
                <div className="bg-primary/20 p-1.5 rounded-full mt-0.5">
                  <div className="i-mdi:gift text-primary-light h-4 w-4"></div>
                </div>
                <div>
                  <span className="font-medium">Trader Rewards</span>
                  <p className="text-sm text-gray-400 mt-0.5">
                    Your traders are now eligible to receive ORDER token rewards
                    based on their trading volume.
                  </p>
                </div>
              </li>

              <li className="flex items-start gap-3">
                <div className="bg-warning/20 p-1.5 rounded-full mt-0.5">
                  <div className="i-mdi:cog text-warning h-4 w-4"></div>
                </div>
                <div>
                  <span className="font-medium">Custom Fee Configuration</span>
                  <p className="text-sm text-gray-400 mt-0.5">
                    You can now customize your maker and taker fees to optimize
                    for your trading community.
                  </p>
                </div>
              </li>
            </ul>
          </div>

          {/* Base Fee Explanation */}
          <BaseFeeExplanation />

          {/* Current Fee Settings - Read Only */}
          <FeeConfigWithCalculator
            makerFee={makerFee}
            takerFee={takerFee}
            readOnly={true}
            defaultOpenCalculator={true}
          />
        </div>
      </Card>
    );
  }

  // If user has already submitted but not approved yet
  if (status?.preferredBrokerId) {
    return (
      <Card className="w-full max-w-lg mx-auto slide-fade-in">
        <div className="text-center">
          <div className="i-mdi:clock text-5xl text-warning mx-auto mb-2"></div>
          <div className="bg-warning/10 rounded-full text-warning px-4 py-2 inline-block text-sm font-medium mb-4">
            Awaiting Admin Approval
          </div>
          <h2 className="text-2xl font-bold">Almost There!</h2>
          <p className="text-gray-300 mt-2 mb-6">
            Your request for broker ID{" "}
            <span className="font-mono bg-background-card px-2 py-1 rounded text-primary-light">
              {status.preferredBrokerId}
            </span>{" "}
            is pending admin approval.
          </p>

          <div className="bg-light/5 rounded-lg p-5 mb-6 text-left">
            <h3 className="text-lg font-semibold mb-3 flex items-center">
              <div className="i-mdi:clock text-warning mr-2 h-5 w-5"></div>
              What's Happening
            </h3>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="bg-warning/20 p-1.5 rounded-full mt-0.5">
                  <div className="i-mdi:check-decagram text-warning h-4 w-4"></div>
                </div>
                <div>
                  <span className="font-medium">Verification Complete</span>
                  <p className="text-sm text-gray-400 mt-0.5">
                    You've successfully sent ORDER tokens and requested your
                    broker ID.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-primary/20 p-1.5 rounded-full mt-0.5">
                  <div className="i-mdi:clock-outline text-primary-light h-4 w-4"></div>
                </div>
                <div>
                  <span className="font-medium">Admin Review in Progress</span>
                  <p className="text-sm text-gray-400 mt-0.5">
                    Our team is reviewing your information and will approve your
                    broker ID shortly.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-success/20 p-1.5 rounded-full mt-0.5 opacity-50">
                  <div className="i-mdi:rocket-launch text-success h-4 w-4"></div>
                </div>
                <div className="opacity-60">
                  <span className="font-medium">
                    Coming Soon: Fee Sharing Benefits
                  </span>
                  <p className="text-sm text-gray-400 mt-0.5">
                    Once approved, you'll earn a percentage of all trading fees
                    and your traders will receive rewards. Your fee share will
                    be accessible by{" "}
                    <a
                      href={
                        dexData?.customDomain
                          ? `https://${dexData.customDomain}`
                          : deploymentUrl || "#"
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-light hover:underline inline-flex items-center"
                    >
                      logging into your DEX
                      <div className="i-mdi:open-in-new w-3.5 h-3.5 ml-1"></div>
                    </a>{" "}
                    with your admin wallet.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-info/10 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-2 text-sm">
              <div className="i-mdi:information-outline text-info w-5 h-5 flex-shrink-0 mt-0.5"></div>
              <p className="text-left">
                <span className="font-medium text-info">While you wait:</span>{" "}
                You can configure your DEX fees now. These settings will be
                applied once your broker ID is approved.
              </p>
            </div>
          </div>

          {status.telegramGroupLink && (
            <div className="mt-6 mb-6 border border-info/20 rounded-lg p-4 bg-info/5">
              <h4 className="text-md font-medium mb-2 flex items-center">
                <div className="i-mdi:telegram text-info w-5 h-5 mr-2"></div>
                Join the Orderly Community
              </h4>
              <p className="text-gray-300 text-sm mb-3 text-left">
                You've been invited to join the Orderly Network community on
                Telegram. Connect with other DEX builders and get support from
                the Orderly team.
              </p>
              <a
                href={status.telegramGroupLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-info/20 hover:bg-info/30 transition-colors text-info rounded-lg py-3 px-4 w-full"
              >
                <div className="i-mdi:telegram w-5 h-5"></div>
                Join Telegram Community
              </a>
            </div>
          )}
        </div>

        {/* Base Fee Explanation */}
        <BaseFeeExplanation />

        {/* Fee Configuration Section */}
        <FeeConfigWithCalculator
          makerFee={makerFee}
          takerFee={takerFee}
          readOnly={true}
          defaultOpenCalculator={true}
        />
      </Card>
    );
  }

  // Default form UI for initial submission
  return (
    <Card className="w-full max-w-lg mx-auto slide-fade-in">
      <h2 className="text-xl font-bold mb-4">Upgrade Your DEX</h2>

      <div className="bg-light/5 rounded-lg p-4 mb-6">
        <h3 className="text-md font-medium mb-3">What is DEX Graduation?</h3>
        <p className="text-gray-300 text-sm mb-3">
          Graduating your DEX enables revenue sharing and additional features:
        </p>
        <ul className="text-sm space-y-2 mb-3">
          <li className="flex items-start gap-2">
            <div className="i-mdi:cash-multiple text-success w-4 h-4 mt-0.5 flex-shrink-0"></div>
            <span>
              You'll earn a percentage of all trading fees generated through
              your DEX
            </span>
          </li>
          <li className="flex items-start gap-2">
            <div className="i-mdi:gift text-primary-light w-4 h-4 mt-0.5 flex-shrink-0"></div>
            <span>
              Your traders will receive ORDER token rewards based on trading
              volume
            </span>
          </li>
          <li className="flex items-start gap-2">
            <div className="i-mdi:cog text-warning w-4 h-4 mt-0.5 flex-shrink-0"></div>
            <span>
              You can customize trading fees to optimize for your community
            </span>
          </li>
        </ul>
        <p className="text-gray-300 text-sm">
          <span className="font-medium">
            Why {REQUIRED_ORDER_AMOUNT} ORDER tokens?
          </span>{" "}
          This requirement ensures DEX creators are committed to the Orderly
          ecosystem and helps maintain quality standards.
        </p>
      </div>

      <p className="text-gray-300 mb-4">
        To graduate your DEX to the next tier, please send at least{" "}
        {REQUIRED_ORDER_AMOUNT.toLocaleString()} ORDER tokens to the address
        below and submit the transaction hash.
        <a
          href={getSwapUrl(chain)}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-1 text-primary-light hover:underline inline-flex items-center"
        >
          Need ORDER tokens? Buy here
          <div className="i-mdi:open-in-new w-3.5 h-3.5 ml-1"></div>
        </a>
      </p>

      {/* Base Fee Explanation - Add here */}
      <BaseFeeExplanation />

      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-4">1. Configure Fees</h3>
        <div className="rounded-lg overflow-hidden">
          <FeeConfigWithCalculator
            makerFee={makerFee}
            takerFee={takerFee}
            readOnly={false}
            defaultOpenCalculator={false}
            onMakerFeeChange={handleMakerFeeChange}
            onTakerFeeChange={handleTakerFeeChange}
            makerFeeError={makerFeeError}
            takerFeeError={takerFeeError}
          />
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-4">2. Transfer ORDER Tokens</h3>
        <div className="bg-light/5 rounded-lg p-4">
          <div className="mb-4">
            <label htmlFor="chain" className="block text-sm font-medium mb-1">
              Blockchain
            </label>
            <div className="text-xs text-gray-400 mb-2">
              Select which blockchain you'll use to send ORDER tokens. This
              doesn't affect where your DEX will operate, as Orderly is an
              omnichain infrastructure. The ORDER token requirement is simply a
              commitment fee.
            </div>
            <select
              id="chain"
              value={chain}
              onChange={handleChainChange}
              className="w-full px-3 py-2 bg-background-card border border-light/10 rounded-lg"
              required
            >
              {SUPPORTED_CHAINS.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <FormInput
            id="preferredBrokerId"
            label="Preferred Broker ID"
            type="text"
            value={preferredBrokerId}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setPreferredBrokerId(e.target.value)
            }
            placeholder="my-broker-id"
            required
            helpText={
              <>
                <div className="text-gray-400 mb-1">
                  Your preferred unique broker ID (lowercase letters, numbers,
                  hyphens, and underscores only)
                </div>
                <div className="text-gray-400 mt-1">
                  This ID uniquely identifies your DEX in the Orderly ecosystem
                  and will be used for revenue tracking and user rewards.
                </div>
              </>
            }
            validator={value => {
              if (!new RegExp("^[a-z0-9_-]+$").test(value)) {
                return "Broker ID must contain only lowercase letters, numbers, hyphens, and underscores";
              }
              if (existingBrokerIds.includes(value)) {
                return "This broker ID is already taken. Please choose another one.";
              }
              return null;
            }}
            onError={error => setBrokerIdError(error)}
          />
          {!brokerIdError && preferredBrokerId && (
            <div className="mt-1 text-xs text-success flex items-center">
              <span className="i-mdi:check-circle mr-1"></span>
              Broker ID is available
            </div>
          )}

          <div className="space-y-4 mt-6">
            {/* Direct transfer button */}
            <div className="bg-primary/10 border border-primary/20 rounded-xl p-4">
              <h3 className="text-md font-medium mb-2 flex items-center">
                <div className="i-mdi:rocket-launch text-primary w-5 h-5 mr-2"></div>
                Option 1: One-Click Transfer
              </h3>
              <p className="text-sm text-gray-300 mb-4">
                Send ORDER tokens and verify in one step directly from your
                wallet.
              </p>

              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <div className="text-xs text-gray-400">Using token:</div>
                  <div className="text-xs bg-info/20 text-info px-2 py-1 rounded-full flex items-center">
                    <div className="i-mdi:information-outline mr-1 w-3.5 h-3.5"></div>
                    <span>
                      {chain === "ethereum" ? "Ethereum" : "Arbitrum"} ORDER
                    </span>
                  </div>
                </div>

                {tokenBalance && (
                  <div className="text-xs mb-3 flex items-center">
                    <span className="text-info">Your balance:</span>{" "}
                    <span className="font-medium ml-1">
                      {parseFloat(tokenBalance?.formatted || "0").toFixed(2)}{" "}
                      ORDER
                    </span>
                    {parseFloat(tokenBalance?.formatted || "0") <
                      REQUIRED_ORDER_AMOUNT && (
                      <div className="ml-2 text-warning flex items-center">
                        (Insufficient for graduation)
                        <a
                          href={getSwapUrl(chain)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-2 text-primary-light hover:underline inline-flex items-center"
                        >
                          Buy ORDER
                          <div className="i-mdi:open-in-new w-3 h-3 ml-0.5"></div>
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 mb-4">
                <div className="text-sm">Amount:</div>
                <div className="font-medium">
                  {REQUIRED_ORDER_AMOUNT.toLocaleString()} ORDER
                </div>
              </div>

              <Button
                onClick={handleTransferOrder}
                isLoading={isPending || isConfirming}
                loadingText={
                  isPending ? "Confirm in wallet..." : "Confirming..."
                }
                disabled={
                  !!brokerIdError ||
                  !preferredBrokerId ||
                  (tokenBalance
                    ? parseFloat(tokenBalance?.formatted || "0") <
                      REQUIRED_ORDER_AMOUNT
                    : false)
                }
                variant="primary"
                className="w-full"
              >
                {isPending || isConfirming
                  ? isPending
                    ? "Confirm in wallet..."
                    : "Confirming..."
                  : isCorrectChain
                    ? "Transfer ORDER Tokens"
                    : "Switch Chain"}
              </Button>

              {isConfirmed && hash && (
                <div className="mt-3 bg-success/10 text-success text-sm p-2 rounded">
                  Transfer successful! Verifying transaction...
                </div>
              )}
            </div>

            {/* Toggle for manual hash input */}
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
                  ? "Hide manual option"
                  : "I already sent ORDER tokens"}
              </button>
            </div>

            {/* Manual hash form - only show when toggled */}
            {showManualInput && (
              <div className="bg-light/5 border border-light/10 rounded-xl p-4 slide-fade-in">
                <h3 className="text-md font-medium mb-2 flex items-center">
                  <div className="i-mdi:file-document-outline text-gray-300 w-5 h-5 mr-2"></div>
                  Option 2: Enter Transaction Hash
                </h3>
                <p className="text-sm text-gray-300 mb-4">
                  If you've already sent ORDER tokens, enter the transaction
                  hash below.
                </p>

                <div className="bg-background-dark/50 rounded p-3 mb-4">
                  {/* Receiver address section */}
                  <div className="mb-2">
                    <div className="flex justify-between items-center mb-1">
                      <p className="text-xs text-gray-400">
                        Send ORDER tokens to:
                      </p>
                      <button
                        type="button"
                        className="text-primary-light hover:text-primary text-xs flex items-center"
                        onClick={() => {
                          navigator.clipboard.writeText(currentReceiverAddress);
                          toast.success("Address copied to clipboard");
                        }}
                      >
                        <div className="i-mdi:clipboard-outline w-3 h-3 mr-1"></div>
                        Copy
                      </button>
                    </div>
                    <div className="bg-background-dark/70 p-2 rounded overflow-hidden">
                      <code className="text-xs font-mono break-all w-full block">
                        {currentReceiverAddress}
                      </code>
                    </div>
                  </div>

                  {/* ORDER token address section */}
                  <div className="mt-3">
                    <div className="flex justify-between items-center mb-1">
                      <p className="text-xs text-gray-400">
                        ORDER Token Address:
                      </p>
                      <a
                        href={getSwapUrl(chain)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-light hover:text-primary text-xs flex items-center"
                      >
                        <div className="i-mdi:cart w-3 h-3 mr-1"></div>
                        Buy ORDER
                      </a>
                    </div>
                    <div className="bg-background-dark/70 p-2 rounded overflow-hidden">
                      <code className="text-xs font-mono break-all w-full block">
                        {currentTokenAddress}
                      </code>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <FormInput
                    id="txHash"
                    label="Transaction Hash"
                    type="text"
                    value={txHash}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setTxHash(e.target.value)
                    }
                    placeholder="0x..."
                    required
                    helpText="The transaction hash of your ORDER token transfer"
                  />

                  <Button
                    type="submit"
                    variant="secondary"
                    isLoading={isLoading}
                    loadingText="Verifying..."
                    className="w-full"
                    disabled={!txHash || !!brokerIdError || !preferredBrokerId}
                  >
                    Verify Transaction
                  </Button>
                </form>
              </div>
            )}
          </div>
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
              Verified transfer of {result.amount} ORDER tokens
            </p>
          )}
        </div>
      )}
    </Card>
  );
}
