import { useMemo, useState, useEffect } from "react";
import { useAccount, useBalance, useSwitchChain, useChainId } from "wagmi";
import {
  ORDER_ADDRESSES,
  USDC_ADDRESSES,
  USDT_ADDRESSES,
  OrderTokenChainName,
  getChainIcon,
} from "../../../config";
import {
  getSupportedChains,
  getOrderTokenSupportedChains,
  getPreferredChain,
} from "../utils/config";
import { get } from "../utils/apiClient";
import { useAuth } from "../context/useAuth";
import { useTranslation } from "~/i18n";

interface TokenSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (
    chain: OrderTokenChainName,
    paymentType: "usdc" | "order" | "usdt"
  ) => void;
  currentChain: OrderTokenChainName;
  currentPaymentType: "usdc" | "order" | "usdt";
  /** When true, fetch the same graduation fee tier as SDK/custom DEX (matches GraduationPaymentSection). */
  useCustomGraduationFee?: boolean;
}

interface TokenOption {
  id: string;
  name: string;
  symbol: string;
  icon: string;
  chain: OrderTokenChainName;
  paymentType: "usdc" | "order" | "usdt";
  balance?: string;
  value?: string;
  graduationFee?: string;
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
    currency: string;
    stable: boolean;
  };
  usdt: {
    amount: number;
    currency: string;
    stable: boolean;
  };
  receiverAddress: string;
}

const TOKEN_CONFIG = [
  {
    paymentType: "usdc" as const,
    symbol: "USDC",
    icon: "https://assets.coingecko.com/coins/images/6319/standard/usdc.png",
    getAddresses: USDC_ADDRESSES,
    nameKey: "tokenSelectionModal.usdCoinOnChain",
    isStable: true,
  },
  {
    paymentType: "usdt" as const,
    symbol: "USDT",
    icon: "https://assets.coingecko.com/coins/images/325/standard/Tether.png",
    getAddresses: USDT_ADDRESSES,
    nameKey: "tokenSelectionModal.usdtOnChain",
    isStable: true,
  },
  {
    paymentType: "order" as const,
    symbol: "ORDER",
    icon: "https://assets.coingecko.com/coins/images/38501/standard/Orderly_Network_Coingecko_200*200.png",
    getAddresses: ORDER_ADDRESSES,
    nameKey: "tokenSelectionModal.orderTokenOnChain",
    isStable: false,
  },
];

export function TokenSelectionModal({
  isOpen,
  onClose,
  onSelect,
  currentChain,
  currentPaymentType,
  useCustomGraduationFee = false,
}: TokenSelectionModalProps) {
  const { t } = useTranslation();
  const { address } = useAccount();
  const { switchChain } = useSwitchChain();
  const connectedChainId = useChainId();
  const { token } = useAuth();
  const [orderTokenPrice, setOrderTokenPrice] = useState<number | null>(null);
  const [priceLoading, setPriceLoading] = useState(false);
  const [feeOptions, setFeeOptions] = useState<FeeOptionsResponse | null>(null);

  const SUPPORTED_CHAINS = getSupportedChains();
  const ORDER_TOKEN_CHAINS = getOrderTokenSupportedChains();

  useEffect(() => {
    const fetchOrderPrice = async () => {
      if (orderTokenPrice !== null) return;

      setPriceLoading(true);
      try {
        const response = await fetch(
          "https://api.coingecko.com/api/v3/simple/price?ids=orderly-network&vs_currencies=usd"
        );

        if (response.ok) {
          const data = await response.json();
          const price = data["orderly-network"]?.usd;
          if (price) {
            setOrderTokenPrice(price);
          }
        }
      } catch (error) {
        console.error("Failed to fetch ORDER token price:", error);
      } finally {
        setPriceLoading(false);
      }
    };

    fetchOrderPrice();
  }, [orderTokenPrice]);

  useEffect(() => {
    let cancelled = false;

    const fetchFeeOptions = async () => {
      if (!token) return;

      setFeeOptions(null);
      try {
        const qs = useCustomGraduationFee ? "?isCustom=true" : "";
        const response = await get<FeeOptionsResponse>(
          `api/graduation/fee-options${qs}`,
          token
        );
        if (!cancelled) setFeeOptions(response);
      } catch (error) {
        console.error("Failed to fetch fee options:", error);
        if (!cancelled) setFeeOptions(null);
      }
    };

    fetchFeeOptions();
    return () => {
      cancelled = true;
    };
  }, [token, useCustomGraduationFee]);

  const getChainName = (chain: OrderTokenChainName) => {
    const preferredChain = getPreferredChain(chain);
    return (
      SUPPORTED_CHAINS.find(c => c.id === preferredChain)?.name ||
      preferredChain
    );
  };

  const balanceQueries = useMemo(() => {
    const queries: Array<{
      chain: OrderTokenChainName;
      paymentType: "usdc" | "order" | "usdt";
      chainId: number;
      tokenAddress: string;
    }> = [];

    ORDER_TOKEN_CHAINS.forEach(chain => {
      const preferredChain = getPreferredChain(chain.id as OrderTokenChainName);
      const chainId =
        SUPPORTED_CHAINS.find(c => c.id === preferredChain)?.chainId || 1;

      TOKEN_CONFIG.forEach(cfg => {
        const tokenAddress =
          cfg.getAddresses[preferredChain as OrderTokenChainName];
        if (tokenAddress) {
          queries.push({
            chain: chain.id as OrderTokenChainName,
            paymentType: cfg.paymentType,
            chainId,
            tokenAddress,
          });
        }
      });
    });

    return queries;
  }, [ORDER_TOKEN_CHAINS, SUPPORTED_CHAINS]);

  const balances = balanceQueries.map(query =>
    useBalance({
      address,
      token: query.tokenAddress as `0x${string}`,
      chainId: query.chainId,
      query: {
        enabled: !!address && !!query.tokenAddress,
        retry: 3,
        staleTime: 60_000,
      },
    })
  );

  const getBalance = (
    chain: OrderTokenChainName,
    paymentType: "usdc" | "order" | "usdt"
  ) => {
    const index = balanceQueries.findIndex(
      q => q.chain === chain && q.paymentType === paymentType
    );
    if (index === -1) return null;
    return balances[index]?.data;
  };

  const tokenOptions: TokenOption[] = useMemo(() => {
    const options: TokenOption[] = [];

    ORDER_TOKEN_CHAINS.forEach(chain => {
      const preferredChain = getPreferredChain(chain.id as OrderTokenChainName);
      const chainName =
        SUPPORTED_CHAINS.find(c => c.id === preferredChain)?.name ||
        preferredChain;

      TOKEN_CONFIG.forEach(cfg => {
        const balance = getBalance(
          chain.id as OrderTokenChainName,
          cfg.paymentType
        );

        let valueFormatted: string;
        if (cfg.isStable) {
          const balanceValue = balance ? parseFloat(balance.formatted) : 0;
          valueFormatted = `$${balanceValue.toFixed(2)}`;
        } else {
          const balanceValue =
            balance && orderTokenPrice
              ? parseFloat(balance.formatted) * orderTokenPrice
              : 0;
          valueFormatted = priceLoading
            ? t("tokenSelectionModal.loading")
            : `$${balanceValue.toFixed(2)}`;
        }

        let graduationFee: string;
        if (feeOptions) {
          const option = feeOptions[cfg.paymentType];
          if (cfg.isStable) {
            graduationFee = `${option.amount.toLocaleString()} ${cfg.symbol}`;
          } else {
            graduationFee = `${option.amount.toLocaleString()} ${cfg.symbol}`;
          }
        } else {
          graduationFee = t("tokenSelectionModal.loading");
        }

        options.push({
          id: `${cfg.paymentType}-${chain.id}`,
          name: t(cfg.nameKey as any, { chainName }),
          symbol: cfg.symbol,
          icon: cfg.icon,
          chain: chain.id as OrderTokenChainName,
          paymentType: cfg.paymentType,
          balance: balance
            ? `${parseFloat(balance.formatted).toFixed(2)} ${cfg.symbol}`
            : `0 ${cfg.symbol}`,
          value: valueFormatted,
          graduationFee,
        });
      });
    });

    return options;
  }, [
    ORDER_TOKEN_CHAINS,
    SUPPORTED_CHAINS,
    balances,
    orderTokenPrice,
    priceLoading,
    feeOptions,
    t,
  ]);

  const handleTokenSelect = async (token: TokenOption) => {
    const preferredChain = getPreferredChain(token.chain);
    const targetChainId = SUPPORTED_CHAINS.find(
      c => c.id === preferredChain
    )?.chainId;

    if (targetChainId && targetChainId !== connectedChainId) {
      try {
        await switchChain({ chainId: targetChainId });
      } catch (error) {
        console.error("Failed to switch chain:", error);
      }
    }

    onSelect(token.chain, token.paymentType);
    onClose();
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
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-200 transition-colors"
          >
            <div className="i-mdi:arrow-left w-6 h-6"></div>
          </button>
          <h2 className="text-lg font-semibold text-white">
            {t("tokenSelectionModal.selectToken")}
          </h2>
          <div className="w-6"></div>
        </div>

        <div className="max-h-96 overflow-y-auto progress-tracker-scrollbar">
          {tokenOptions.map(token => (
            <button
              key={token.id}
              onClick={() => handleTokenSelect(token)}
              className={`w-full p-4 flex items-center justify-between hover:bg-light/5 transition-colors ${
                token.chain === currentChain &&
                token.paymentType === currentPaymentType
                  ? "bg-primary/5 border-l-2 border-primary"
                  : ""
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-background-card flex items-center justify-center overflow-hidden">
                  <img
                    src={token.icon}
                    alt={token.symbol}
                    className="w-8 h-8 rounded-full"
                  />
                </div>
                <div className="text-left">
                  <div className="text-white font-medium">{token.symbol}</div>
                  <div className="text-xs text-gray-400 flex items-center gap-1">
                    <img
                      src={getChainIcon(token.chain)}
                      alt={getChainName(token.chain)}
                      className="w-3 h-3 rounded-full"
                    />
                    <span>{getChainName(token.chain)}</span>
                    <span>•</span>
                    <span>{token.balance}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-white font-medium">{token.value}</div>
                <div className="text-sm text-gray-400">
                  {token.chain === currentChain &&
                    token.paymentType === currentPaymentType && (
                      <span className="text-primary">
                        {t("tokenSelectionModal.selected")}
                      </span>
                    )}
                </div>
                {token.graduationFee && (
                  <div className="text-xs text-gray-500 mt-1">
                    {t("tokenSelectionModal.graduation")}: {token.graduationFee}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
