import { useState, useEffect } from "react";
import { useTranslation } from "~/i18n";
import { useAccount, useDisconnect } from "wagmi";
import { useAuth } from "../context/useAuth";
import { useModal } from "../context/ModalContext";
import { useAppKit } from "@reown/appkit/react";
import { toast } from "react-toastify";
import { Icon } from "@iconify/react";
import { Button } from "./Button";
import { useLocation } from "@remix-run/react";
import { isHandlingSessionExpiryDisconnect } from "../utils/globalDisconnect";

export default function WalletConnect() {
  const { t } = useTranslation();
  const [connectError, setConnectError] = useState<string | null>(null);
  const [hasUserDismissedModal, setHasUserDismissedModal] = useState(false);
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const appKit = useAppKit();
  const location = useLocation();
  const { openModal, closeModal } = useModal();
  const {
    user,
    isAuthenticated,
    login,
    logout,
    isLoading,
    error: authError,
    validateToken,
  } = useAuth();

  useEffect(() => {
    if (isConnected && user) {
      validateToken().catch(error => {
        console.error("Token validation failed:", error);
      });
    }
  }, [validateToken, isConnected, user]);

  useEffect(() => {
    if (authError) {
      console.error("Authentication error:", authError);
    }
  }, [authError]);

  useEffect(() => {
    if (connectError) {
      toast.error(`${t("walletConnect.connectionError")}: ${connectError}`);
      console.error("Connection error:", connectError);
    }
  }, [connectError]);

  useEffect(() => {
    if (isAuthenticated) {
      setHasUserDismissedModal(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (
      isConnected &&
      !isAuthenticated &&
      !hasUserDismissedModal &&
      !isHandlingSessionExpiryDisconnect()
    ) {
      const timer = setTimeout(() => {
        openModal("login", {
          onLogin: handleLogin,
          onClose: handleModalClose,
        });
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [
    isConnected,
    isAuthenticated,
    hasUserDismissedModal,
    location.pathname,
    openModal,
  ]);

  useEffect(() => {
    if (isConnected) {
      setConnectError(null);
    }
  }, [isConnected]);

  const formatAddress = (addr: string) => {
    if (window.innerWidth < 360) {
      return `${addr.substring(0, 3)}...${addr.substring(addr.length - 2)}`;
    }
    if (window.innerWidth < 640) {
      return `${addr.substring(0, 4)}...${addr.substring(addr.length - 3)}`;
    }
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  const openWalletModal = () => {
    appKit?.open({
      namespace: "eip155",
      view: "Connect",
    });
  };

  const handleModalClose = () => {
    setHasUserDismissedModal(true);
    closeModal();
  };

  const handleLogin = async () => {
    try {
      await login();
      closeModal();
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const handleShowLoginModal = () => {
    openModal("login", {
      onLogin: handleLogin,
      onClose: handleModalClose,
    });
  };

  return (
    <div className="relative z-20">
      {!isConnected ? (
        <Button
          variant="primary"
          size="sm"
          withGlow
          className="whitespace-nowrap"
          onClick={openWalletModal}
        >
          <span className="hidden xs:inline">
            {t("walletConnect.connectWallet")}
          </span>
          <span className="xs:hidden">{t("walletConnect.connect")}</span>
        </Button>
      ) : !isAuthenticated ? (
        <div className="flex items-center">
          <div className="flex items-center bg-background-light/30 rounded-full px-1 py-0.5 md:px-2 md:py-1 border border-secondary-light/20">
            <div className="flex items-center gap-0.5 md:gap-1 mr-0.5 md:mr-2">
              <div className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-teal-light mr-2 md:mr-3"></div>
              <span className="hidden md:inline text-xs text-gray-300 font-medium max-w-[80px] md:max-w-none truncate">
                {formatAddress(address as string)}
              </span>
            </div>
            <div className="flex gap-0.5 md:gap-1">
              {/* Login button */}
              <Button
                variant="primary"
                size="xs"
                withGlow
                onClick={handleShowLoginModal}
                isLoading={isLoading}
                loadingText={t("walletConnect.validating")}
                className="text-xs py-0.5 px-2.5 md:text-sm md:py-1.5 md:px-4"
              >
                {t("walletConnect.login")}
              </Button>
              <Button
                variant="ghost"
                size="xs"
                className="rounded-full p-0.5! flex items-center justify-center min-w-0"
                onClick={() => disconnect()}
                title={t("walletConnect.disconnect")}
                aria-label={t("walletConnect.disconnect")}
              >
                <Icon icon="heroicons:power" width={10} className="md:w-3.5" />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center bg-background-light/30 rounded-full px-1 py-0.5 md:px-2 md:py-1 border border-primary-light/20">
          <div className="flex items-center gap-0.5 md:gap-1 mr-0.5 md:mr-2">
            <div className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-teal-light mr-2 md:mr-3"></div>
            <span className="text-[10px] sm:text-xs text-primary-light font-medium max-w-[50px] md:max-w-none truncate">
              {formatAddress(user?.address as string)}
            </span>
          </div>
          <Button
            variant="ghost"
            size="xs"
            className="rounded-full p-0.5! md:p-1! flex items-center justify-center min-w-0"
            onClick={logout}
            title={t("walletConnect.disconnect")}
            aria-label={t("walletConnect.disconnect")}
          >
            <Icon icon="heroicons:power" width={10} className="md:w-3.5" />
          </Button>
        </div>
      )}
    </div>
  );
}
