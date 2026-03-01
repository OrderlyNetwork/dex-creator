import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "~/i18n";
import { useWalletClient, useChainId, useSwitchChain } from "wagmi";
import { formatUnits } from "viem";
import { BrowserProvider, ethers, JsonRpcProvider } from "ethers";
import { toast } from "react-toastify";
import { Button } from "./Button";
import {
  WOOFI_WIDGET_ROUTER_ADDRESS,
  SWAP_FEE_SUPPORTED_CHAINS,
  ALL_CHAINS,
  SwapFeeSupportedChainName,
} from "../../../config";
import WoofiWidgetRouterABI from "../../abi/WoofiWidgetRouter.json";
import { getEthPrice, getTokenInfo } from "../utils/tokenInfoCache";

interface SwapFeeWithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
  address: string;
}

interface TokenInfo {
  address: string;
  symbol: string;
  decimals: number;
  amount: bigint;
  priceUsd: number | null;
  logoUri: string | null;
  isNative: boolean;
}

interface ChainFeeData {
  chain: SwapFeeSupportedChainName;
  tokens: TokenInfo[];
  totalUsd: number;
  isLoading: boolean;
  error: string | null;
}

export function SwapFeeWithdrawalModal({
  isOpen,
  onClose,
  address,
}: SwapFeeWithdrawalModalProps) {
  const { t } = useTranslation();
  const { data: walletClient } = useWalletClient();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const [chainFeesData, setChainFeesData] = useState<
    Record<SwapFeeSupportedChainName, ChainFeeData>
  >({} as Record<SwapFeeSupportedChainName, ChainFeeData>);
  const [isClaimingOnChain, setIsClaimingOnChain] = useState<string | null>(
    null
  );

  const loadFeesForChain = useCallback(
    async (chainName: SwapFeeSupportedChainName) => {
      if (!address) return;

      const chainConfig = ALL_CHAINS[chainName];
      if (!chainConfig) return;

      setChainFeesData(prev => ({
        ...prev,
        [chainName]: {
          chain: chainName,
          tokens: [],
          totalUsd: 0,
          isLoading: true,
          error: null,
        },
      }));

      try {
        const provider = new JsonRpcProvider(chainConfig.rpcUrl);
        const contract = new ethers.Contract(
          WOOFI_WIDGET_ROUTER_ADDRESS,
          WoofiWidgetRouterABI,
          provider
        );

        const tokenCount =
          await contract.getBrokerClaimableTokensLength(address);

        if (tokenCount === 0n) {
          setChainFeesData(prev => ({
            ...prev,
            [chainName]: {
              chain: chainName,
              tokens: [],
              totalUsd: 0,
              isLoading: false,
              error: null,
            },
          }));
          return;
        }

        const tokenAddresses = await contract.getBrokerClaimableTokens(
          address,
          0,
          tokenCount
        );

        const ETH_PLACEHOLDER = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";

        const tokenInfoPromises = tokenAddresses.map(
          async (tokenAddress: string) => {
            const amount = await contract.brokerFees(address, tokenAddress);
            if (amount === 0n) return null;

            const isEth =
              tokenAddress.toLowerCase() === ETH_PLACEHOLDER.toLowerCase();

            if (isEth) {
              return {
                address: tokenAddress,
                symbol: "ETH",
                decimals: 18,
                amount,
                priceUsd: null,
                logoUri: null,
                isNative: true,
              };
            }

            const erc20Abi = [
              "function symbol() view returns (string)",
              "function decimals() view returns (uint8)",
            ];
            const tokenContract = new ethers.Contract(
              tokenAddress,
              erc20Abi,
              provider
            );

            const [symbol, decimals] = await Promise.all([
              tokenContract.symbol().catch(() => "UNKNOWN"),
              tokenContract.decimals().catch(() => 18),
            ]);

            return {
              address: tokenAddress,
              symbol,
              decimals: Number(decimals),
              amount,
              priceUsd: null,
              logoUri: null,
              isNative: false,
            };
          }
        );

        const tokenInfoResults = await Promise.all(tokenInfoPromises);
        const tokenInfos = tokenInfoResults.filter(
          (info): info is TokenInfo => info !== null
        );

        if (tokenInfos.length > 0) {
          try {
            const erc20Tokens = tokenInfos.filter(t => !t.isNative);
            const nativeTokens = tokenInfos.filter(t => t.isNative);

            if (nativeTokens.length > 0) {
              const ethPrice = await getEthPrice();
              if (ethPrice) {
                nativeTokens.forEach(token => {
                  token.priceUsd = ethPrice;
                  token.logoUri =
                    "https://assets.coingecko.com/coins/images/279/small/ethereum.png";
                });
              }
            }

            for (const token of erc20Tokens) {
              try {
                const tokenInfo = await getTokenInfo(chainName, token.address);

                if (tokenInfo) {
                  if (tokenInfo.price !== null) {
                    token.priceUsd = tokenInfo.price;
                  }
                  if (tokenInfo.logo) {
                    token.logoUri = tokenInfo.logo;
                  }
                }
              } catch (error) {
                console.error(
                  `Error fetching info for ${token.address}:`,
                  error
                );
              }
            }
          } catch (error) {
            console.error("Error fetching token prices:", error);
          }
        }

        const totalUsd = tokenInfos.reduce((sum, token) => {
          if (token.priceUsd) {
            const tokenAmount = parseFloat(
              formatUnits(token.amount, token.decimals)
            );
            return sum + tokenAmount * token.priceUsd;
          }
          return sum;
        }, 0);

        setChainFeesData(prev => ({
          ...prev,
          [chainName]: {
            chain: chainName,
            tokens: tokenInfos,
            totalUsd,
            isLoading: false,
            error: null,
          },
        }));
      } catch (error) {
        console.error(`Error loading fees for ${chainName}:`, error);
        setChainFeesData(prev => ({
          ...prev,
          [chainName]: {
            chain: chainName,
            tokens: [],
            totalUsd: 0,
            isLoading: false,
            error: t("swapFeeWithdrawalModal.failedToLoadFees"),
          },
        }));
      }
    },
    [address, t]
  );

  const handleClaimFees = async (chainName: SwapFeeSupportedChainName) => {
    if (!walletClient || !address) {
      toast.error(t("common.pleaseConnectYourWallet"));
      return;
    }

    const chainConfig = ALL_CHAINS[chainName];
    const chainData = chainFeesData[chainName];

    if (!chainData || chainData.tokens.length === 0) {
      toast.error(t("swapFeeWithdrawalModal.noFeesAvailableToClaim"));
      return;
    }

    if (chainId !== chainConfig.chainId) {
      try {
        await switchChain({ chainId: chainConfig.chainId });
        toast.info(
          t("swapFeeWithdrawalModal.switchedToChainPleaseClaimAgain", {
            chainName: chainConfig.name,
          })
        );
      } catch (error) {
        console.error("Failed to switch chain:", error);
        toast.error(
          t("swapFeeWithdrawalModal.pleaseSwitchToChainToClaim", {
            chainName: chainConfig.name,
          })
        );
      }
      return;
    }

    setIsClaimingOnChain(chainName);
    try {
      const provider = new BrowserProvider(walletClient);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        WOOFI_WIDGET_ROUTER_ADDRESS,
        WoofiWidgetRouterABI,
        signer
      );

      const tokenAddresses = chainData.tokens.map(t => t.address);
      const tx = await contract.claimBrokerFee(tokenAddresses);
      toast.info(t("swapFeeWithdrawalModal.transactionSubmittedWaiting"));

      await tx.wait();

      toast.success(
        t("swapFeeWithdrawalModal.swapFeesClaimedSuccessfully", {
          chainName: chainConfig.name,
        })
      );

      await loadFeesForChain(chainName);
    } catch (error) {
      console.error("Error claiming swap fees:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : t("swapFeeWithdrawalModal.failedToClaimSwapFees")
      );
    } finally {
      setIsClaimingOnChain(null);
    }
  };

  useEffect(() => {
    if (isOpen && address) {
      SWAP_FEE_SUPPORTED_CHAINS.forEach(chain => {
        loadFeesForChain(chain);
      });
    }
  }, [isOpen, address, loadFeesForChain]);

  if (!isOpen) return null;

  const currentChainConfig = Object.values(ALL_CHAINS).find(
    c => c.chainId === chainId
  );

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl mx-auto bg-background-light rounded-xl border border-light/10 shadow-2xl max-h-[90vh] overflow-hidden flex flex-col z-[101]"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-light/10">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <div className="i-mdi:swap-horizontal text-blue-400 h-6 w-6"></div>
            {t("swapFeeWithdrawalModal.swapFeeRevenue")}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-200 transition-colors"
          >
            <div className="i-mdi:close w-6 h-6"></div>
          </button>
        </div>

        <div className="p-4 overflow-y-auto flex-1">
          <div className="bg-info/10 rounded-lg p-3 mb-4">
            <div className="flex items-start gap-2">
              <div className="i-mdi:information-outline text-info w-4 h-4 mt-0.5 flex-shrink-0"></div>
              <div>
                <p className="text-xs text-info font-medium mb-1">
                  {t("swapFeeWithdrawalModal.multiChainSwapFees")}
                </p>
                <p className="text-xs text-gray-400">
                  {t("swapFeeWithdrawalModal.swapFeesTrackedPerChain")}
                </p>
              </div>
            </div>
          </div>

          {(() => {
            const allLoaded = SWAP_FEE_SUPPORTED_CHAINS.every(
              chain => chainFeesData[chain] && !chainFeesData[chain].isLoading
            );
            const totalAcrossChains = Object.values(chainFeesData).reduce(
              (sum, data) => sum + (data?.totalUsd || 0),
              0
            );
            const hasAnyFees = Object.values(chainFeesData).some(
              data => data?.tokens && data.tokens.length > 0
            );

            return (
              allLoaded &&
              hasAnyFees && (
                <div className="bg-success/10 rounded-lg p-4 mb-4 border border-success/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="i-mdi:cash-multiple text-success h-5 w-5"></div>
                      <span className="text-sm font-medium text-success">
                        {t("swapFeeWithdrawalModal.totalClaimable")}
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-success">
                      ${totalAcrossChains.toFixed(2)}
                    </div>
                  </div>
                </div>
              )
            );
          })()}

          <div className="space-y-4">
            {SWAP_FEE_SUPPORTED_CHAINS.map(chainName => {
              const chainConfig = ALL_CHAINS[chainName];
              const chainData = chainFeesData[chainName];
              const isOnThisChain = chainId === chainConfig.chainId;
              const hasFees =
                chainData && chainData.tokens && chainData.tokens.length > 0;

              return (
                <div
                  key={chainName}
                  className="bg-background-card rounded-lg p-4 border border-light/10"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="font-semibold text-white">
                        {chainConfig.name}
                      </div>
                      {isOnThisChain && (
                        <div className="bg-success/20 text-success text-xs px-2 py-0.5 rounded-full">
                          {t("swapFeeWithdrawalModal.connected")}
                        </div>
                      )}
                    </div>
                    {chainData && !chainData.isLoading && hasFees && (
                      <div className="text-sm font-medium text-success">
                        ${chainData.totalUsd.toFixed(2)}
                      </div>
                    )}
                  </div>

                  {chainData?.isLoading ? (
                    <div className="flex items-center justify-center py-4">
                      <div className="i-mdi:loading text-primary animate-spin mr-2 h-5 w-5"></div>
                      <span className="text-sm text-gray-400">
                        {t("swapFeeWithdrawalModal.loadingFees")}
                      </span>
                    </div>
                  ) : chainData?.error ? (
                    <div className="text-sm text-danger py-2">
                      {chainData.error}
                    </div>
                  ) : hasFees ? (
                    <>
                      <div className="space-y-2 mb-3">
                        {chainData.tokens.map(token => {
                          const tokenAmount = parseFloat(
                            formatUnits(token.amount, token.decimals)
                          );
                          const usdValue =
                            token.priceUsd !== null
                              ? tokenAmount * token.priceUsd
                              : null;
                          const explorerUrl = token.isNative
                            ? null
                            : `${chainConfig.blockExplorerUrl}/token/${token.address}`;

                          return (
                            <div
                              key={token.address}
                              className="flex items-center justify-between text-sm bg-background-dark/50 rounded p-3"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-background-light flex items-center justify-center overflow-hidden">
                                  {token.isNative ? (
                                    <img
                                      src="https://assets.coingecko.com/coins/images/279/small/ethereum.png"
                                      alt="ETH"
                                      className="w-full h-full"
                                    />
                                  ) : token.logoUri ? (
                                    <img
                                      src={token.logoUri}
                                      alt={token.symbol}
                                      className="w-full h-full"
                                    />
                                  ) : (
                                    <div className="i-mdi:coin text-warning h-5 w-5"></div>
                                  )}
                                </div>
                                <div>
                                  <div className="font-medium text-white">
                                    {token.symbol}
                                  </div>
                                  {token.isNative ? (
                                    <div className="text-xs text-gray-500">
                                      {t("swapFeeWithdrawalModal.nativeToken")}
                                    </div>
                                  ) : (
                                    <a
                                      href={explorerUrl || "#"}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="font-mono text-xs text-gray-500 hover:text-primary-light flex items-center gap-1 transition-colors"
                                    >
                                      {token.address.slice(0, 6)}...
                                      {token.address.slice(-4)}
                                      <div className="i-mdi:open-in-new w-3 h-3"></div>
                                    </a>
                                  )}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-medium">
                                  {tokenAmount.toFixed(6)} {token.symbol}
                                </div>
                                {usdValue !== null && (
                                  <div className="text-xs text-success">
                                    ${usdValue.toFixed(2)}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <Button
                        onClick={() => handleClaimFees(chainName)}
                        variant={isOnThisChain ? "primary" : "secondary"}
                        className="w-full"
                        isLoading={isClaimingOnChain === chainName}
                        loadingText={t("swapFeeWithdrawalModal.claiming")}
                      >
                        <span className="flex items-center justify-center gap-2">
                          {isOnThisChain ? (
                            <>
                              <div className="i-mdi:cash-multiple h-4 w-4"></div>
                              {t("swapFeeWithdrawalModal.claimFees")}
                              {chainData.totalUsd > 0 && (
                                <span className="text-xs opacity-80">
                                  (${chainData.totalUsd.toFixed(2)})
                                </span>
                              )}
                            </>
                          ) : (
                            <>
                              <div className="i-mdi:swap-horizontal h-4 w-4"></div>
                              {t("swapFeeWithdrawalModal.switchAndClaim")}
                              {chainData.totalUsd > 0 && (
                                <span className="text-xs opacity-80">
                                  (${chainData.totalUsd.toFixed(2)})
                                </span>
                              )}
                            </>
                          )}
                        </span>
                      </Button>
                    </>
                  ) : (
                    <div className="text-center py-3">
                      <div className="i-mdi:information-outline text-gray-500 h-6 w-6 mx-auto mb-1"></div>
                      <p className="text-xs text-gray-500">
                        {t(
                          "swapFeeWithdrawalModal.noFeesAvailableToClaimShort"
                        )}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {currentChainConfig &&
          !SWAP_FEE_SUPPORTED_CHAINS.includes(
            currentChainConfig.id as SwapFeeSupportedChainName
          ) && (
            <div className="p-4 border-t border-light/10 bg-warning/10">
              <div className="flex items-start gap-2">
                <div className="i-mdi:alert text-warning w-5 h-5 mt-0.5 flex-shrink-0"></div>
                <div>
                  <p className="text-xs text-warning font-medium mb-1">
                    {t("swapFeeWithdrawalModal.unsupportedNetwork")}
                  </p>
                  <p className="text-xs text-gray-400">
                    {t("swapFeeWithdrawalModal.unsupportedNetworkDesc", {
                      chainName: currentChainConfig.name,
                    })}
                  </p>
                </div>
              </div>
            </div>
          )}
      </div>
    </div>
  );
}
