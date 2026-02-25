import { useEffect, useState } from "react";
import { useTranslation, Trans } from "~/i18n";
import { useAccount, useSwitchChain, useChainId } from "wagmi";
import { keccak256, encodePacked } from "viem";
import { Button } from "./Button";
import {
  getChainById,
  ENVIRONMENT_CONFIGS,
  type ChainId,
  getChainIcon,
  ALL_CHAINS,
} from "../../../config";
import { getCurrentEnvironment } from "../utils/config";

interface SafeInstructionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  brokerId: string;
  chainId: ChainId;
}

type TabValue = "safe" | "transaction" | "review-confirm" | "txhash";

const SAFE_SUPPORTED_CHAINS = {
  mainnet: [1, 42161, 8453],
  testnet: [11155111, 421614, 84532],
};

export default function SafeInstructionsModal({
  isOpen,
  onClose,
  brokerId,
  chainId: initialChainId,
}: SafeInstructionsModalProps) {
  const [abi, setAbi] = useState<string>();
  const [activeTab, setActiveTab] = useState<TabValue>("safe");
  const [copiedItem, setCopiedItem] = useState<string | null>(null);
  const [selectedChainId, setSelectedChainId] =
    useState<ChainId>(initialChainId);
  const [isSwitchingChain, setIsSwitchingChain] = useState(false);
  const { t } = useTranslation();
  const { address } = useAccount();
  const connectedChainId = useChainId();
  const { switchChain } = useSwitchChain();

  useEffect(() => {
    async function run() {
      const res = await fetch(
        "https://raw.githubusercontent.com/OrderlyNetwork/contract-evm-abi/main/abi/latest/Vault.json"
      );
      if (!res.ok) return;
      setAbi(await res.text());
    }
    run();
  }, []);

  const environment = getCurrentEnvironment();
  const supportedChainIds =
    environment === "mainnet"
      ? SAFE_SUPPORTED_CHAINS.mainnet
      : SAFE_SUPPORTED_CHAINS.testnet;

  const availableChains = Object.values(ALL_CHAINS).filter(chain =>
    supportedChainIds.includes(chain.chainId)
  );

  const chain = getChainById(selectedChainId);
  const vaultAddress = chain
    ? (
        ENVIRONMENT_CONFIGS[environment] as Record<
          string,
          { vaultAddress?: string }
        >
      )[chain.id]?.vaultAddress
    : undefined;

  const brokerIdHash = keccak256(encodePacked(["string"], [brokerId]));
  const data = [brokerIdHash, address ?? ""];

  const handleCopy = async (text: string, item: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedItem(item);
    setTimeout(() => setCopiedItem(null), 2000);
  };

  const handleSwitchChain = async (chainId: ChainId) => {
    setSelectedChainId(chainId);
    if (connectedChainId !== chainId) {
      setIsSwitchingChain(true);
      try {
        await switchChain({ chainId });
      } catch (error) {
        console.error("Failed to switch chain:", error);
      } finally {
        setTimeout(() => setIsSwitchingChain(false), 1000);
      }
    }
  };

  if (!isOpen) return null;

  const tabs = [
    { value: "safe" as const, label: t("safeInstructions.openWallet") },
    { value: "transaction" as const, label: t("safeInstructions.createTx") },
    {
      value: "review-confirm" as const,
      label: t("safeInstructions.reviewConfirm"),
    },
    { value: "txhash" as const, label: t("safeInstructions.getTxHash") },
  ];

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center h-screen p-4">
      <div className="absolute inset-0 bg-background-dark/90 backdrop-blur-sm z-[1001]"></div>

      <div className="relative z-[1002] max-w-5xl w-full max-h-[90vh] rounded-xl bg-background-light border border-primary/20 shadow-2xl slide-fade-in overflow-hidden flex">
        <div className="flex-shrink-0 w-64 bg-background-dark/50 border-r border-primary/10 p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-primary/20 p-2 rounded-lg">
              <div className="i-mdi:safe text-primary w-6 h-6"></div>
            </div>
            <h2 className="text-xl font-bold text-white">
              {t("safeInstructions.safeWallet")}
            </h2>
          </div>

          <nav className="space-y-2">
            {tabs.map(tab => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                  activeTab === tab.value
                    ? "bg-primary/20 text-primary border border-primary/30"
                    : "text-gray-400 hover:bg-background-light/50 hover:text-gray-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex-1 flex flex-col">
          <div className="flex-shrink-0 p-8 pb-4">
            <h3 className="text-2xl font-bold text-white mb-2">
              {t("safeInstructions.gnosisSafeInstructions")}
            </h3>

            <div className="flex items-center justify-between mb-2">
              {connectedChainId !== selectedChainId && !isSwitchingChain && (
                <div className="text-xs text-warning flex items-center gap-1">
                  <div className="i-mdi:alert-circle h-3 w-3"></div>
                  {t("safeInstructions.notConnected")}
                </div>
              )}
              {isSwitchingChain && (
                <div className="text-xs text-info flex items-center gap-1">
                  <div className="i-mdi:loading h-3 w-3 animate-spin"></div>
                  {t("safeInstructions.switching")}
                </div>
              )}
            </div>

            <div className="flex gap-2">
              {availableChains.map(availableChain => (
                <button
                  key={availableChain.chainId}
                  onClick={() => handleSwitchChain(availableChain.chainId)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-all ${
                    selectedChainId === availableChain.chainId
                      ? "bg-primary/20 border border-primary/30"
                      : "bg-background-dark/50 border border-light/10 hover:border-light/20"
                  }`}
                >
                  <img
                    src={getChainIcon(availableChain.id)}
                    alt={availableChain.name}
                    className="w-4 h-4 rounded-full"
                    onError={e => {
                      const target = e.currentTarget as HTMLImageElement;
                      target.style.display = "none";
                    }}
                  />
                  <span
                    className={`font-medium ${
                      selectedChainId === availableChain.chainId
                        ? "text-primary"
                        : "text-gray-300"
                    }`}
                  >
                    {availableChain.name}
                  </span>
                  {connectedChainId === availableChain.chainId && (
                    <div className="i-mdi:check-circle h-3 w-3 text-success"></div>
                  )}
                </button>
              ))}
            </div>

            {connectedChainId !== selectedChainId && !isSwitchingChain && (
              <div className="mt-2 pt-2 border-t border-light/10">
                <button
                  onClick={() => handleSwitchChain(selectedChainId)}
                  className="text-xs text-primary hover:text-primary-light flex items-center gap-1"
                >
                  <div className="i-mdi:swap-horizontal h-3 w-3"></div>
                  {t("safeInstructions.switchToChain", {
                    chainName: chain?.name ?? "",
                  })}
                </button>
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto px-8">
            {activeTab === "safe" && (
              <div className="space-y-4 mb-8">
                <div className="bg-info/10 border border-info/20 rounded-lg p-4 mb-4">
                  <div className="flex items-start gap-3">
                    <div className="i-mdi:information-outline text-info w-5 h-5 mt-0.5 flex-shrink-0"></div>
                    <div>
                      <h4 className="font-semibold text-info mb-2">
                        {t("safeInstructions.importantMatchNetwork")}
                      </h4>
                      <p className="text-sm text-gray-300">
                        <Trans
                          i18nKey="safeInstructions.matchNetworkDesc"
                          values={{ chainName: chain?.name ?? "" }}
                          components={[
                            <span
                              key="0"
                              className="font-semibold text-primary"
                            />,
                          ]}
                        />
                      </p>
                    </div>
                  </div>
                </div>

                <p className="text-gray-300">
                  <Trans
                    i18nKey="safeInstructions.visitGnosisSafe"
                    components={[
                      <a
                        key="0"
                        href="https://app.safe.global/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:text-primary-light underline"
                      />,
                    ]}
                  />
                </p>
                <img
                  src="/safe.webp"
                  alt="Gnosis Safe Instructions"
                  className="w-full rounded-lg border border-primary/20"
                />
              </div>
            )}

            {activeTab === "transaction" && (
              <div className="space-y-6 mb-8">
                <div className="bg-background-dark/50 rounded-lg p-4 border border-primary/10">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-white">
                      {t("safeInstructions.enterVaultAddress")}
                    </h4>
                    <button
                      onClick={() =>
                        vaultAddress && handleCopy(vaultAddress, "vault")
                      }
                      className="flex items-center gap-2 px-3 py-1 bg-primary/20 hover:bg-primary/30 text-primary rounded text-sm transition-colors"
                    >
                      <div
                        className={
                          copiedItem === "vault"
                            ? "i-mdi:check h-4 w-4"
                            : "i-mdi:content-copy h-4 w-4"
                        }
                      ></div>
                      {copiedItem === "vault"
                        ? t("safeInstructions.copied")
                        : t("safeInstructions.copy")}
                    </button>
                  </div>
                  <code className="block text-sm text-gray-300 bg-background-dark p-3 rounded border border-primary/10 break-all">
                    {vaultAddress || t("safeInstructions.vaultNotAvailable")}
                  </code>
                </div>

                <div className="bg-background-dark/50 rounded-lg p-4 border border-primary/10">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-white">
                      {t("safeInstructions.copyAbi")}
                    </h4>
                    <button
                      onClick={() => abi && handleCopy(abi, "abi")}
                      disabled={!abi}
                      className="flex items-center gap-2 px-3 py-1 bg-primary/20 hover:bg-primary/30 text-primary rounded text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div
                        className={
                          copiedItem === "abi"
                            ? "i-mdi:check h-4 w-4"
                            : "i-mdi:content-copy h-4 w-4"
                        }
                      ></div>
                      {copiedItem === "abi"
                        ? t("safeInstructions.copied")
                        : t("safeInstructions.copy")}
                    </button>
                  </div>
                  <div className="max-h-32 overflow-y-auto bg-background-dark p-3 rounded border border-primary/10">
                    <code className="text-xs text-gray-300 break-all whitespace-pre-wrap">
                      {abi ?? t("safeInstructions.loadingAbi")}
                    </code>
                  </div>
                </div>

                <div className="bg-background-dark/50 rounded-lg p-4 border border-primary/10">
                  <h4 className="font-semibold text-white mb-2">
                    {t("safeInstructions.selectContractMethod")}
                  </h4>
                  <code className="text-sm text-primary bg-background-dark px-3 py-1 rounded">
                    delegateSigner
                  </code>
                </div>

                <div className="bg-background-dark/50 rounded-lg p-4 border border-primary/10">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-white">
                      {t("safeInstructions.insertDataTuple")}
                    </h4>
                    <button
                      onClick={() => handleCopy(JSON.stringify(data), "data")}
                      className="flex items-center gap-2 px-3 py-1 bg-primary/20 hover:bg-primary/30 text-primary rounded text-sm transition-colors"
                    >
                      <div
                        className={
                          copiedItem === "data"
                            ? "i-mdi:check h-4 w-4"
                            : "i-mdi:content-copy h-4 w-4"
                        }
                      ></div>
                      {copiedItem === "data"
                        ? t("safeInstructions.copied")
                        : t("safeInstructions.copy")}
                    </button>
                  </div>
                  <p className="text-sm text-gray-400 mb-2">
                    {t("safeInstructions.dataTupleDesc")}
                  </p>
                  <code className="block text-xs text-gray-300 bg-background-dark p-3 rounded border border-primary/10 break-all whitespace-pre-wrap">
                    {JSON.stringify(data, undefined, 2)}
                  </code>
                </div>

                <div>
                  <h4 className="font-semibold text-white mb-3">
                    {t("safeInstructions.createBatchTransaction")}
                  </h4>
                  <img
                    src="/batch-create.webp"
                    alt="Create Batch for Gnosis Safe"
                    className="w-full rounded-lg border border-primary/20"
                  />
                </div>
              </div>
            )}

            {activeTab === "review-confirm" && (
              <div className="space-y-6 mb-8">
                <div>
                  <h4 className="font-semibold text-white mb-2">
                    {t("safeInstructions.reviewTransaction")}
                  </h4>
                  <p className="text-gray-300 mb-4">
                    {t("safeInstructions.reviewTransactionDesc")}
                  </p>
                  <img
                    src="/review-batch.webp"
                    alt="Review Gnosis Safe batch transaction"
                    className="w-full rounded-lg border border-primary/20"
                  />
                </div>

                <div>
                  <h4 className="font-semibold text-white mb-2">
                    {t("safeInstructions.executeTransaction")}
                  </h4>
                  <img
                    src="/confirm-tx.webp"
                    alt="Confirm Gnosis Safe batch transaction"
                    className="w-full rounded-lg border border-primary/20"
                  />
                </div>
              </div>
            )}

            {activeTab === "txhash" && (
              <div className="space-y-4 mb-8">
                <div>
                  <h4 className="font-semibold text-white mb-2">
                    {t("safeInstructions.receiveTransactionHash")}
                  </h4>
                  <p className="text-gray-300 mb-4">
                    {t("safeInstructions.receiveTxHashDesc")}
                  </p>
                  <img
                    src="/multisig-txhash.webp"
                    alt="Receive Gnosis Safe transaction hash"
                    className="w-full rounded-lg border border-primary/20"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex-shrink-0 py-4 px-8">
            <div className="flex justify-end">
              <Button variant="secondary" onClick={onClose}>
                <span className="flex items-center gap-2">
                  <div className="i-mdi:close h-4 w-4"></div>
                  {t("safeInstructions.close")}
                </span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
