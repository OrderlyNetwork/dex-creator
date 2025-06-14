import { useState, useEffect, FormEvent, useCallback } from "react";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import { useModal } from "../context/ModalContext";
import { get, post, put, del } from "../utils/apiClient";
import WalletConnect from "../components/WalletConnect";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import Form, { FormErrors } from "../components/Form";
import {
  validateUrl,
  required,
  minLength,
  maxLength,
  composeValidators,
} from "../utils/validation";
import WorkflowStatus from "../components/WorkflowStatus";
import { useNavigate, Link } from "@remix-run/react";
import BrokerDetailsSection from "../components/BrokerDetailsSection";
import BrandingSection from "../components/BrandingSection";
import ThemeCustomizationSection from "../components/ThemeCustomizationSection";
import PnLPostersSection from "../components/PnLPostersSection";
import SocialLinksSection from "../components/SocialLinksSection";
import ReownConfigSection from "../components/ReownConfigSection";
import PrivyConfigSection from "../components/PrivyConfigSection";
import NavigationMenuSection from "../components/NavigationMenuSection";
import AccordionItem from "../components/AccordionItem";
import BlockchainConfigSection from "../components/BlockchainConfigSection";
import LanguageSupportSection from "../components/LanguageSupportSection";

// Define type for DEX data
interface DexData {
  id: string;
  brokerName: string;
  brokerId: string;
  preferredBrokerId?: string | null;
  themeCSS?: string | null;
  primaryLogo?: string | null;
  secondaryLogo?: string | null;
  favicon?: string | null;
  pnlPosters?: string[] | null;
  telegramLink?: string | null;
  discordLink?: string | null;
  xLink?: string | null;
  walletConnectProjectId?: string | null;
  privyAppId?: string | null;
  privyTermsOfUse?: string | null;
  enabledMenus?: string | null;
  customMenus?: string | null;
  enableAbstractWallet?: boolean;
  chainIds?: number[] | null;
  repoUrl?: string | null;
  customDomain?: string | null;
  disableMainnet?: boolean;
  disableTestnet?: boolean;
  disableEvmWallets?: boolean;
  disableSolanaWallets?: boolean;
  tradingViewColorConfig?: string | null;
  availableLanguages?: string[] | null;
  createdAt: string;
  updatedAt: string;
}

interface ThemeResponse {
  theme: string;
}

type ThemeTabType = "colors" | "rounded" | "spacing" | "tradingview";

const STEPS_CONFIG = [
  { id: 1, title: "Broker Details", isOptional: false },
  { id: 2, title: "Branding", isOptional: true },
  { id: 3, title: "Theme Customization", isOptional: true },
  { id: 4, title: "Social Media Links", isOptional: true },
  { id: 5, title: "Reown Configuration", isOptional: true },
  { id: 6, title: "Privy Configuration", isOptional: true },
  { id: 7, title: "Blockchain Configuration", isOptional: true },
  { id: 8, title: "Language Support", isOptional: true },
  { id: 9, title: "Navigation Menus", isOptional: true },
  { id: 10, title: "PnL Posters", isOptional: true },
];
const TOTAL_STEPS = STEPS_CONFIG.length;

const defaultTheme = `:root {
  --oui-font-family: 'Manrope', sans-serif;

  /* colors */
  --oui-color-primary: 176 132 233;
  --oui-color-primary-light: 213 190 244;
  --oui-color-primary-darken: 137 76 209;
  --oui-color-primary-contrast: 255 255 255;

  --oui-color-link: 189 107 237;
  --oui-color-link-light: 217 152 250;

  --oui-color-secondary: 255 255 255;
  --oui-color-tertiary: 218 218 218;
  --oui-color-quaternary: 218 218 218;

  --oui-color-danger: 245 97 139;
  --oui-color-danger-light: 250 167 188;
  --oui-color-danger-darken: 237 72 122;
  --oui-color-danger-contrast: 255 255 255;

  --oui-color-success: 41 233 169;
  --oui-color-success-light: 101 240 194;
  --oui-color-success-darken: 0 161 120;
  --oui-color-success-contrast: 255 255 255;

  --oui-color-warning: 255 209 70;
  --oui-color-warning-light: 255 229 133;
  --oui-color-warning-darken: 255 152 0;
  --oui-color-warning-contrast: 255 255 255;

  --oui-color-fill: 36 32 47;
  --oui-color-fill-active: 40 46 58;

  --oui-color-base-1: 93 83 123;
  --oui-color-base-2: 81 72 107;
  --oui-color-base-3: 68 61 69;
  --oui-color-base-4: 57 52 74;
  --oui-color-base-5: 51 46 66;
  --oui-color-base-6: 43 38 56;
  --oui-color-base-7: 36 32 47;
  --oui-color-base-8: 29 26 38;
  --oui-color-base-9: 22 20 28;
  --oui-color-base-10: 14 13 18;

  --oui-color-base-foreground: 255 255 255;
  --oui-color-line: 255 255 255;

  --oui-color-trading-loss: 245 97 139;
  --oui-color-trading-loss-contrast: 255 255 255;
  --oui-color-trading-profit: 41 233 169;
  --oui-color-trading-profit-contrast: 255 255 255;

  /* gradients */
  --oui-gradient-primary-start: 40 0 97;
  --oui-gradient-primary-end: 189 107 237;

  --oui-gradient-secondary-start: 81 42 121;
  --oui-gradient-secondary-end: 176 132 233;

  --oui-gradient-success-start: 1 83 68;
  --oui-gradient-success-end: 41 223 169;

  --oui-gradient-danger-start: 153 24 76;
  --oui-gradient-danger-end: 245 97 139;

  --oui-gradient-brand-start: 231 219 249;
  --oui-gradient-brand-end: 159 107 225;
  --oui-gradient-brand-stop-start: 6.62%;
  --oui-gradient-brand-stop-end: 86.5%;
  --oui-gradient-brand-angle: 17.44deg;

  --oui-gradient-warning-start: 152 58 8;
  --oui-gradient-warning-end: 255 209 70;

  --oui-gradient-neutral-start: 27 29 24;
  --oui-gradient-neutral-end: 38 41 46;

  /* rounded */
  --oui-rounded-sm: 2px;
  --oui-rounded: 4px;
  --oui-rounded-md: 6px;
  --oui-rounded-lg: 8px;
  --oui-rounded-xl: 12px;
  --oui-rounded-2xl: 16px;
  --oui-rounded-full: 9999px;

  /* spacing */
  --oui-spacing-xs: 20rem;
  --oui-spacing-sm: 22.5rem;
  --oui-spacing-md: 26.25rem;
  --oui-spacing-lg: 30rem;
  --oui-spacing-xl: 33.75rem;
}`;

export default function DexRoute() {
  const { isAuthenticated, token, isLoading } = useAuth();
  const { openModal } = useModal();
  const navigate = useNavigate();
  const [brokerName, setBrokerName] = useState("");
  const [telegramLink, setTelegramLink] = useState("");
  const [discordLink, setDiscordLink] = useState("");
  const [xLink, setXLink] = useState("");
  const [walletConnectProjectId, setWalletConnectProjectId] = useState("");
  const [privyAppId, setPrivyAppId] = useState("");
  const [privyTermsOfUse, setPrivyTermsOfUse] = useState("");
  const [enabledMenus, setEnabledMenus] = useState("");
  const [customMenus, setCustomMenus] = useState("");
  const [enableAbstractWallet, setEnableAbstractWallet] = useState(false);
  const [primaryLogo, setPrimaryLogo] = useState<string | null>(null);
  const [secondaryLogo, setSecondaryLogo] = useState<string | null>(null);
  const [favicon, setFavicon] = useState<string | null>(null);
  const [pnlPosters, setPnlPosters] = useState<(string | null)[]>([]);
  const [availableLanguages, setAvailableLanguages] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isForking, setIsForking] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [forkingStatus, setForkingStatus] = useState("");
  const [dexData, setDexData] = useState<DexData | null>(null);
  const [isLoadingDexData, setIsLoadingDexData] = useState(false);
  const [deploymentUrl, setDeploymentUrl] = useState<string | null>(null);
  const [customDomain, setCustomDomain] = useState("");
  const [viewCssCode, setViewCssCode] = useState(false);
  const [isGraduationEligible, setIsGraduationEligible] = useState(false);
  const [isGraduated, setIsGraduated] = useState(false);
  const [deploymentConfirmed, setDeploymentConfirmed] = useState(false);

  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>(
    {}
  );

  const [originalValues, setOriginalValues] = useState<DexData>({
    id: "",
    brokerName: "",
    brokerId: "",
    preferredBrokerId: null,
    themeCSS: null,
    primaryLogo: null,
    secondaryLogo: null,
    favicon: null,
    pnlPosters: null,
    telegramLink: "",
    discordLink: "",
    xLink: "",
    walletConnectProjectId: "",
    privyAppId: "",
    privyTermsOfUse: "",
    enabledMenus: "",
    customMenus: "",
    enableAbstractWallet: false,
    chainIds: [],
    repoUrl: null,
    customDomain: null,
    disableMainnet: false,
    disableTestnet: false,
    disableEvmWallets: false,
    disableSolanaWallets: false,
    tradingViewColorConfig: null,
    availableLanguages: null,
    createdAt: "",
    updatedAt: "",
  });

  const [themePrompt, setThemePrompt] = useState("");
  const [currentTheme, setCurrentTheme] = useState<string | null>(null);
  const [isGeneratingTheme, setIsGeneratingTheme] = useState(false);
  const [showThemeEditor, setShowThemeEditor] = useState(false);
  const [themeApplied, setThemeApplied] = useState(false);
  const [activeThemeTab, setActiveThemeTab] = useState<ThemeTabType>("colors");

  const [chainIds, setChainIds] = useState<number[]>([]);
  const [disableMainnet, setDisableMainnet] = useState(false);
  const [disableTestnet, setDisableTestnet] = useState(false);
  const [disableEvmWallets, setDisableEvmWallets] = useState(false);
  const [disableSolanaWallets, setDisableSolanaWallets] = useState(false);
  const [tradingViewColorConfig, setTradingViewColorConfig] = useState<
    string | null
  >(null);

  useEffect(() => {
    if (!isAuthenticated || !token) return;

    async function fetchDexData() {
      setIsLoadingDexData(true);
      try {
        const response = await get<DexData | { exists: false }>(
          "api/dex",
          token
        );

        if (response && "exists" in response && response.exists === false) {
          setDexData(null);
        } else if (response && "id" in response) {
          setDexData(response);
          setBrokerName(response.brokerName);
          setTelegramLink(response.telegramLink || "");
          setDiscordLink(response.discordLink || "");
          setXLink(response.xLink || "");
          setWalletConnectProjectId(response.walletConnectProjectId || "");
          setPrivyAppId(response.privyAppId || "");
          setPrivyTermsOfUse(response.privyTermsOfUse || "");
          setEnabledMenus(response.enabledMenus || "");
          setCustomMenus(response.customMenus || "");
          setEnableAbstractWallet(response.enableAbstractWallet || false);
          setDisableMainnet(response.disableMainnet || false);
          setDisableTestnet(response.disableTestnet || false);
          setDisableEvmWallets(response.disableEvmWallets || false);
          setDisableSolanaWallets(response.disableSolanaWallets || false);
          setTradingViewColorConfig(response.tradingViewColorConfig || null);
          setPrimaryLogo(response.primaryLogo || null);
          setSecondaryLogo(response.secondaryLogo || null);
          setFavicon(response.favicon || null);
          setPnlPosters(response.pnlPosters || []);
          setAvailableLanguages(response.availableLanguages || []);
          setViewCssCode(false);

          setIsGraduationEligible(response.brokerId === "demo");

          const isGraduated =
            response.brokerId !== "demo" &&
            (response.preferredBrokerId
              ? response.brokerId === response.preferredBrokerId
              : false);
          setIsGraduated(isGraduated);

          if (response.themeCSS) {
            setCurrentTheme(response.themeCSS);
            setThemeApplied(true);
          } else {
            setCurrentTheme(defaultTheme);
            setThemeApplied(true);
          }

          setOriginalValues({
            ...response,
            chainIds: response.chainIds || [],
            enableAbstractWallet: response.enableAbstractWallet || false,
            disableMainnet: response.disableMainnet || false,
            disableTestnet: response.disableTestnet || false,
            disableEvmWallets: response.disableEvmWallets || false,
            disableSolanaWallets: response.disableSolanaWallets || false,
            availableLanguages: response.availableLanguages || [],
          });

          setActiveThemeTab("colors");
          setDeploymentUrl(
            response.repoUrl
              ? `https://dex.orderly.network/${response.repoUrl.split("/").pop()}/`
              : null
          );
          setCustomDomain(response.customDomain || "");
          setChainIds(response.chainIds || []);
        } else {
          setDexData(null);
        }
      } catch (error) {
        console.error("Failed to fetch DEX data", error);
        setDexData(null);
      } finally {
        setIsLoadingDexData(false);
      }
    }

    fetchDexData();
  }, [isAuthenticated, token]);

  useEffect(() => {
    if (!currentTheme && !originalValues.themeCSS) {
      setCurrentTheme(defaultTheme);
      setThemeApplied(true);
    }
  }, [currentTheme, originalValues.themeCSS]);

  const handleGenerateTheme = async () => {
    if (!themePrompt.trim()) {
      toast.error("Please enter a theme description");
      return;
    }

    setIsGeneratingTheme(true);

    try {
      const response = await post<ThemeResponse>(
        "api/theme/modify",
        {
          prompt: themePrompt.trim(),
          currentTheme: currentTheme || originalValues.themeCSS,
        },
        token
      );

      if (response && response.theme) {
        openModal("themePreview", {
          theme: response.theme,
          onApply: handleApplyGeneratedTheme,
          onCancel: handleCancelGeneratedTheme,
        });
        toast.success("Theme generated successfully!");
      } else {
        toast.error("Failed to generate theme");
      }
    } catch (error) {
      console.error("Error generating theme:", error);
      toast.error("Error generating theme. Please try again.");
    } finally {
      setIsGeneratingTheme(false);
    }
  };

  const handleApplyGeneratedTheme = (modifiedCss: string) => {
    setCurrentTheme(modifiedCss);
    setThemeApplied(true);
  };

  const handleCancelGeneratedTheme = () => {};

  const handleThemeEditorChange = (value: string) => {
    setCurrentTheme(value);
    setThemeApplied(true);
  };

  const handleResetTheme = () => {
    setCurrentTheme(originalValues.themeCSS || null);
    setThemeApplied(!!originalValues.themeCSS);
    setTradingViewColorConfig(originalValues.tradingViewColorConfig || null);
    setThemePrompt("");
    setShowThemeEditor(false);
    setViewCssCode(false);
    toast.success("Theme reset");
  };

  const handleResetToDefault = () => {
    setCurrentTheme(defaultTheme);
    setThemeApplied(true);
    setTradingViewColorConfig(null);
    setThemePrompt("");
    setShowThemeEditor(false);
    setViewCssCode(false);
    toast.success("Theme reset to default");
  };

  const toggleThemeEditor = () => {
    setShowThemeEditor(!showThemeEditor);
  };

  const handleRetryForking = async () => {
    if (!dexData || !dexData.id || !token) {
      toast.error("DEX information is not available");
      return;
    }

    setIsForking(true);
    setForkingStatus("Creating repository from template...");

    try {
      const result = await post<{ dex: DexData }>(
        `api/dex/${dexData.id}/fork`,
        {},
        token
      );

      if (result && result.dex) {
        setDexData(result.dex);

        if (result.dex.repoUrl) {
          toast.success("Repository forked successfully!");

          setDeploymentUrl(
            `https://dex.orderly.network/${result.dex.repoUrl.split("/").pop()}/`
          );
        } else {
          toast.error("Repository creation failed. Please try again later.");
        }
      } else {
        toast.error(
          "Failed to get response from server. Please try again later."
        );
      }
    } catch (error) {
      console.error("Error forking repository:", error);
      toast.error("Failed to fork repository. Please try again later.");
    } finally {
      setIsForking(false);
      setForkingStatus("");
    }
  };

  const brokerNameValidator = composeValidators(
    required("Broker name"),
    minLength(3, "Broker name"),
    maxLength(50, "Broker name")
  );

  const urlValidator = validateUrl();

  const handleInputChange =
    (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;

      switch (field) {
        case "brokerName":
          setBrokerName(value);
          break;
        case "telegramLink":
          setTelegramLink(value);
          break;
        case "discordLink":
          setDiscordLink(value);
          break;
        case "xLink":
          setXLink(value);
          break;
        case "walletConnectProjectId":
          setWalletConnectProjectId(value);
          break;
        case "privyAppId":
          setPrivyAppId(value);
          break;
        case "privyTermsOfUse":
          setPrivyTermsOfUse(value);
          break;
        case "themePrompt":
          setThemePrompt(value);
          break;
      }
    };

  const handleImageChange = (field: string) => (value: string | null) => {
    switch (field) {
      case "primaryLogo":
        setPrimaryLogo(value);
        break;
      case "secondaryLogo":
        setSecondaryLogo(value);
        break;
      case "favicon":
        setFavicon(value);
        break;
    }
  };

  const handleSubmit = async (_: FormEvent, errors: FormErrors) => {
    if (!isAuthenticated) {
      toast.error("Please connect your wallet and login first");
      return;
    }

    if (Object.values(errors).some(error => error !== null)) {
      return;
    }

    const trimmedBrokerName = brokerName.trim();
    const trimmedTelegramLink = telegramLink.trim();
    const trimmedDiscordLink = discordLink.trim();
    const trimmedXLink = xLink.trim();
    const trimmedWalletConnectProjectId = walletConnectProjectId.trim();
    const trimmedPrivyAppId = privyAppId.trim();
    const trimmedPrivyTermsOfUse = privyTermsOfUse.trim();

    if (dexData && dexData.id) {
      const hasChanges =
        trimmedBrokerName !== originalValues.brokerName ||
        trimmedTelegramLink !== originalValues.telegramLink ||
        trimmedDiscordLink !== originalValues.discordLink ||
        trimmedXLink !== originalValues.xLink ||
        trimmedWalletConnectProjectId !==
          originalValues.walletConnectProjectId ||
        trimmedPrivyAppId !== originalValues.privyAppId ||
        trimmedPrivyTermsOfUse !== originalValues.privyTermsOfUse ||
        primaryLogo !== originalValues.primaryLogo ||
        secondaryLogo !== originalValues.secondaryLogo ||
        favicon !== originalValues.favicon ||
        JSON.stringify(pnlPosters) !==
          JSON.stringify(originalValues.pnlPosters || []) ||
        (themeApplied && currentTheme !== originalValues.themeCSS) ||
        enabledMenus !== originalValues.enabledMenus ||
        customMenus !== originalValues.customMenus ||
        enableAbstractWallet !== originalValues.enableAbstractWallet ||
        disableMainnet !== originalValues.disableMainnet ||
        disableTestnet !== originalValues.disableTestnet ||
        disableEvmWallets !== originalValues.disableEvmWallets ||
        disableSolanaWallets !== originalValues.disableSolanaWallets ||
        tradingViewColorConfig !== originalValues.tradingViewColorConfig ||
        JSON.stringify([...chainIds].sort()) !==
          JSON.stringify([...(originalValues.chainIds || [])].sort()) ||
        JSON.stringify([...availableLanguages].sort()) !==
          JSON.stringify([...(originalValues.availableLanguages || [])].sort());

      if (!hasChanges) {
        toast.info("No changes to save");
        return;
      }
    }

    setIsSaving(true);

    // If we're creating the DEX for the first time, show a forking status
    if (!dexData || !dexData.id) {
      setForkingStatus("Creating DEX and forking repository...");
    }

    try {
      let savedData: DexData;

      // Prepare the form data
      const dexFormData = {
        brokerName: trimmedBrokerName,
        telegramLink: trimmedTelegramLink || null,
        discordLink: trimmedDiscordLink || null,
        xLink: trimmedXLink || null,
        walletConnectProjectId: trimmedWalletConnectProjectId || null,
        privyAppId: trimmedPrivyAppId || null,
        privyTermsOfUse: trimmedPrivyTermsOfUse || null,
        primaryLogo: primaryLogo,
        secondaryLogo: secondaryLogo,
        favicon: favicon,
        pnlPosters: pnlPosters.filter(Boolean) as string[],
        themeCSS: themeApplied ? currentTheme : originalValues.themeCSS,
        enabledMenus: enabledMenus,
        customMenus,
        enableAbstractWallet,
        chainIds,
        disableMainnet,
        disableTestnet,
        disableEvmWallets,
        disableSolanaWallets,
        tradingViewColorConfig,
        availableLanguages,
      };

      if (dexData && dexData.id) {
        savedData = await put<DexData>(
          `api/dex/${dexData.id}`,
          dexFormData,
          token
        );

        setOriginalValues({
          ...savedData,
          brokerName: trimmedBrokerName,
          telegramLink: trimmedTelegramLink,
          discordLink: trimmedDiscordLink,
          xLink: trimmedXLink,
          walletConnectProjectId: trimmedWalletConnectProjectId,
          privyAppId: trimmedPrivyAppId,
          privyTermsOfUse: trimmedPrivyTermsOfUse,
          enabledMenus: enabledMenus,
          customMenus,
          primaryLogo,
          secondaryLogo,
          favicon,
          pnlPosters: pnlPosters.filter(Boolean) as string[],
          themeCSS: themeApplied ? currentTheme : null,
          enableAbstractWallet,
          chainIds,
          disableMainnet,
          disableTestnet,
          disableEvmWallets,
          disableSolanaWallets,
          tradingViewColorConfig,
        });

        toast.success("DEX information updated successfully!");
      } else {
        savedData = await post<DexData>("api/dex", dexFormData, token);

        setOriginalValues({
          ...originalValues,
          brokerName: trimmedBrokerName,
          telegramLink: trimmedTelegramLink,
          discordLink: trimmedDiscordLink,
          xLink: trimmedXLink,
          walletConnectProjectId: trimmedWalletConnectProjectId,
          privyAppId: trimmedPrivyAppId,
          privyTermsOfUse: trimmedPrivyTermsOfUse,
          enabledMenus: enabledMenus,
          customMenus,
          primaryLogo,
          secondaryLogo,
          favicon,
          pnlPosters: pnlPosters.filter(Boolean) as string[],
          themeCSS: themeApplied ? currentTheme : null,
          enableAbstractWallet,
          chainIds,
          disableMainnet,
          disableTestnet,
          disableEvmWallets,
          disableSolanaWallets,
          tradingViewColorConfig,
          availableLanguages,
        });

        if (savedData.repoUrl) {
          toast.success("DEX created and repository forked successfully!");
        } else {
          toast.success("DEX information saved successfully!");
          toast.warning("Repository could not be forked. You can retry later.");
        }
      }

      setDexData(savedData);
      setIsGraduationEligible(savedData.brokerId === "demo");
    } catch (error) {
      console.error("Error in component:", error);
    } finally {
      setIsSaving(false);
      setForkingStatus("");
    }
  };

  const handleSuccessfulDeployment = (
    url: string,
    isNewDeployment: boolean
  ) => {
    setDeploymentUrl(url);
    setDeploymentConfirmed(true);

    if (isNewDeployment) {
      toast.success("Your DEX has been successfully deployed!");
    }
  };

  const handleDelete = async () => {
    if (!dexData || !dexData.id || !token) {
      toast.error("DEX information is not available");
      return;
    }

    setIsDeleting(true);

    try {
      await del<{ message: string }>(`api/dex/${dexData.id}`, null, token);
      toast.success("DEX deleted successfully!");

      // Reset state and redirect to home page
      setDexData(null);
      setBrokerName("");
      setTelegramLink("");
      setDiscordLink("");
      setXLink("");
      setPrimaryLogo(null);
      setSecondaryLogo(null);
      setFavicon(null);
      setDeploymentUrl(null);

      // Redirect to home
      navigate("/");
    } catch (error) {
      console.error("Error deleting DEX:", error);
      toast.error("Failed to delete the DEX. Please try again later.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleShowDeleteConfirm = () => {
    openModal("deleteConfirm", {
      onConfirm: handleDelete,
      entityName: "DEX",
    });
  };

  const handleShowDomainRemoveConfirm = () => {
    if (!dexData || !dexData.id || !dexData.customDomain) return;

    openModal("deleteConfirm", {
      onConfirm: () => {
        setIsSaving(true);

        del(`api/dex/${dexData.id}/custom-domain`, null, token)
          .then(() => {
            setDexData({
              ...dexData,
              customDomain: null,
            });
            toast.success("Custom domain removed successfully");
          })
          .catch(error => {
            console.error("Error removing custom domain:", error);
            toast.error("Failed to remove custom domain");
          })
          .finally(() => {
            setIsSaving(false);
          });
      },
      entityName: "custom domain",
      title: "Remove Custom Domain",
      message: `Are you sure you want to remove the custom domain "${dexData.customDomain}"? This action cannot be undone.`,
    });
  };

  const hexToRgbSpaceSeparated = (hex: string) => {
    hex = hex.replace("#", "");

    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);

    return `${r} ${g} ${b}`;
  };

  const updateCssColor = useCallback(
    (variableName: string, newColorHex: string) => {
      const newColorRgb = hexToRgbSpaceSeparated(newColorHex);

      setCurrentTheme(prevTheme => {
        const baseTheme = prevTheme || defaultTheme;
        let updatedCss = baseTheme;

        if (variableName.startsWith("oui-color")) {
          const regex = new RegExp(
            `(--${variableName}:\\s*)(\\d+\\s+\\d+\\s+\\d+)`,
            "g"
          );
          updatedCss = updatedCss.replace(regex, `$1${newColorRgb}`);
        } else if (variableName.startsWith("gradient")) {
          const regex = new RegExp(
            `(--oui-${variableName}:\\s*)(\\d+\\s+\\d+\\s+\\d+)`,
            "g"
          );
          updatedCss = updatedCss.replace(regex, `$1${newColorRgb}`);
        }

        return updatedCss;
      });

      setThemeApplied(true);
    },
    [defaultTheme]
  );

  const updateCssValue = useCallback(
    (variableName: string, newValue: string) => {
      setCurrentTheme(prevTheme => {
        if (!prevTheme) return prevTheme;

        const regex = new RegExp(`(--${variableName}:\\s*)([^;]+)`, "g");
        return prevTheme.replace(regex, `$1${newValue}`);
      });

      setThemeApplied(true);
    },
    []
  );

  const ThemeTabButton = ({
    tab,
    label,
  }: {
    tab: ThemeTabType;
    label: string;
  }) => (
    <button
      className={`px-4 py-2 text-sm font-medium rounded-t-lg ${
        activeThemeTab === tab
          ? "bg-background-dark/50 text-white border-t border-l border-r border-light/10"
          : "bg-transparent text-gray-400 hover:text-white"
      }`}
      onClick={() => setActiveThemeTab(tab)}
      type="button"
    >
      {label}
    </button>
  );

  const allRequiredPreviousStepsCompleted = (stepNumber: number) => {
    if (stepNumber === 1) return true;
    for (let i = 1; i < stepNumber; i++) {
      const stepConfig = STEPS_CONFIG.find(s => s.id === i);
      if (stepConfig && !stepConfig.isOptional && !completedSteps[i]) {
        return false;
      }
    }
    return true;
  };

  const areAllPreviousStepsCompleted = (stepNumber: number) => {
    if (stepNumber === 1) return true;
    for (let i = 1; i < stepNumber; i++) {
      if (!completedSteps[i]) {
        return false;
      }
    }
    return true;
  };

  const handleNextStep = (step: number) => {
    const currentStepConfig = STEPS_CONFIG.find(s => s.id === step);
    if (currentStepConfig && !currentStepConfig.isOptional) {
      if (step === 1) {
        const validationError = brokerNameValidator(brokerName.trim());
        if (validationError !== null) {
          toast.error(
            typeof validationError === "string"
              ? validationError
              : "Broker name is invalid. It must be between 3 and 50 characters."
          );
          return;
        }
      }
    }

    if (
      step === STEPS_CONFIG.find(s => s.title === "Privy Configuration")?.id
    ) {
      const privyTermsOfUseFilled =
        privyTermsOfUse && privyTermsOfUse.trim() !== "";

      if (
        privyTermsOfUseFilled &&
        urlValidator(privyTermsOfUse.trim()) !== null
      ) {
        toast.error("Privy Terms of Use URL is not a valid URL.");
        return;
      }
    }

    setCompletedSteps(prev => ({ ...prev, [step]: true }));
    if (step < TOTAL_STEPS) {
      setCurrentStep(step + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      setCurrentStep(TOTAL_STEPS + 1);
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
    }
  };

  if (isLoading || isLoadingDexData) {
    return (
      <div className="w-full h-[calc(100vh-64px)] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="i-svg-spinners:pulse-rings-multiple h-12 w-12 mx-auto text-primary-light mb-4"></div>
          <div className="text-base md:text-lg mb-2">Loading your DEX</div>
          <div className="text-xs md:text-sm text-gray-400">
            Please wait while we fetch your configuration
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="w-full max-w-3xl mx-auto px-4 py-6 md:py-10">
        <div className="text-center">
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold mb-4 md:mb-6">
            Create Your DEX
          </h1>
          <Card>
            <h2 className="text-lg md:text-xl font-medium mb-3 md:mb-4">
              Authentication Required
            </h2>
            <p className="mb-4 md:mb-6 text-sm md:text-base text-gray-300">
              Please connect your wallet and login to create and manage your
              DEX.
            </p>
            <div className="flex justify-center">
              <WalletConnect />
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if ((isSaving || isForking) && forkingStatus && !dexData) {
    return (
      <div className="w-full h-[calc(100vh-64px)] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="i-svg-spinners:pulse-rings-multiple h-12 w-12 mx-auto text-primary-light mb-4"></div>
          <div className="text-lg md:text-xl mb-4 font-medium">
            {forkingStatus}
          </div>
          <div className="text-xs md:text-sm text-gray-400 max-w-sm mx-auto">
            This may take a moment. We're setting up your DEX repository and
            configuring it with your information.
          </div>
        </div>
      </div>
    );
  }

  if (!dexData && isAuthenticated) {
    return (
      <div className="container mx-auto p-4 max-w-3xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold gradient-text">
            Create Your DEX - Step-by-Step
          </h1>
        </div>
        <Form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4"
          submitText={
            currentStep > TOTAL_STEPS && completedSteps[TOTAL_STEPS]
              ? "Create Your DEX"
              : ""
          }
          isLoading={isSaving}
          loadingText="Creating DEX..."
          disabled={
            isForking ||
            isDeleting ||
            isSaving ||
            !(currentStep > TOTAL_STEPS && completedSteps[TOTAL_STEPS])
          }
        >
          {/* Step 1: Broker Name - Always visible as it's the first step */}
          <AccordionItem
            title="Step 1: Broker Details"
            stepNumber={1}
            isOptional={false}
            onNextInternal={() => handleNextStep(1)}
            isStepContentValidTest={
              brokerNameValidator(brokerName.trim()) === null
            }
            isActive={currentStep === 1}
            isCompleted={!!completedSteps[1]}
            canOpen={
              allRequiredPreviousStepsCompleted(1) || !!completedSteps[1]
            }
            setCurrentStep={setCurrentStep}
            allRequiredPreviousStepsCompleted={
              allRequiredPreviousStepsCompleted
            }
          >
            <BrokerDetailsSection
              brokerName={brokerName}
              handleInputChange={handleInputChange}
              brokerNameValidator={brokerNameValidator}
            />
          </AccordionItem>

          {/* Step 2: Branding */}
          {areAllPreviousStepsCompleted(2) && (
            <AccordionItem
              title={STEPS_CONFIG.find(s => s.id === 2)?.title || "Branding"}
              stepNumber={2}
              isOptional={
                STEPS_CONFIG.find(s => s.id === 2)?.isOptional || false
              }
              onNextInternal={() => handleNextStep(2)}
              isStepContentValidTest={true}
              isActive={currentStep === 2}
              isCompleted={!!completedSteps[2]}
              canOpen={
                allRequiredPreviousStepsCompleted(2) || !!completedSteps[2]
              }
              setCurrentStep={setCurrentStep}
              allRequiredPreviousStepsCompleted={
                allRequiredPreviousStepsCompleted
              }
            >
              <p className="text-xs text-gray-400 mb-4">
                Customize your DEX with your own branding by pasting your logos
                below. Copy an image to your clipboard (from any image editor or
                browser), then click in the paste area and press Ctrl+V or ⌘+V.{" "}
                <span className="text-primary-light">
                  All branding fields are optional.
                </span>
              </p>
              <BrandingSection
                primaryLogo={primaryLogo}
                secondaryLogo={secondaryLogo}
                favicon={favicon}
                handleImageChange={handleImageChange}
              />
            </AccordionItem>
          )}

          {/* Step 3: Theme Customization */}
          {areAllPreviousStepsCompleted(3) && (
            <AccordionItem
              title={
                STEPS_CONFIG.find(s => s.id === 3)?.title ||
                "Theme Customization"
              }
              stepNumber={3}
              isOptional={
                STEPS_CONFIG.find(s => s.id === 3)?.isOptional || false
              }
              onNextInternal={() => handleNextStep(3)}
              isStepContentValidTest={true}
              isActive={currentStep === 3}
              isCompleted={!!completedSteps[3]}
              canOpen={
                allRequiredPreviousStepsCompleted(3) || !!completedSteps[3]
              }
              setCurrentStep={setCurrentStep}
              allRequiredPreviousStepsCompleted={
                allRequiredPreviousStepsCompleted
              }
            >
              <p className="text-xs text-gray-400 mb-4">
                Customize your DEX's colors and theme by editing the CSS
                directly or describing how you want it to look for AI-assisted
                generation.{" "}
                <span className="text-primary-light">
                  Theme customization is completely optional - your DEX will
                  work great with the default theme.
                </span>
              </p>
              <ThemeCustomizationSection
                currentTheme={currentTheme}
                defaultTheme={defaultTheme}
                showThemeEditor={showThemeEditor}
                viewCssCode={viewCssCode}
                activeThemeTab={activeThemeTab}
                themePrompt={themePrompt}
                isGeneratingTheme={isGeneratingTheme}
                brokerName={brokerName}
                primaryLogo={primaryLogo}
                secondaryLogo={secondaryLogo}
                themeApplied={themeApplied}
                tradingViewColorConfig={tradingViewColorConfig}
                toggleThemeEditor={toggleThemeEditor}
                handleResetTheme={handleResetTheme}
                handleResetToDefault={handleResetToDefault}
                handleThemeEditorChange={handleThemeEditorChange}
                setViewCssCode={setViewCssCode}
                ThemeTabButton={ThemeTabButton}
                updateCssColor={updateCssColor}
                updateCssValue={updateCssValue}
                handleInputChange={handleInputChange}
                handleGenerateTheme={handleGenerateTheme}
                setTradingViewColorConfig={setTradingViewColorConfig}
                idPrefix="duplicate-"
              />
            </AccordionItem>
          )}

          {/* Step 4: Social Media Links */}
          {areAllPreviousStepsCompleted(4) && (
            <AccordionItem
              title={
                STEPS_CONFIG.find(s => s.id === 4)?.title ||
                "Social Media Links"
              }
              stepNumber={4}
              isOptional={
                STEPS_CONFIG.find(s => s.id === 4)?.isOptional || false
              }
              onNextInternal={() => handleNextStep(4)}
              isStepContentValidTest={true}
              isActive={currentStep === 4}
              isCompleted={!!completedSteps[4]}
              canOpen={
                allRequiredPreviousStepsCompleted(4) || !!completedSteps[4]
              }
              setCurrentStep={setCurrentStep}
              allRequiredPreviousStepsCompleted={
                allRequiredPreviousStepsCompleted
              }
            >
              <p className="text-xs text-gray-400 mb-4">
                Add social media links that will appear in your DEX footer.{" "}
                <span className="text-primary-light">
                  All social media links are optional.
                </span>{" "}
                Leave empty if not applicable.
              </p>
              <SocialLinksSection
                telegramLink={telegramLink}
                discordLink={discordLink}
                xLink={xLink}
                handleInputChange={handleInputChange}
                urlValidator={urlValidator}
              />
            </AccordionItem>
          )}

          {/* Step 5: Reown Configuration */}
          {areAllPreviousStepsCompleted(5) && (
            <AccordionItem
              title={
                STEPS_CONFIG.find(s => s.id === 5)?.title ||
                "Reown Configuration"
              }
              stepNumber={5}
              isOptional={
                STEPS_CONFIG.find(s => s.id === 5)?.isOptional || false
              }
              onNextInternal={() => handleNextStep(5)}
              isStepContentValidTest={true}
              isActive={currentStep === 5}
              isCompleted={!!completedSteps[5]}
              canOpen={
                allRequiredPreviousStepsCompleted(5) || !!completedSteps[5]
              }
              setCurrentStep={setCurrentStep}
              allRequiredPreviousStepsCompleted={
                allRequiredPreviousStepsCompleted
              }
            >
              <p className="text-xs text-gray-400 mb-4">
                Add your Reown Project ID to enable enhanced wallet connectivity
                functionality in your DEX.{" "}
                <span className="text-primary-light">
                  This is completely optional - your DEX will work without it.
                </span>
              </p>
              <ReownConfigSection
                walletConnectProjectId={walletConnectProjectId}
                handleInputChange={handleInputChange}
              />
            </AccordionItem>
          )}

          {/* Step 6: Privy Configuration */}
          {areAllPreviousStepsCompleted(6) && (
            <AccordionItem
              title={
                STEPS_CONFIG.find(s => s.id === 6)?.title ||
                "Privy Configuration"
              }
              stepNumber={6}
              isOptional={
                STEPS_CONFIG.find(s => s.id === 6)?.isOptional || false
              }
              onNextInternal={() => handleNextStep(6)}
              isStepContentValidTest={
                privyTermsOfUse.trim()
                  ? urlValidator(privyTermsOfUse.trim()) === null
                  : true
              }
              isActive={currentStep === 6}
              isCompleted={!!completedSteps[6]}
              canOpen={
                allRequiredPreviousStepsCompleted(6) || !!completedSteps[6]
              }
              setCurrentStep={setCurrentStep}
              allRequiredPreviousStepsCompleted={
                allRequiredPreviousStepsCompleted
              }
            >
              <PrivyConfigSection
                privyAppId={privyAppId}
                privyTermsOfUse={privyTermsOfUse}
                handleInputChange={handleInputChange}
                urlValidator={urlValidator}
                enableAbstractWallet={enableAbstractWallet}
                onEnableAbstractWalletChange={setEnableAbstractWallet}
                disableEvmWallets={disableEvmWallets}
                disableSolanaWallets={disableSolanaWallets}
                onDisableEvmWalletsChange={setDisableEvmWallets}
                onDisableSolanaWalletsChange={setDisableSolanaWallets}
              />
            </AccordionItem>
          )}

          {/* Step 7: Blockchain Configuration */}
          {areAllPreviousStepsCompleted(7) && (
            <AccordionItem
              title={
                STEPS_CONFIG.find(s => s.id === 7)?.title ||
                "Blockchain Configuration"
              }
              stepNumber={7}
              isOptional={
                STEPS_CONFIG.find(s => s.id === 7)?.isOptional || false
              }
              onNextInternal={() => handleNextStep(7)}
              isStepContentValidTest={true}
              isActive={currentStep === 7}
              isCompleted={!!completedSteps[7]}
              canOpen={
                allRequiredPreviousStepsCompleted(7) || !!completedSteps[7]
              }
              setCurrentStep={setCurrentStep}
              allRequiredPreviousStepsCompleted={
                allRequiredPreviousStepsCompleted
              }
            >
              <BlockchainConfigSection
                chainIds={chainIds}
                onChainIdsChange={setChainIds}
                disableMainnet={disableMainnet}
                disableTestnet={disableTestnet}
                onDisableMainnetChange={setDisableMainnet}
                onDisableTestnetChange={setDisableTestnet}
              />
            </AccordionItem>
          )}

          {/* Step 8: Language Support */}
          {areAllPreviousStepsCompleted(8) && (
            <AccordionItem
              title={
                STEPS_CONFIG.find(s => s.id === 8)?.title || "Language Support"
              }
              stepNumber={8}
              isOptional={
                STEPS_CONFIG.find(s => s.id === 8)?.isOptional || false
              }
              onNextInternal={() => handleNextStep(8)}
              isStepContentValidTest={true}
              isActive={currentStep === 8}
              isCompleted={!!completedSteps[8]}
              canOpen={
                allRequiredPreviousStepsCompleted(8) || !!completedSteps[8]
              }
              setCurrentStep={setCurrentStep}
              allRequiredPreviousStepsCompleted={
                allRequiredPreviousStepsCompleted
              }
            >
              <LanguageSupportSection
                availableLanguages={availableLanguages}
                onAvailableLanguagesChange={setAvailableLanguages}
              />
            </AccordionItem>
          )}

          {/* Step 9: Navigation Menus */}
          {areAllPreviousStepsCompleted(9) && (
            <AccordionItem
              title={
                STEPS_CONFIG.find(s => s.id === 9)?.title || "Navigation Menus"
              }
              stepNumber={9}
              isOptional={
                STEPS_CONFIG.find(s => s.id === 9)?.isOptional || false
              }
              onNextInternal={() => handleNextStep(9)}
              isStepContentValidTest={true}
              isActive={currentStep === 9}
              isCompleted={!!completedSteps[9]}
              canOpen={
                allRequiredPreviousStepsCompleted(9) || !!completedSteps[9]
              }
              setCurrentStep={setCurrentStep}
              allRequiredPreviousStepsCompleted={
                allRequiredPreviousStepsCompleted
              }
            >
              <NavigationMenuSection
                enabledMenus={enabledMenus}
                setEnabledMenus={setEnabledMenus}
                customMenus={customMenus}
                setCustomMenus={setCustomMenus}
              />
            </AccordionItem>
          )}

          {/* Step 10: PnL Posters */}
          {areAllPreviousStepsCompleted(10) && (
            <AccordionItem
              title={
                STEPS_CONFIG.find(s => s.id === 10)?.title || "PnL Posters"
              }
              stepNumber={10}
              isOptional={
                STEPS_CONFIG.find(s => s.id === 10)?.isOptional || false
              }
              onNextInternal={() => handleNextStep(10)}
              isStepContentValidTest={true}
              isActive={currentStep === 10}
              isCompleted={!!completedSteps[10]}
              canOpen={
                allRequiredPreviousStepsCompleted(10) || !!completedSteps[10]
              }
              setCurrentStep={setCurrentStep}
              allRequiredPreviousStepsCompleted={
                allRequiredPreviousStepsCompleted
              }
            >
              <p className="text-xs text-gray-400 mb-4">
                Upload custom background images for PnL sharing posters. Users
                can share their trading performance with these backgrounds.{" "}
                <span className="text-primary-light">
                  You can upload up to 8 custom poster backgrounds.
                </span>{" "}
                Leave empty to use default poster designs.
              </p>
              <PnLPostersSection
                pnlPosters={pnlPosters}
                onChange={setPnlPosters}
              />
            </AccordionItem>
          )}
        </Form>

        {currentStep > TOTAL_STEPS &&
          completedSteps[TOTAL_STEPS] &&
          !isSaving && (
            <div className="mt-8 p-6 bg-success/10 border border-success/20 rounded-lg text-center slide-fade-in">
              <h3 className="text-lg font-semibold text-success mb-2">
                All steps completed!
              </h3>
              <p className="text-gray-300 mb-4">
                You're ready to create your DEX. Click the "Create Your DEX"
                button above to proceed.
              </p>
            </div>
          )}
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <h1 className="text-2xl md:text-3xl font-bold gradient-text">
          {dexData ? "Manage Your DEX" : "Create Your DEX"}
        </h1>
      </div>

      {!isAuthenticated && !isLoading ? (
        <div className="text-center mt-16">
          <Card className="p-8">
            <p className="text-lg mb-6">
              Please connect your wallet to create or manage your DEX.
            </p>
            <div className="flex justify-center">
              <WalletConnect />
            </div>
          </Card>
        </div>
      ) : (
        <div className="space-y-8">
          <Form
            onSubmit={handleSubmit}
            className="space-y-6"
            submitText={
              dexData && dexData.id
                ? "Update DEX Information"
                : "Create Your DEX"
            }
            isLoading={isSaving}
            loadingText="Saving"
            disabled={isForking || isDeleting}
          >
            <BrokerDetailsSection
              brokerName={brokerName}
              handleInputChange={handleInputChange}
              brokerNameValidator={brokerNameValidator}
            />

            {/* Branding Section: Add back H3 and P for Manage view */}
            <h3 className="text-md font-medium mb-3 mt-6 border-t border-light/10 pt-4">
              Branding{" "}
              <span className="text-gray-400 text-sm font-normal">
                (optional)
              </span>
            </h3>
            <p className="text-xs text-gray-400 mb-4">
              Customize your DEX with your own branding by pasting your logos
              below. Copy an image to your clipboard (from any image editor or
              browser), then click in the paste area and press Ctrl+V or ⌘+V.{" "}
              <span className="text-primary-light">
                All branding fields are optional.
              </span>
            </p>
            <BrandingSection
              primaryLogo={primaryLogo}
              secondaryLogo={secondaryLogo}
              favicon={favicon}
              handleImageChange={handleImageChange}
            />

            {/* Theme Customization Section: Add back wrapper div, H3, and P for Manage view */}
            <div className="mt-6 pt-4 border-t border-light/10">
              <h3 className="text-md font-medium mb-3">
                Theme Customization{" "}
                <span className="text-gray-400 text-sm font-normal">
                  (optional)
                </span>
              </h3>
              <p className="text-xs text-gray-400 mb-4">
                Customize your DEX's colors and theme by editing the CSS
                directly or describing how you want it to look for AI-assisted
                generation.{" "}
                <span className="text-primary-light">
                  Theme customization is completely optional - your DEX will
                  work great with the default theme.
                </span>
              </p>
              <ThemeCustomizationSection
                currentTheme={currentTheme}
                defaultTheme={defaultTheme}
                showThemeEditor={showThemeEditor}
                viewCssCode={viewCssCode}
                activeThemeTab={activeThemeTab}
                themePrompt={themePrompt}
                isGeneratingTheme={isGeneratingTheme}
                brokerName={brokerName}
                primaryLogo={primaryLogo}
                secondaryLogo={secondaryLogo}
                themeApplied={themeApplied}
                tradingViewColorConfig={tradingViewColorConfig}
                toggleThemeEditor={toggleThemeEditor}
                handleResetTheme={handleResetTheme}
                handleResetToDefault={handleResetToDefault}
                handleThemeEditorChange={handleThemeEditorChange}
                setViewCssCode={setViewCssCode}
                ThemeTabButton={ThemeTabButton}
                updateCssColor={updateCssColor}
                updateCssValue={updateCssValue}
                handleInputChange={handleInputChange}
                handleGenerateTheme={handleGenerateTheme}
                setTradingViewColorConfig={setTradingViewColorConfig}
                idPrefix="duplicate-"
              />
            </div>

            {/* PnL Posters Section */}
            <h3 className="text-md font-medium mb-3 mt-6 border-t border-light/10 pt-4">
              PnL Share Posters{" "}
              <span className="text-gray-400 text-sm font-normal">
                (optional)
              </span>
            </h3>
            <p className="text-xs text-gray-400 mb-4">
              Upload custom background images for PnL sharing posters. Users can
              share their trading performance with these backgrounds.{" "}
              <span className="text-primary-light">
                You can upload up to 8 custom poster backgrounds.
              </span>{" "}
              Leave empty to use default poster designs.
            </p>
            <PnLPostersSection
              pnlPosters={pnlPosters}
              onChange={setPnlPosters}
            />

            {/* Social Media Links Section: Add back H3 and P for Manage view */}
            <h3 className="text-md font-medium mb-3 mt-6 border-t border-light/10 pt-4">
              Social Media Links{" "}
              <span className="text-gray-400 text-sm font-normal">
                (optional)
              </span>
            </h3>
            <p className="text-xs text-gray-400 mb-4">
              Add social media links that will appear in your DEX footer.{" "}
              <span className="text-primary-light">
                All social media links are optional.
              </span>{" "}
              Leave empty if not applicable.
            </p>
            <SocialLinksSection
              telegramLink={telegramLink}
              discordLink={discordLink}
              xLink={xLink}
              handleInputChange={handleInputChange}
              urlValidator={urlValidator}
            />

            <h3 className="text-md font-medium mb-3 mt-6 border-t border-light/10 pt-4">
              Reown Configuration (formerly WalletConnect){" "}
              <span className="text-gray-400 text-sm font-normal">
                (optional)
              </span>
            </h3>
            <p className="text-xs text-gray-400 mb-4">
              Add your Reown Project ID to enable enhanced wallet connectivity
              functionality in your DEX.{" "}
              <span className="text-primary-light">
                This is completely optional - your DEX will work without it.
              </span>
            </p>
            <ReownConfigSection
              walletConnectProjectId={walletConnectProjectId}
              handleInputChange={handleInputChange}
            />

            <h3 className="text-md font-medium mb-3 mt-6 border-t border-light/10 pt-4">
              Privy Configuration{" "}
              <span className="text-gray-400 text-sm font-normal">
                (optional)
              </span>
            </h3>
            <p className="text-xs text-gray-400 mb-4">
              Add your Privy credentials to enable social login, email
              authentication, and other wallet connection options in your DEX.
              <span className="font-medium text-primary-light ml-1">
                This is completely optional. Only the App ID is required if you
                want to use Privy.
              </span>
              <br />
              <span className="block mt-1">
                To use WalletConnect through Privy, ensure your{" "}
                <strong>Reown Project ID</strong> (configured above) is
                provided. Privy utilizes this ID; separate WalletConnect setup
                in the Privy dashboard is not needed for this integration.
              </span>
            </p>
            <PrivyConfigSection
              privyAppId={privyAppId}
              privyTermsOfUse={privyTermsOfUse}
              handleInputChange={handleInputChange}
              urlValidator={urlValidator}
              enableAbstractWallet={enableAbstractWallet}
              onEnableAbstractWalletChange={setEnableAbstractWallet}
              disableEvmWallets={disableEvmWallets}
              disableSolanaWallets={disableSolanaWallets}
              onDisableEvmWalletsChange={setDisableEvmWallets}
              onDisableSolanaWalletsChange={setDisableSolanaWallets}
            />

            <div className="mb-4 mt-6 border-t border-light/10 pt-4">
              <label className="block text-md font-medium mb-3">
                Blockchain Configuration{" "}
                <span className="text-gray-400 text-sm font-normal">
                  (optional)
                </span>
              </label>
              <p className="text-xs text-gray-400 mb-4">
                Choose which blockchains your DEX will support for trading.{" "}
                <span className="text-primary-light">
                  This is optional - your DEX will support all available
                  blockchains by default.
                </span>
              </p>
              <BlockchainConfigSection
                chainIds={chainIds}
                onChainIdsChange={setChainIds}
                disableMainnet={disableMainnet}
                disableTestnet={disableTestnet}
                onDisableMainnetChange={setDisableMainnet}
                onDisableTestnetChange={setDisableTestnet}
              />
            </div>

            <div className="mb-4 mt-6 border-t border-light/10 pt-4">
              <label className="block text-md font-medium mb-3">
                Language Support{" "}
                <span className="text-gray-400 text-sm font-normal">
                  (optional)
                </span>
              </label>
              <p className="text-xs text-gray-400 mb-4">
                Select the languages you want to support in your DEX interface.{" "}
                <span className="text-primary-light">
                  This is optional - your DEX will default to English only.
                </span>
              </p>
              <LanguageSupportSection
                availableLanguages={availableLanguages}
                onAvailableLanguagesChange={setAvailableLanguages}
              />
            </div>

            <div className="mb-4 mt-6 border-t border-light/10 pt-4">
              <label className="block text-md font-medium mb-3">
                {" "}
                Navigation Menus{" "}
                <span className="text-gray-400 text-sm font-normal">
                  (optional)
                </span>
              </label>
              <p className="text-xs text-gray-400 mb-4">
                Customize which navigation links appear in your DEX.{" "}
                <span className="text-primary-light">
                  This is optional - your DEX will include all navigation menus
                  by default.
                </span>
              </p>
              <NavigationMenuSection
                enabledMenus={enabledMenus}
                setEnabledMenus={setEnabledMenus}
                customMenus={customMenus}
                setCustomMenus={setCustomMenus}
              />
            </div>
          </Form>

          {isGraduationEligible && !isGraduated && dexData && (
            <Card className="my-6 bg-gradient-to-r from-primary/20 to-secondary/20 border border-primary/30">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 bg-primary/20 p-2 rounded-full">
                    <div className="i-mdi:rocket-launch text-primary w-6 h-6"></div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-1">
                      Ready to Upgrade?
                    </h3>
                    <p className="text-gray-300">
                      Graduate your DEX to earn fee splits and provide rewards
                      for your traders.
                    </p>
                  </div>
                </div>
                <Link
                  to="/graduation"
                  className="btn-connect whitespace-nowrap flex-shrink-0"
                >
                  Upgrade Now
                </Link>
              </div>
            </Card>
          )}

          {isGraduated && dexData && (
            <Card className="my-6 bg-gradient-to-r from-success/20 to-primary/20 border border-success/30">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 bg-success/20 p-2 rounded-full">
                    <div className="i-mdi:check-badge text-success w-6 h-6"></div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-1">
                      Graduated DEX
                    </h3>
                    <p className="text-gray-300">
                      Your DEX is earning fee share revenue!{" "}
                      <a
                        href={
                          dexData.customDomain
                            ? `https://${dexData.customDomain}`
                            : deploymentUrl || "#"
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-light hover:underline inline-flex items-center"
                      >
                        Log in to your DEX
                        <div className="i-mdi:open-in-new h-3.5 w-3.5 ml-1"></div>
                      </a>{" "}
                      with your admin wallet to access and withdraw your
                      earnings.
                    </p>
                  </div>
                </div>
                <Link
                  to="/graduation"
                  className="px-4 py-2 bg-success/20 hover:bg-success/30 text-success font-medium rounded-full transition-colors whitespace-nowrap flex-shrink-0 flex items-center gap-2"
                >
                  <div className="i-mdi:cash-multiple h-4 w-4"></div>
                  View Benefits
                </Link>
              </div>
            </Card>
          )}

          {dexData?.repoUrl ? (
            <Card variant="success" className="mb-6">
              <h3 className="text-lg font-semibold mb-2">
                DEX Creation Status
              </h3>
              <p className="text-sm text-gray-300 mb-4">
                We've created the source code for your DEX! Here's what's
                happening now:
              </p>

              <div className="mb-4 p-3 bg-primary/10 rounded-lg border border-primary/20">
                <h4 className="text-md font-medium mb-2 flex items-center">
                  <div className="i-mdi:code-tags text-primary-light mr-2 h-5 w-5"></div>
                  Step 1: Source Code Created
                </h4>
                <p className="text-sm text-gray-300 mb-2">
                  We've created a GitHub repository containing all the code
                  needed for your DEX. Think of this as the blueprint for your
                  exchange:
                </p>
                <a
                  href={dexData.repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-light hover:underline break-all mb-1 flex items-center text-sm"
                >
                  <span className="break-all">{dexData.repoUrl}</span>
                  <div className="i-mdi:open-in-new h-4 w-4 ml-1 flex-shrink-0"></div>
                </a>
                <p className="text-xs text-gray-400 italic">
                  (You don't need to do anything with this link unless you're a
                  developer)
                </p>
              </div>

              {/* Show the deployment URL if available */}
              {deploymentUrl && deploymentConfirmed ? (
                <div className="mb-4 p-3 bg-success/10 rounded-lg border border-success/20 slide-fade-in">
                  <h4 className="text-md font-medium mb-2 flex items-center">
                    <div className="i-mdi:check-circle text-success mr-2 h-5 w-5"></div>
                    Step 2: Your DEX is Live!
                  </h4>
                  <p className="text-sm text-gray-300 mb-3">
                    Congratulations! Your DEX website is fully built and ready
                    to use. Your users can access it at:
                  </p>
                  <a
                    href={
                      dexData.customDomain
                        ? `https://${dexData.customDomain}`
                        : deploymentUrl
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary/20 hover:bg-primary/30 rounded text-primary-light transition-colors"
                  >
                    <span className="break-all">
                      {dexData.customDomain
                        ? dexData.customDomain
                        : deploymentUrl}
                    </span>
                    <div className="i-mdi:open-in-new h-4 w-4"></div>
                  </a>

                  {/* Show note about custom domain if active */}
                  {dexData.customDomain && (
                    <div className="mt-2 text-xs text-gray-400 flex items-start gap-1">
                      <div className="i-mdi:information-outline h-3.5 w-3.5 mt-0.5 flex-shrink-0"></div>
                      <span>
                        Your DEX is using a custom domain. The standard
                        deployment URL will no longer work correctly as the
                        build is now optimized for your custom domain.
                      </span>
                    </div>
                  )}

                  {/* Add note about domain update deployment for custom domain */}
                  {dexData.customDomain && (
                    <div className="mt-2 text-xs text-warning flex items-start gap-1">
                      <div className="i-mdi:alert-circle-outline h-3.5 w-3.5 mt-0.5 flex-shrink-0"></div>
                      <span>
                        Note: After changing any custom domain settings, you
                        must wait for a deployment to complete (check "Updates &
                        Deployment Status" below) for domain changes to take
                        effect.
                      </span>
                    </div>
                  )}

                  {/* Add the update explanation section */}
                  <div className="mt-4 pt-3 border-t border-light/10">
                    <h5 className="text-sm font-medium mb-2 flex items-center">
                      <div className="i-mdi:information-outline text-primary-light mr-2 h-4 w-4"></div>
                      Making Changes to Your DEX
                    </h5>
                    <p className="text-xs text-gray-300 mb-2">
                      When you update any information above (like your broker
                      name, logos, or social links):
                    </p>
                    <ul className="text-xs text-gray-300 list-disc ml-5 space-y-1">
                      <li>Your changes are first saved to our system</li>
                      <li>
                        An automatic update process (workflow) runs to rebuild
                        your DEX
                      </li>
                      <li>
                        Once complete, your changes will appear live on your DEX
                        website
                      </li>
                      <li>This process typically takes 2-5 minutes</li>
                    </ul>
                    <p className="text-xs text-gray-400 mt-2 italic">
                      You can track the progress of your updates in the
                      "Deployment Progress" section above
                    </p>
                  </div>
                </div>
              ) : (
                <div className="mb-4 p-3 bg-warning/10 rounded-lg border border-warning/20">
                  <h4 className="text-md font-medium mb-2 flex items-center">
                    <div className="i-mdi:progress-clock text-warning mr-2 h-5 w-5"></div>
                    Step 2: Building Your DEX Website
                  </h4>
                  <p className="text-sm text-gray-300 mb-2">
                    We're currently building your DEX website from the source
                    code. This process usually takes 2-5 minutes to complete.
                  </p>
                  <p className="text-xs text-gray-400 mb-3">
                    Once complete, you'll see a link to your live DEX here.
                  </p>

                  {/* Add note about future changes */}
                  <div className="mt-3 pt-3 border-t border-light/10">
                    <h5 className="text-sm font-medium mb-2 flex items-center">
                      <div className="i-mdi:information-outline text-warning mr-2 h-4 w-4"></div>
                      About Future Updates
                    </h5>
                    <p className="text-xs text-gray-300">
                      Whenever you make changes to your DEX (updating logos,
                      social links, etc.), this same build process will run
                      again. Your changes will be live after the process
                      completes, which typically takes 2-5 minutes.
                    </p>
                  </div>
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-light/10">
                <h4 className="text-md font-medium mb-3">
                  Updates & Deployment Status
                </h4>
                <p className="text-xs text-gray-400 mb-3">
                  This shows the current status of your DEX updates. When the
                  latest run shows "completed", your changes are live on your
                  DEX website:
                </p>
                <WorkflowStatus
                  dexId={dexData.id}
                  workflowName="Deploy to GitHub Pages"
                  onSuccessfulDeployment={handleSuccessfulDeployment}
                />
              </div>
            </Card>
          ) : dexData && dexData.id && !dexData.repoUrl ? (
            // Repository creation failed but DEX was created
            // Show retry button
            <Card variant="error" className="mb-6">
              <p className="text-sm text-gray-300 mb-2">
                <span className="text-red-300 font-medium">⚠️ Note:</span> Your
                DEX configuration was saved, but we couldn't create your
                repository.
              </p>
              <p className="text-sm text-gray-300 mb-4">
                You can retry the repository creation now.
              </p>
              <Button
                onClick={handleRetryForking}
                disabled={isForking}
                variant="danger"
                size="sm"
                isLoading={isForking}
                loadingText="Retrying..."
              >
                Retry Repository Creation
              </Button>
            </Card>
          ) : null}

          {dexData && dexData.id && (
            <>
              {/* Custom Domain Configuration */}
              <div className="mt-8 pt-6 border-t border-light/10">
                <h3 className="text-lg font-medium mb-4">
                  Custom Domain Setup
                </h3>
                <Card className="mb-6">
                  <h4 className="text-md font-medium mb-3">Custom Domain</h4>
                  <p className="text-sm text-gray-300 mb-4">
                    Deploy your DEX to your own domain instead of using the
                    default GitHub Pages URL. You'll need to configure your
                    domain's DNS settings to point to GitHub Pages.
                  </p>

                  {/* Add TradingView license warning */}
                  <div className="mb-4 p-3 bg-red-900/30 rounded-lg border border-red-500/30">
                    <h5 className="text-sm font-medium mb-2 flex items-center">
                      <div className="i-mdi:alert h-4 w-4 mr-2 text-red-400"></div>
                      Important License Requirement
                    </h5>
                    <p className="text-xs text-gray-300 mb-2">
                      When using your own custom domain, you are required to
                      apply for your own
                      <strong> TradingView Advanced Charts license</strong>. The
                      default license only covers the default domain.
                    </p>
                    <a
                      href="https://www.tradingview.com/advanced-charts/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary-light hover:underline flex items-center"
                    >
                      Apply for TradingView Advanced Charts license
                      <div className="i-mdi:open-in-new h-3.5 w-3.5 ml-1"></div>
                    </a>
                  </div>

                  {dexData.customDomain ? (
                    <div className="mb-4">
                      <div className="flex flex-col md:flex-row gap-3 items-start md:items-center mb-4">
                        <div className="bg-success/10 text-success px-3 py-1 rounded-full text-sm flex items-center">
                          <div className="i-mdi:check-circle h-4 w-4 mr-1"></div>
                          Domain Configured
                        </div>
                        <div className="text-sm">
                          Your DEX is available at{" "}
                          <a
                            href={`https://${dexData.customDomain}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary-light hover:underline inline-flex items-center"
                          >
                            {dexData.customDomain}
                            <div className="i-mdi:open-in-new h-3.5 w-3.5 ml-1"></div>
                          </a>
                        </div>
                      </div>

                      <div className="bg-info/10 rounded-lg border border-info/20 p-4 mb-4">
                        <h5 className="text-sm font-medium mb-2 flex items-center">
                          <div className="i-mdi:information-outline text-info mr-2 h-4 w-4"></div>
                          DNS Configuration Status
                        </h5>
                        <p className="text-sm text-gray-300 mb-3">
                          It may take up to 24 hours for DNS changes to
                          propagate. If your domain is not working yet, please
                          check back later.
                        </p>
                        <div className="flex justify-start">
                          <Button
                            onClick={handleShowDomainRemoveConfirm}
                            variant="danger"
                            size="sm"
                            isLoading={isSaving}
                            loadingText="Removing..."
                            disabled={isSaving}
                          >
                            <span className="flex items-center gap-1">
                              <div className="i-mdi:delete h-4 w-4"></div>
                              Remove Custom Domain
                            </span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="mb-4">
                      <div className="mb-4">
                        <label
                          htmlFor="customDomain"
                          className="block text-sm font-medium mb-1"
                        >
                          Domain Name
                        </label>
                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-2">
                          <input
                            id="customDomain"
                            type="text"
                            value={customDomain}
                            onChange={e => setCustomDomain(e.target.value)}
                            placeholder="example.com"
                            className="flex-1 bg-background-dark/80 border border-light/10 rounded px-3 py-2 text-sm focus:ring-1 focus:ring-primary-light focus:border-primary-light"
                          />
                          <Button
                            onClick={() => {
                              // Validate domain format
                              const domainRegex =
                                /^([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
                              if (!domainRegex.test(customDomain)) {
                                toast.error(
                                  "Please enter a valid domain name (e.g., example.com)"
                                );
                                return;
                              }

                              setIsSaving(true);

                              post(
                                `api/dex/${dexData.id}/custom-domain`,
                                { domain: customDomain },
                                token
                              )
                                .then(() => {
                                  setDexData({
                                    ...dexData,
                                    customDomain: customDomain,
                                  });
                                  toast.success(
                                    "Custom domain configured successfully"
                                  );
                                })
                                .catch(error => {
                                  console.error(
                                    "Error setting custom domain:",
                                    error
                                  );
                                  toast.error("Failed to set custom domain");
                                })
                                .finally(() => {
                                  setIsSaving(false);
                                });
                            }}
                            variant="primary"
                            size="sm"
                            isLoading={isSaving}
                            loadingText="Saving..."
                            disabled={!customDomain || isSaving}
                            className="w-full sm:w-auto"
                          >
                            <span className="flex items-center gap-1 justify-center sm:justify-start">
                              <div className="i-mdi:link h-4 w-4"></div>
                              Set Domain
                            </span>
                          </Button>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                          Enter your domain without 'http://' or 'https://'
                          (e.g., example.com)
                        </p>
                      </div>
                    </div>
                  )}

                  {/* DNS Setup Instructions - Always show */}
                  <div className="rounded-lg border border-light/10 p-4 bg-base-8/50">
                    <h5 className="text-sm font-medium mb-3 flex items-center">
                      <div className="i-mdi:dns h-4 w-4 mr-2 text-primary-light"></div>
                      DNS Configuration Instructions
                    </h5>
                    <p className="text-sm text-gray-300 mb-3">
                      To use a custom domain, you'll need to configure your
                      domain's DNS settings:
                    </p>
                    <div className="bg-base-9/70 rounded p-3 font-mono text-xs overflow-x-auto mb-3">
                      <div className="mb-1 text-gray-400">
                        Add a{" "}
                        <span className="text-primary-light">CNAME record</span>{" "}
                        with the following values:
                      </div>
                      <div className="flex items-center">
                        <span className="text-gray-400">Name:</span>{" "}
                        {dexData.customDomain &&
                        dexData.customDomain.split(".").length > 2 ? (
                          <div className="flex items-center">
                            <span className="text-white">
                              {dexData.customDomain.split(".")[0]}
                            </span>
                            <button
                              className="ml-1.5 text-gray-400 hover:text-primary-light transition-colors"
                              onClick={() => {
                                navigator.clipboard.writeText(
                                  dexData.customDomain?.split(".")[0] || ""
                                );
                                toast.success("Copied to clipboard");
                              }}
                              aria-label="Copy subdomain name to clipboard"
                            >
                              <div className="i-mdi:content-copy h-3.5 w-3.5"></div>
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center">
                            <span className="text-white">@</span>
                            <button
                              className="ml-1.5 text-gray-400 hover:text-primary-light transition-colors"
                              onClick={() => {
                                navigator.clipboard.writeText("@");
                                toast.success("Copied to clipboard");
                              }}
                              aria-label="Copy @ symbol to clipboard"
                            >
                              <div className="i-mdi:content-copy h-3.5 w-3.5"></div>
                            </button>{" "}
                            or <span className="text-white">subdomain</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center">
                        <span className="text-gray-400">Value:</span>{" "}
                        <div className="flex items-center">
                          <span className="text-white">
                            orderlynetworkdexcreator.github.io
                          </span>
                          <button
                            className="ml-1.5 text-gray-400 hover:text-primary-light transition-colors"
                            onClick={() => {
                              navigator.clipboard.writeText(
                                "orderlynetworkdexcreator.github.io"
                              );
                              toast.success("Copied to clipboard");
                            }}
                            aria-label="Copy domain value to clipboard"
                          >
                            <div className="i-mdi:content-copy h-3.5 w-3.5"></div>
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <span className="text-gray-400">TTL:</span>{" "}
                        <div className="flex items-center">
                          <span className="text-white">3600</span>
                          <button
                            className="ml-1.5 text-gray-400 hover:text-primary-light transition-colors"
                            onClick={() => {
                              navigator.clipboard.writeText("3600");
                              toast.success("Copied to clipboard");
                            }}
                            aria-label="Copy TTL value to clipboard"
                          >
                            <div className="i-mdi:content-copy h-3.5 w-3.5"></div>
                          </button>{" "}
                          (or automatic)
                        </div>
                      </div>
                    </div>

                    {/* Add deployment info card */}
                    <div className="mb-3 p-3 bg-info/10 rounded-lg border border-info/20">
                      <h6 className="text-xs font-medium mb-2 flex items-center">
                        <div className="i-mdi:information-outline h-3.5 w-3.5 mr-1.5 text-info"></div>
                        Important: About Domain Updates
                      </h6>
                      <p className="text-xs text-gray-300">
                        After adding or removing a custom domain, a deployment
                        process must complete for the changes to take effect.
                        Your domain will not work correctly until this process
                        finishes (usually 2-5 minutes).
                      </p>
                      <p className="text-xs text-gray-300 mt-1">
                        You can monitor the deployment status in the "Updates &
                        Deployment Status" section below.
                      </p>
                    </div>

                    <div className="text-xs text-gray-400">
                      {dexData.customDomain &&
                      dexData.customDomain.split(".").length > 2 ? (
                        <div className="flex items-start gap-1 mb-1">
                          <div className="i-mdi:information-outline h-3.5 w-3.5 mt-0.5 flex-shrink-0"></div>
                          <span>
                            You've configured a subdomain (
                            {dexData.customDomain.split(".")[0]}.
                            {dexData.customDomain.split(".").slice(1).join(".")}
                            ). Use the exact subdomain name shown above in the
                            Name field.
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-start gap-1 mb-1">
                          <div className="i-mdi:information-outline h-3.5 w-3.5 mt-0.5 flex-shrink-0"></div>
                          <span>
                            For subdomain setups (e.g., dex.yourdomain.com), set
                            the Name field to your subdomain.
                          </span>
                        </div>
                      )}
                      <div className="flex items-start gap-1">
                        <div className="i-mdi:clock-outline h-3.5 w-3.5 mt-0.5 flex-shrink-0"></div>
                        <span>
                          DNS changes can take up to 24 hours to propagate
                          globally, though they often complete within a few
                          hours.
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Danger Zone card */}
              <div className="mt-8 pt-6 border-t border-primary-light/10">
                <Card variant="error">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                    <div>
                      <h3 className="text-lg font-semibold text-red-500">
                        Danger Zone
                      </h3>
                      <p className="text-sm text-gray-400 mt-1">
                        This action permanently deletes your DEX and its GitHub
                        repository.
                      </p>
                    </div>
                    <Button
                      variant="danger"
                      onClick={handleShowDeleteConfirm}
                      className="mt-4 md:mt-0 shrink-0"
                      disabled={isDeleting || isLoading || isSaving}
                    >
                      Delete DEX
                    </Button>
                  </div>
                </Card>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
