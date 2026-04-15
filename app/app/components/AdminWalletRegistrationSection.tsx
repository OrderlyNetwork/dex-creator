import { useState, useCallback } from "react";
import { Button } from "./Button";
import { toast } from "react-toastify";
import { post, get } from "../utils/apiClient";
import { useAuth } from "../context/useAuth";
import { useModal } from "../context/ModalContext";
import { useTranslation } from "~/i18n";
import { useAccount, useWalletClient, useChainId, useSwitchChain } from "wagmi";
import { BrowserProvider } from "ethers";
import clsx from "clsx";
import { parseWalletError } from "../utils/wallet";
import {
  cleanMultisigAddress,
  extractChainFromAddress,
} from "../utils/multisig";
import {
  getBaseUrl,
  registerAccount,
  pollAccountRegistration,
  checkAccountRegistration,
  getOffChainDomain,
} from "../utils/orderly";

interface NewGraduationStatusResponse {
  success: boolean;
  isGraduated: boolean;
  brokerId: string;
  isMultisig?: boolean;
  multisigAddress?: string | null;
  multisigChainId?: number | null;
}

let globalOnWalletRegistrationComplete: (() => void) | null = null;

export function setWalletRegistrationCompleteCallback(cb: (() => void) | null) {
  globalOnWalletRegistrationComplete = cb;
}

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

export default function AdminWalletRegistrationSection() {
  const { t } = useTranslation();
  const { token } = useAuth();
  const { address } = useAccount();
  const connectedChainId = useChainId();
  const { data: walletClient } = useWalletClient();
  const { switchChain } = useSwitchChain();
  const { openModal } = useModal();

  const [walletType, setWalletType] = useState<"eoa" | "multisig">("eoa");
  const [isFinalizingAdminWallet, setIsFinalizingAdminWallet] = useState(false);
  const [isRegisteringMultisig, setIsRegisteringMultisig] = useState(false);
  const [multisigAddress, setMultisigAddress] = useState("");
  const [multisigTxHash, setMultisigTxHash] = useState("");
  const [graduationStatus, setGraduationStatus] =
    useState<NewGraduationStatusResponse | null>(null);
  const [isComplete, setIsComplete] = useState(false);

  const loadGraduationStatus = useCallback(async () => {
    try {
      const response = await get<NewGraduationStatusResponse>(
        "api/graduation/graduation-status",
        token,
        { showToastOnError: false }
      );
      setGraduationStatus(response);
      return response;
    } catch {
      return null;
    }
  }, [token]);

  useState(() => {
    loadGraduationStatus();
  });

  const announceDelegateSigner = async (
    delegateContract: string,
    brokerId: string,
    chainId: number,
    txHashStr: string
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
      txHash: txHashStr,
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
        headers: { "Content-Type": "application/json" },
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

  const markComplete = useCallback(() => {
    setIsComplete(true);
    globalOnWalletRegistrationComplete?.();
  }, []);

  const handleFinalizeAdminWallet = async () => {
    if (!address) {
      toast.error(t("common.pleaseConnectYourWallet"));
      return;
    }
    if (!graduationStatus?.brokerId) {
      toast.error(t("graduation.form.noBrokerIdFound"));
      return;
    }
    if (!walletClient) {
      toast.error(t("graduation.form.noWalletClientAvailable"));
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

        toast.success(t("graduation.form.accountRegisteredSuccessfully"));
      }

      const response = await post<{
        success: boolean;
        message: string;
        isGraduated: boolean;
      }>("api/graduation/finalize-admin-wallet", {}, token, {
        showToastOnError: false,
      });

      if (response.success) {
        toast.success(t("graduation.form.adminWalletSetupSuccess"));
        markComplete();
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error("Error finalizing admin wallet:", error);
      const message =
        parseWalletError(error) ||
        t("graduation.form.failedToFinalizeAdminWallet");
      toast.error(message);
    } finally {
      setIsFinalizingAdminWallet(false);
    }
  };

  const handleRegisterMultisig = async () => {
    if (!multisigAddress.trim()) {
      toast.error(t("graduation.form.enterMultisigAddress"));
      return;
    }
    if (!multisigTxHash.trim()) {
      toast.error(t("graduation.form.enterSafeTransactionHash"));
      return;
    }
    if (!address) {
      toast.error(t("common.pleaseConnectYourWallet"));
      return;
    }
    if (!graduationStatus?.brokerId) {
      toast.error(t("graduation.form.noBrokerIdFound"));
      return;
    }

    setIsRegisteringMultisig(true);
    try {
      const cleanAddress = cleanMultisigAddress(multisigAddress);

      const extractedChain = extractChainFromAddress(multisigAddress);
      if (extractedChain && extractedChain !== connectedChainId) {
        await switchChain({ chainId: extractedChain });
        toast.info(t("graduation.form.switchingToCorrectNetworkForMultisig"));
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
        { showToastOnError: false }
      );

      if (response.success) {
        toast.success(t("graduation.form.multisigRegisteredSuccess"));
        markComplete();
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error("Error registering multisig:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : t("graduation.form.failedToRegisterMultisig")
      );
    } finally {
      setIsRegisteringMultisig(false);
    }
  };

  if (isComplete) {
    return (
      <div className="p-4 bg-success/10 border border-success/20 rounded-lg">
        <div className="flex items-center gap-2">
          <div className="i-mdi:check-circle text-success w-5 h-5"></div>
          <span className="text-success font-medium">
            {t("graduation.form.adminWalletSetupSuccess")}
          </span>
        </div>
      </div>
    );
  }

  if (
    !graduationStatus?.success ||
    graduationStatus.brokerId === "demo" ||
    graduationStatus.isGraduated
  ) {
    return (
      <div className="p-4 bg-light/5 rounded-lg">
        <p className="text-sm text-gray-400">
          {t("graduation.form.noBrokerIdFound")}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-warning/10 rounded-lg p-4 text-left">
        <h3 className="font-medium flex items-center mb-2">
          <div className="i-mdi:alert-circle text-warning mr-2 h-5 w-5"></div>
          {t("graduation.form.finalStepRequired")}
        </h3>
        <p className="text-sm text-gray-400 mb-3">
          <strong className="text-warning">
            {t("graduation.form.notEarningFeesYet")}
          </strong>{" "}
          {t("graduation.form.completeAdminWalletSetup")}
        </p>
      </div>

      <div className="bg-light/5 rounded-lg p-4 text-left">
        <h3 className="text-md font-medium mb-3 flex items-center">
          <div className="i-mdi:wallet text-primary-light mr-2 h-5 w-5"></div>
          {t("graduation.form.selectWalletType")}
        </h3>

        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setWalletType("eoa")}
            className={clsx(
              "flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all",
              walletType === "eoa"
                ? "bg-primary/20 text-primary border border-primary/30"
                : "bg-background-card text-gray-400 hover:text-gray-300 border border-light/10"
            )}
          >
            {t("graduation.form.eoaWallet")}
          </button>
          <button
            onClick={() => setWalletType("multisig")}
            className={clsx(
              "flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all",
              walletType === "multisig"
                ? "bg-primary/20 text-primary border border-primary/30"
                : "bg-background-card text-gray-400 hover:text-gray-300 border border-light/10"
            )}
          >
            Gnosis Safe
          </button>
        </div>

        {walletType === "eoa" ? (
          <div className="space-y-4">
            <div className="bg-background-card rounded-lg p-4">
              <h4 className="text-sm font-medium mb-2 flex items-center">
                <div className="i-mdi:information-outline text-info mr-2 h-4 w-4"></div>
                {t("graduation.form.whatThisDoes")}
              </h4>
              <p className="text-xs text-gray-400 mb-3">
                {t("graduation.form.eoaDescription")}
              </p>
              <div className="text-xs text-gray-500 space-y-1">
                <p>{t("graduation.form.registersEvmAddress")}</p>
                <p>{t("graduation.form.createsBrokerAccount")}</p>
                <p>{t("graduation.form.enablesRevenueSharing")}</p>
              </div>
            </div>

            <Button
              onClick={handleFinalizeAdminWallet}
              isLoading={isFinalizingAdminWallet}
              loadingText={t("graduation.form.registeringWithOrderly")}
              variant="primary"
              className="w-full text-center"
            >
              {t("graduation.form.registerWithOrderly")}
            </Button>

            <div className="bg-light/5 rounded-lg p-3">
              <p className="text-xs text-gray-400">
                {t("graduation.form.signMessagePrompt", {
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
                {t("graduation.form.gnosisSafeWallet")}
              </h4>
              <p className="text-xs text-gray-400 mb-3">
                {t("graduation.form.gnosisSafeDescription")}
              </p>
              <div className="text-xs text-gray-500 space-y-1 mb-4">
                <p>{t("graduation.form.multisigEnhancedSecurity")}</p>
                <p>{t("graduation.form.multisigShareControl")}</p>
                <p>{t("graduation.form.multisigForTeams")}</p>
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
                {t("graduation.form.viewSetupInstructions")}
              </span>
            </Button>

            <div className="bg-background-card rounded-lg p-4 border border-primary/10">
              <h4 className="text-sm font-medium mb-3 flex items-center">
                <div className="i-mdi:account-plus text-primary mr-2 h-4 w-4"></div>
                {t("graduation.form.registerYourMultisig")}
              </h4>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-2">
                    {t("graduation.form.multisigAddress")}
                  </label>
                  <input
                    type="text"
                    value={multisigAddress}
                    onChange={e => setMultisigAddress(e.target.value)}
                    placeholder={t(
                      "graduation.form.multisigAddressPlaceholder"
                    )}
                    className="w-full px-3 py-2 bg-background-dark border border-light/10 rounded-lg text-white placeholder-gray-400 focus:border-primary/50 focus:outline-none text-sm"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    {t("graduation.form.multisigAddressHelp")}
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-2">
                    {t("graduation.form.transactionHash")}
                  </label>
                  <input
                    type="text"
                    value={multisigTxHash}
                    onChange={e => setMultisigTxHash(e.target.value)}
                    placeholder="0x..."
                    className="w-full px-3 py-2 bg-background-dark border border-light/10 rounded-lg text-white placeholder-gray-400 focus:border-primary/50 focus:outline-none text-sm"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    {t("graduation.form.transactionHashHelp")}
                  </p>
                </div>

                <Button
                  onClick={handleRegisterMultisig}
                  isLoading={isRegisteringMultisig}
                  loadingText={t("graduation.form.registeringMultisig")}
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
                    {t("graduation.form.registerMultisig")}
                  </span>
                </Button>

                {!address && (
                  <p className="text-xs text-warning text-center">
                    {t("graduation.form.connectWalletToRegisterMultisig")}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
