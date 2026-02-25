import {
  createContext,
  useState,
  useCallback,
  ReactNode,
  useEffect,
} from "react";
import { useAccount, useSignMessage, useDisconnect } from "wagmi";
import { API_BASE_URL } from "../utils/wagmiConfig";
import { toast } from "react-toastify";
import { setGlobalDisconnect } from "../utils/globalDisconnect";
import { useGoogleUserId } from "../hooks/useGoogleAnalysis";
import { trackEvent } from "~/analytics/tracking";
import { useTranslation } from "~/i18n";

interface User {
  id: string;
  address: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: () => Promise<void>;
  logout: () => void;
  validateToken: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export { AuthContext };

export function AuthProvider({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previousAddress, setPreviousAddress] = useState<string | null>(null);

  const { address, isConnected, connector } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { disconnect } = useDisconnect();
  useGoogleUserId(address);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    disconnect();
  }, [disconnect]);

  const validateToken = useCallback(async (): Promise<boolean> => {
    if (!token || !user?.address) {
      const savedToken = localStorage.getItem("auth_token");
      const savedUser = localStorage.getItem("auth_user");

      if (savedToken && savedUser) {
        return true;
      }
      return false;
    }

    if (address && user.address.toLowerCase() !== address.toLowerCase()) {
      console.log(
        "Authenticated address doesn't match connected wallet address"
      );
      logout();
      return false;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/validate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          address: user.address,
          token,
        }),
      });

      if (!response.ok) {
        logout();
        return false;
      }

      const data = await response.json();
      return data.valid;
    } catch (error) {
      console.error("Token validation error:", error);
      logout();
      return false;
    }
  }, [token, user, address, logout]);

  useEffect(() => {
    const validateSavedAuth = async () => {
      setIsValidating(true);

      try {
        const savedToken = localStorage.getItem("auth_token");
        const savedUser = localStorage.getItem("auth_user");

        if (!isConnected && (savedToken || savedUser)) {
          console.log(
            "Wallet not connected, but auth data exists. Clearing auth data."
          );
          logout();
          setIsValidating(false);
          return;
        }

        if (savedToken && savedUser) {
          const parsedUser = JSON.parse(savedUser);
          setToken(savedToken);
          setUser(parsedUser);

          const isValid = await validateToken();

          if (!isValid) {
            console.log("Saved token is invalid, logging out");
            logout();
            toast.warning(t("authContext.sessionExpired"));
          }
        }
      } catch (error) {
        console.error("Error validating saved auth:", error);
        logout();
      } finally {
        setIsValidating(false);
      }
    };

    validateSavedAuth();
  }, [isConnected, address, logout, t]);

  useEffect(() => {
    if (!isConnected && user) {
      logout();
    }
  }, [isConnected, user, logout]);

  useEffect(() => {
    if (address && previousAddress && address !== previousAddress) {
      console.log(
        "Wallet address changed from",
        previousAddress,
        "to",
        address
      );

      setUser(null);
      setToken(null);
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");

      toast.info(t("authContext.walletSwitched"));
    }

    // Track wallet connection when address first becomes available or changes
    if (address && address !== previousAddress) {
      trackEvent("connect_wallet_success", {
        address: `addr_${address}`,
        wallet: connector?.name ?? "unknown",
      });
    }

    setPreviousAddress(address || null);
  }, [address, previousAddress]);

  useEffect(() => {
    setGlobalDisconnect(disconnect);
  }, [disconnect]);

  const login = useCallback(async () => {
    if (!address) {
      const errorMsg = t("authContext.noWalletConnected");
      setError(errorMsg);
      throw new Error(errorMsg);
    }

    try {
      setIsLoading(true);
      setError(null);

      const nonceResponse = await fetch(`${API_BASE_URL}/api/auth/nonce`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ address }),
      });

      if (!nonceResponse.ok) {
        const errorMsg = t("authContext.failedToGetNonce");
        throw new Error(errorMsg);
      }

      const { message } = await nonceResponse.json();

      const signature = await signMessageAsync({ message });

      trackEvent("sign_message_success", {
        address: `addr_${address}`,
        wallet: connector?.name ?? "unknown",
      });

      const verifyResponse = await fetch(`${API_BASE_URL}/api/auth/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ address, signature }),
      });

      if (!verifyResponse.ok) {
        const errorMsg = t("authContext.signatureVerificationFailed");
        throw new Error(errorMsg);
      }

      const { user: userData, token: authToken } = await verifyResponse.json();

      setUser(userData);
      setToken(authToken);
      localStorage.setItem("auth_token", authToken);
      localStorage.setItem("auth_user", JSON.stringify(userData));
    } catch (err) {
      const errorMsg =
        err instanceof Error
          ? err.message
          : t("authContext.authenticationFailed");
      setError(errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [address, signMessageAsync, t]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading: isLoading || isValidating,
        error,
        login,
        logout,
        validateToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
