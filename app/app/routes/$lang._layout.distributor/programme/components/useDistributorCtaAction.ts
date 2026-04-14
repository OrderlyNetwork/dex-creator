import { useCallback } from "react";
import { useAccount } from "wagmi";
import { useAppKit } from "@reown/appkit/react";
import { useModal } from "../../../../context/ModalContext";
import { useAuth } from "../../../../context/useAuth";

export function useDistributorCtaAction() {
  const { isConnected } = useAccount();
  const appKit = useAppKit();
  const { openModal, closeModal } = useModal();
  const { isAuthenticated, login } = useAuth();

  const handleCtaClick = useCallback(async () => {
    if (!isConnected) {
      appKit?.open({
        namespace: "eip155",
        view: "Connect",
      });
      return;
    }

    if (!isAuthenticated) {
      openModal("login", {
        onLogin: async () => {
          try {
            await login();
            closeModal();
          } catch (error) {
            console.error("Login failed:", error);
          }
        },
        onClose: () => {
          closeModal();
        },
      });
    }
  }, [appKit, closeModal, isAuthenticated, isConnected, login, openModal]);

  return { handleCtaClick };
}
