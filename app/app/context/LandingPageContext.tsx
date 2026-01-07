import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  useEffect,
} from "react";
import { useAuth } from "./useAuth";
import { get } from "../utils/apiClient";
import { LandingPage } from "../types/landingPage";

interface LandingPageContextType {
  landingPageData: LandingPage | null;
  isLoading: boolean;
  error: string | null;
  hasLandingPage: boolean;
  refreshLandingPageData: () => Promise<void>;
  updateLandingPageData: (newData: Partial<LandingPage>) => void;
  clearLandingPageData: () => void;
}

const LandingPageContext = createContext<LandingPageContextType | undefined>(undefined);

export { LandingPageContext };

export function LandingPageProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, token } = useAuth();
  const [landingPageData, setLandingPageData] = useState<LandingPage | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshLandingPageData = useCallback(async () => {
    if (!isAuthenticated || !token) {
      setLandingPageData(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await get<LandingPage | { exists: false }>("api/landing-page", token);

      if (response && "exists" in response && response.exists === false) {
        setLandingPageData(null);
      } else if (response && "id" in response) {
        setLandingPageData(response);
      } else {
        setLandingPageData(null);
      }
    } catch (err) {
      console.error("Failed to fetch landing page data", err);
      setError(err instanceof Error ? err.message : "Failed to fetch landing page data");
      setLandingPageData(null);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, token]);

  const updateLandingPageData = useCallback((newData: Partial<LandingPage>) => {
    setLandingPageData(prev => (prev ? { ...prev, ...newData } : null));
  }, []);

  const clearLandingPageData = useCallback(() => {
    setLandingPageData(null);
    setError(null);
  }, []);

  useEffect(() => {
    if (isAuthenticated && token) {
      refreshLandingPageData();
    } else {
      clearLandingPageData();
    }
  }, [isAuthenticated, token, refreshLandingPageData, clearLandingPageData]);

  const hasLandingPage = Boolean(landingPageData);

  return (
    <LandingPageContext.Provider
      value={{
        landingPageData,
        isLoading,
        error,
        hasLandingPage,
        refreshLandingPageData,
        updateLandingPageData,
        clearLandingPageData,
      }}
    >
      {children}
    </LandingPageContext.Provider>
  );
}

export function useLandingPage() {
  const context = useContext(LandingPageContext);
  if (context === undefined) {
    throw new Error("useLandingPage must be used within a LandingPageProvider");
  }
  return context;
}