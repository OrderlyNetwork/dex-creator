import { useState, useCallback, useEffect } from "react";
import { post, get } from "../utils/apiClient";
import { toast } from "react-toastify";
import { defaultTheme, DexData } from "../types/dex";
import {
  validateUrl,
  required,
  minLength,
  maxLength,
  composeValidators,
  alphanumericWithSpecialChars,
  alphanumeric,
  optionalMinLength,
} from "../utils/validation";
import { useThemeCSS } from "./useThemeCSS";
import { ModalType } from "../context/ModalContext";
import { useDistributorCode } from "./useDistrubutorInfo";
import { useDistributor } from "../context/DistributorContext";
import { DexPreviewProps } from "../components/DexPreview";

const base64ToBlob = async (base64: string): Promise<Blob> => {
  const response = await fetch(base64);
  return response.blob();
};

const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.readAsDataURL(blob);
  });
};

export interface DexSectionProps {
  brokerName: string;
  handleInputChange: (
    field: string
  ) => (e: React.ChangeEvent<HTMLInputElement>) => void;
  brokerNameValidator: (value: string) => string | null;
  primaryLogo: Blob | null;
  secondaryLogo: Blob | null;
  favicon: Blob | null;
  handleImageChange: (field: string) => (blob: Blob | null) => void;
  currentTheme: string | null;
  defaultTheme: string;
  savedTheme: string | null;
  showThemeEditor: boolean;
  viewCssCode: boolean;
  themePrompt: string;
  isGeneratingTheme: boolean;
  tradingViewColorConfig: string | null;
  toggleThemeEditor: () => void;
  handleResetTheme: () => void;
  handleResetToDefault: () => void;
  handleThemeEditorChange: (value: string) => void;
  setViewCssCode: (value: boolean) => void;
  ThemeTabButton: React.FC<{
    tab: "colors" | "fonts" | "rounded" | "spacing" | "tradingview";
    label: string;
  }>;
  updateCssColor: (variableName: string, newColorHex: string) => void;
  updateCssValue: (variableName: string, newValue: string) => void;
  setTradingViewColorConfig: (config: string | null) => void;
  pnlPosters: (Blob | null)[];
  handlePnLPosterChange: (posters: (Blob | null)[]) => void;
  telegramLink: string;
  discordLink: string;
  xLink: string;
  urlValidator: (value: string) => string | null;
  seoSiteName: string;
  seoSiteDescription: string;
  seoSiteLanguage: string;
  seoSiteLocale: string;
  seoTwitterHandle: string;
  seoThemeColor: string;
  seoKeywords: string;
  analyticsScript: string;
  walletConnectProjectId: string;
  privyAppId: string;
  privyTermsOfUse: string;
  enableAbstractWallet: boolean;
  onEnableAbstractWalletChange: (value: boolean) => void;
  disableEvmWallets: boolean;
  disableSolanaWallets: boolean;
  enableServiceDisclaimerDialog: boolean;
  onDisableEvmWalletsChange: (value: boolean) => void;
  onDisableSolanaWalletsChange: (value: boolean) => void;
  onEnableServiceDisclaimerDialogChange: (value: boolean) => void;
  privyLoginMethods: string[];
  onPrivyLoginMethodsChange: (methods: string[]) => void;
  chainIds: number[];
  onChainIdsChange: (chainIds: number[]) => void;
  defaultChain?: number;
  onDefaultChainChange?: (chainId: number | undefined) => void;
  disableMainnet: boolean;
  disableTestnet: boolean;
  onDisableMainnetChange: (value: boolean) => void;
  onDisableTestnetChange: (value: boolean) => void;
  availableLanguages: string[];
  onAvailableLanguagesChange: (languages: string[]) => void;
  enabledMenus: string;
  setEnabledMenus: (menus: string) => void;
  customMenus: string;
  setCustomMenus: (menus: string) => void;
  enableCampaigns: boolean;
  setEnableCampaigns: (value: boolean) => void;
  swapFeeBps: number | null;
  setSwapFeeBps: (value: number | null) => void;
  symbolList: string;
  setSymbolList: (value: string) => void;
  restrictedRegions: string;
  onRestrictedRegionsChange: (value: string) => void;
  whitelistedIps: string;
  onWhitelistedIpsChange: (value: string) => void;
  distributorCode: string;
  distributorCodeValidator: (value: string) => string | null;
}

export interface DexFormData {
  brokerName: string;
  telegramLink: string;
  discordLink: string;
  xLink: string;
  walletConnectProjectId: string;
  privyAppId: string;
  privyTermsOfUse: string;
  privyLoginMethods: string[];
  enabledMenus: string;
  customMenus: string;
  enableAbstractWallet: boolean;
  enableServiceDisclaimerDialog: boolean;
  enableCampaigns: boolean;
  swapFeeBps: number | null;
  primaryLogo: Blob | null;
  secondaryLogo: Blob | null;
  favicon: Blob | null;
  pnlPosters: (Blob | null)[];
  themePrompt: string;
  currentTheme: string | null;
  chainIds: number[];
  defaultChain: number | undefined;
  disableMainnet: boolean;
  disableTestnet: boolean;
  disableEvmWallets: boolean;
  disableSolanaWallets: boolean;
  tradingViewColorConfig: string | null;
  availableLanguages: string[];
  seoSiteName: string;
  seoSiteDescription: string;
  seoSiteLanguage: string;
  seoSiteLocale: string;
  seoTwitterHandle: string;
  seoThemeColor: string;
  seoKeywords: string;
  analyticsScript: string;
  symbolList: string;
  restrictedRegions: string;
  whitelistedIps: string;
  distributorCode: string;
}

export interface UseDexFormReturn extends DexFormData {
  brokerNameValidator: (value: string) => string | null;
  urlValidator: (value: string) => string | null;
  dexData: DexData | null;
  setDexData: (data: DexData | null) => void;
  updateDexData: (
    token: string | null,
    dexId?: string
  ) => Promise<DexData | null>;
  setDistributorCode: (value: string) => void;
  setBrokerName: (value: string) => void;
  setTelegramLink: (value: string) => void;
  setDiscordLink: (value: string) => void;
  setXLink: (value: string) => void;
  setWalletConnectProjectId: (value: string) => void;
  setPrivyAppId: (value: string) => void;
  setPrivyTermsOfUse: (value: string) => void;
  setPrivyLoginMethods: (value: string[]) => void;
  setEnabledMenus: (value: string) => void;
  setCustomMenus: (value: string) => void;
  setEnableAbstractWallet: (value: boolean) => void;
  setEnableServiceDisclaimerDialog: (value: boolean) => void;
  setEnableCampaigns: (value: boolean) => void;
  setSwapFeeBps: (value: number | null) => void;
  setPrimaryLogo: (value: Blob | null) => void;
  setSecondaryLogo: (value: Blob | null) => void;
  setFavicon: (value: Blob | null) => void;
  setPnlPosters: (value: (Blob | null)[]) => void;
  setThemePrompt: (value: string) => void;
  setCurrentTheme: (value: string | null) => void;
  setChainIds: (value: number[]) => void;
  setDefaultChain: (value: number | undefined) => void;
  setDisableMainnet: (value: boolean) => void;
  setDisableTestnet: (value: boolean) => void;
  setDisableEvmWallets: (value: boolean) => void;
  setDisableSolanaWallets: (value: boolean) => void;
  setTradingViewColorConfig: (value: string | null) => void;
  setAvailableLanguages: (value: string[]) => void;
  setSeoSiteName: (value: string) => void;
  setSeoSiteDescription: (value: string) => void;
  setSeoSiteLanguage: (value: string) => void;
  setSeoSiteLocale: (value: string) => void;
  setSeoTwitterHandle: (value: string) => void;
  setSeoThemeColor: (value: string) => void;
  setSeoKeywords: (value: string) => void;
  setAnalyticsScript: (value: string) => void;
  setSymbolList: (value: string) => void;
  setRestrictedRegions: (value: string) => void;
  setWhitelistedIps: (value: string) => void;
  handleInputChange: (
    field: string
  ) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleImageChange: (field: string) => (blob: Blob | null) => void;
  handlePnLPosterChange: (posters: (Blob | null)[]) => void;
  populateFromDexData: (
    dexData: Omit<Partial<DexFormData>, "privyLoginMethods"> & {
      privyLoginMethods?: string | string[] | null;
      themeCSS?: string | null;
    }
  ) => void;
  loadImagesFromBase64: (images: {
    primaryLogo?: string | null;
    secondaryLogo?: string | null;
    favicon?: string | null;
    pnlPosters?: string[] | null;
  }) => Promise<void>;
  getFormDataWithBase64Images: () => Promise<{
    formData: Omit<
      DexFormData,
      "primaryLogo" | "secondaryLogo" | "favicon" | "pnlPosters"
    >;
    images: {
      primaryLogo?: string | null;
      secondaryLogo?: string | null;
      favicon?: string | null;
      pnlPosters?: (string | null)[];
    };
  }>;
  generateTheme: (
    token: string,
    originalThemeCSS: string | null | undefined,
    onApply: (theme: string) => void,
    onCancel: () => void,
    openModal: (type: ModalType, props?: Record<string, unknown>) => void,
    prompt?: string,
    previewProps?: DexPreviewProps,
    viewMode?: "desktop" | "mobile"
  ) => Promise<void>;
  resetTheme: (originalThemeCSS: string | null | undefined) => void;
  resetThemeToDefault: () => void;
  resetForm: () => void;
  showThemeEditor: boolean;
  setShowThemeEditor: (value: boolean) => void;
  viewCssCode: boolean;
  setViewCssCode: (value: boolean) => void;
  isGeneratingTheme: boolean;
  setIsGeneratingTheme: (value: boolean) => void;
  toggleThemeEditor: () => void;
  handleThemeEditorChange: (value: string) => void;
  handleUpdateCssValue: (variableName: string, newValue: string) => void;
  handleUpdateCssColor: (variableName: string, newColorHex: string) => void;
  getSectionProps: (additionalProps: {
    handleResetTheme: () => void;
    handleResetToDefault: () => void;
    ThemeTabButton: React.FC<{
      tab: "colors" | "fonts" | "rounded" | "spacing" | "tradingview";
      label: string;
    }>;
  }) => DexSectionProps;
  distributorCodeValidator: (value: string) => string | null;
}

const initialFormState: DexFormData = {
  brokerName: "",
  telegramLink: "",
  discordLink: "",
  xLink: "",
  walletConnectProjectId: "",
  privyAppId: "",
  privyTermsOfUse: "",
  privyLoginMethods: ["email"],
  enabledMenus: "",
  customMenus: "",
  enableAbstractWallet: false,
  enableServiceDisclaimerDialog: false,
  enableCampaigns: false,
  swapFeeBps: null,
  primaryLogo: null,
  secondaryLogo: null,
  favicon: null,
  pnlPosters: [],
  themePrompt: "",
  currentTheme: null,
  chainIds: [],
  defaultChain: undefined,
  disableMainnet: false,
  disableTestnet: false,
  disableEvmWallets: false,
  disableSolanaWallets: false,
  tradingViewColorConfig: null,
  availableLanguages: [],
  seoSiteName: "",
  seoSiteDescription: "",
  seoSiteLanguage: "",
  seoSiteLocale: "",
  seoTwitterHandle: "",
  seoThemeColor: "",
  seoKeywords: "",
  analyticsScript: "",
  symbolList: "",
  restrictedRegions: "",
  whitelistedIps: "",
  distributorCode: "",
};

export function useDexForm(): UseDexFormReturn {
  const [dexData, setDexData] = useState<DexData | null>(null);
  const [showThemeEditor, setShowThemeEditor] = useState(false);
  const [viewCssCode, setViewCssCode] = useState(false);
  const [isGeneratingTheme, setIsGeneratingTheme] = useState(false);

  const { updateCssValue, updateCssColor } = useThemeCSS(defaultTheme);

  const brokerNameValidator = composeValidators(
    required("Broker name"),
    minLength(3, "Broker name"),
    maxLength(30, "Broker name"),
    alphanumericWithSpecialChars("Broker name")
  );

  const distributorCodeValidator = composeValidators(
    optionalMinLength(4, "Distributor code"),
    maxLength(10, "Distributor code"),
    alphanumeric("Distributor code")
  );

  const urlValidator = validateUrl();

  const [brokerName, setBrokerName] = useState(initialFormState.brokerName);
  const [telegramLink, setTelegramLink] = useState(
    initialFormState.telegramLink
  );
  const [discordLink, setDiscordLink] = useState(initialFormState.discordLink);
  const [xLink, setXLink] = useState(initialFormState.xLink);
  const [walletConnectProjectId, setWalletConnectProjectId] = useState(
    initialFormState.walletConnectProjectId
  );
  const [privyAppId, setPrivyAppId] = useState(initialFormState.privyAppId);
  const [privyTermsOfUse, setPrivyTermsOfUse] = useState(
    initialFormState.privyTermsOfUse
  );
  const [privyLoginMethods, setPrivyLoginMethods] = useState(
    initialFormState.privyLoginMethods
  );
  const [enabledMenus, setEnabledMenus] = useState(
    initialFormState.enabledMenus
  );
  const [customMenus, setCustomMenus] = useState(initialFormState.customMenus);
  const [enableAbstractWallet, setEnableAbstractWallet] = useState(
    initialFormState.enableAbstractWallet
  );
  const [enableServiceDisclaimerDialog, setEnableServiceDisclaimerDialog] =
    useState(initialFormState.enableServiceDisclaimerDialog);
  const [enableCampaigns, setEnableCampaigns] = useState(
    initialFormState.enableCampaigns
  );
  const [swapFeeBps, setSwapFeeBps] = useState(initialFormState.swapFeeBps);
  const [primaryLogo, setPrimaryLogo] = useState(initialFormState.primaryLogo);
  const [secondaryLogo, setSecondaryLogo] = useState(
    initialFormState.secondaryLogo
  );
  const [favicon, setFavicon] = useState(initialFormState.favicon);
  const [pnlPosters, setPnlPosters] = useState(initialFormState.pnlPosters);
  const [themePrompt, setThemePrompt] = useState(initialFormState.themePrompt);
  const [currentTheme, setCurrentTheme] = useState(
    initialFormState.currentTheme
  );
  const [chainIds, setChainIds] = useState(initialFormState.chainIds);
  const [defaultChain, setDefaultChain] = useState(
    initialFormState.defaultChain
  );
  const [disableMainnet, setDisableMainnet] = useState(
    initialFormState.disableMainnet
  );
  const [disableTestnet, setDisableTestnet] = useState(
    initialFormState.disableTestnet
  );
  const [disableEvmWallets, setDisableEvmWallets] = useState(
    initialFormState.disableEvmWallets
  );
  const [disableSolanaWallets, setDisableSolanaWallets] = useState(
    initialFormState.disableSolanaWallets
  );
  const [tradingViewColorConfig, setTradingViewColorConfig] = useState(
    initialFormState.tradingViewColorConfig
  );
  const [availableLanguages, setAvailableLanguages] = useState(
    initialFormState.availableLanguages
  );
  const [seoSiteName, setSeoSiteName] = useState(initialFormState.seoSiteName);
  const [seoSiteDescription, setSeoSiteDescription] = useState(
    initialFormState.seoSiteDescription
  );
  const [seoSiteLanguage, setSeoSiteLanguage] = useState(
    initialFormState.seoSiteLanguage
  );
  const [seoSiteLocale, setSeoSiteLocale] = useState(
    initialFormState.seoSiteLocale
  );
  const [seoTwitterHandle, setSeoTwitterHandle] = useState(
    initialFormState.seoTwitterHandle
  );
  const [seoThemeColor, setSeoThemeColor] = useState(
    initialFormState.seoThemeColor
  );
  const [seoKeywords, setSeoKeywords] = useState(initialFormState.seoKeywords);
  const [analyticsScript, setAnalyticsScript] = useState(
    initialFormState.analyticsScript
  );
  const [symbolList, setSymbolList] = useState(initialFormState.symbolList);
  const [restrictedRegions, setRestrictedRegions] = useState(
    initialFormState.restrictedRegions
  );
  const [whitelistedIps, setWhitelistedIps] = useState(
    initialFormState.whitelistedIps
  );

  const urlDistributorCode = useDistributorCode();

  const [distributorCode, setDistributorCode] = useState(
    urlDistributorCode?.toLocaleUpperCase() || initialFormState.distributorCode
  );

  const { distributorInfo } = useDistributor();

  useEffect(() => {
    if (distributorInfo?.distributor_name) {
      setDistributorCode(distributorInfo.distributor_name);
    }
  }, [distributorInfo]);

  const handleInputChange =
    (field: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
        case "seoSiteName":
          setSeoSiteName(value);
          break;
        case "seoSiteDescription":
          setSeoSiteDescription(value);
          break;
        case "seoSiteLanguage":
          setSeoSiteLanguage(value);
          break;
        case "seoSiteLocale":
          setSeoSiteLocale(value);
          break;
        case "seoTwitterHandle":
          setSeoTwitterHandle(value);
          break;
        case "seoThemeColor":
          setSeoThemeColor(value);
          break;
        case "seoKeywords":
          setSeoKeywords(value);
          break;
        case "analyticsScript":
          setAnalyticsScript(value);
          break;
        case "symbolList":
          setSymbolList(value);
          break;
        case "distributorCode":
          setDistributorCode(value?.toLocaleUpperCase());
          break;
      }
    };

  const handleImageChange = (field: string) => (blob: Blob | null) => {
    switch (field) {
      case "primaryLogo":
        setPrimaryLogo(blob);
        break;
      case "secondaryLogo":
        setSecondaryLogo(blob);
        break;
      case "favicon":
        setFavicon(blob);
        break;
    }
  };

  const handlePnLPosterChange = (posters: (Blob | null)[]) => {
    setPnlPosters(posters);
  };

  const populateFromDexData = useCallback(
    (
      dexData: Omit<Partial<DexFormData>, "privyLoginMethods"> & {
        privyLoginMethods?: string | string[] | null;
        themeCSS?: string | null;
      }
    ) => {
      if (dexData.brokerName !== undefined) setBrokerName(dexData.brokerName);
      if (dexData.telegramLink !== undefined)
        setTelegramLink(dexData.telegramLink);
      if (dexData.discordLink !== undefined)
        setDiscordLink(dexData.discordLink);
      if (dexData.xLink !== undefined) setXLink(dexData.xLink);
      if (dexData.walletConnectProjectId !== undefined)
        setWalletConnectProjectId(dexData.walletConnectProjectId);
      if (dexData.privyAppId !== undefined) setPrivyAppId(dexData.privyAppId);
      if (dexData.privyTermsOfUse !== undefined)
        setPrivyTermsOfUse(dexData.privyTermsOfUse);
      if (dexData.privyLoginMethods !== undefined) {
        if (typeof dexData.privyLoginMethods === "string") {
          setPrivyLoginMethods(
            dexData.privyLoginMethods.split(",").filter(Boolean)
          );
        } else {
          setPrivyLoginMethods(dexData.privyLoginMethods || ["email"]);
        }
      }
      if (dexData.enabledMenus !== undefined)
        setEnabledMenus(dexData.enabledMenus);
      if (dexData.customMenus !== undefined)
        setCustomMenus(dexData.customMenus);
      if (dexData.enableAbstractWallet !== undefined)
        setEnableAbstractWallet(dexData.enableAbstractWallet);
      if (dexData.enableServiceDisclaimerDialog !== undefined)
        setEnableServiceDisclaimerDialog(dexData.enableServiceDisclaimerDialog);
      if (dexData.enableCampaigns !== undefined)
        setEnableCampaigns(dexData.enableCampaigns);
      if (dexData.swapFeeBps !== undefined) setSwapFeeBps(dexData.swapFeeBps);
      if (dexData.chainIds !== undefined) setChainIds(dexData.chainIds);
      if (dexData.defaultChain !== undefined)
        setDefaultChain(dexData.defaultChain);
      if (dexData.disableMainnet !== undefined)
        setDisableMainnet(dexData.disableMainnet);
      if (dexData.disableTestnet !== undefined)
        setDisableTestnet(dexData.disableTestnet);
      if (dexData.disableEvmWallets !== undefined)
        setDisableEvmWallets(dexData.disableEvmWallets);
      if (dexData.disableSolanaWallets !== undefined)
        setDisableSolanaWallets(dexData.disableSolanaWallets);
      if (dexData.tradingViewColorConfig !== undefined)
        setTradingViewColorConfig(dexData.tradingViewColorConfig);
      if (dexData.availableLanguages !== undefined)
        setAvailableLanguages(dexData.availableLanguages);
      if (dexData.seoSiteName !== undefined)
        setSeoSiteName(dexData.seoSiteName);
      if (dexData.seoSiteDescription !== undefined)
        setSeoSiteDescription(dexData.seoSiteDescription);
      if (dexData.seoSiteLanguage !== undefined)
        setSeoSiteLanguage(dexData.seoSiteLanguage);
      if (dexData.seoSiteLocale !== undefined)
        setSeoSiteLocale(dexData.seoSiteLocale);
      if (dexData.seoTwitterHandle !== undefined)
        setSeoTwitterHandle(dexData.seoTwitterHandle);
      if (dexData.seoThemeColor !== undefined)
        setSeoThemeColor(dexData.seoThemeColor);
      if (dexData.seoKeywords !== undefined)
        setSeoKeywords(dexData.seoKeywords);
      if (dexData.analyticsScript !== undefined)
        setAnalyticsScript(dexData.analyticsScript);
      if (dexData.symbolList !== undefined) setSymbolList(dexData.symbolList);
      if (dexData.restrictedRegions !== undefined)
        setRestrictedRegions(dexData.restrictedRegions);
      if (dexData.whitelistedIps !== undefined)
        setWhitelistedIps(dexData.whitelistedIps);

      if (dexData.themeCSS !== undefined) {
        setCurrentTheme(dexData.themeCSS);
      }
    },
    []
  );

  const loadImagesFromBase64 = useCallback(
    async (images: {
      primaryLogo?: string | null;
      secondaryLogo?: string | null;
      favicon?: string | null;
      pnlPosters?: string[] | null;
    }) => {
      if (images.primaryLogo) {
        setPrimaryLogo(await base64ToBlob(images.primaryLogo));
      }
      if (images.secondaryLogo) {
        setSecondaryLogo(await base64ToBlob(images.secondaryLogo));
      }
      if (images.favicon) {
        setFavicon(await base64ToBlob(images.favicon));
      }
      if (images.pnlPosters) {
        const posterBlobs = await Promise.all(
          images.pnlPosters.map(poster =>
            poster ? base64ToBlob(poster) : Promise.resolve(null)
          )
        );
        setPnlPosters(posterBlobs);
      }
    },
    []
  );

  const getFormDataWithBase64Images = useCallback(async () => {
    const [
      primaryLogoBase64,
      secondaryLogoBase64,
      faviconBase64,
      pnlPostersBase64,
    ] = await Promise.all([
      primaryLogo ? blobToBase64(primaryLogo) : Promise.resolve(null),
      secondaryLogo ? blobToBase64(secondaryLogo) : Promise.resolve(null),
      favicon ? blobToBase64(favicon) : Promise.resolve(null),
      Promise.all(
        pnlPosters.map(poster =>
          poster ? blobToBase64(poster) : Promise.resolve(null)
        )
      ),
    ]);

    return {
      formData: {
        distributorCode,
        brokerName,
        telegramLink,
        discordLink,
        xLink,
        walletConnectProjectId,
        privyAppId,
        privyTermsOfUse,
        privyLoginMethods,
        enabledMenus,
        customMenus,
        enableAbstractWallet,
        enableServiceDisclaimerDialog,
        enableCampaigns,
        swapFeeBps,
        themePrompt,
        currentTheme,
        chainIds,
        defaultChain,
        disableMainnet,
        disableTestnet,
        disableEvmWallets,
        disableSolanaWallets,
        tradingViewColorConfig,
        availableLanguages,
        seoSiteName,
        seoSiteDescription,
        seoSiteLanguage,
        seoSiteLocale,
        seoTwitterHandle,
        seoThemeColor,
        seoKeywords,
        analyticsScript,
        symbolList,
        restrictedRegions,
        whitelistedIps,
      },
      images: {
        primaryLogo: primaryLogoBase64,
        secondaryLogo: secondaryLogoBase64,
        favicon: faviconBase64,
        pnlPosters: pnlPostersBase64,
      },
    };
  }, [
    primaryLogo,
    secondaryLogo,
    favicon,
    pnlPosters,
    brokerName,
    telegramLink,
    discordLink,
    xLink,
    walletConnectProjectId,
    privyAppId,
    privyTermsOfUse,
    privyLoginMethods,
    enabledMenus,
    customMenus,
    enableAbstractWallet,
    enableServiceDisclaimerDialog,
    enableCampaigns,
    swapFeeBps,
    themePrompt,
    currentTheme,
    chainIds,
    defaultChain,
    disableMainnet,
    disableTestnet,
    disableEvmWallets,
    disableSolanaWallets,
    tradingViewColorConfig,
    availableLanguages,
    seoSiteName,
    seoSiteDescription,
    seoSiteLanguage,
    seoSiteLocale,
    seoTwitterHandle,
    seoThemeColor,
    seoKeywords,
    analyticsScript,
    symbolList,
    restrictedRegions,
    whitelistedIps,
    distributorCode,
  ]);

  const resetForm = () => {
    setBrokerName(initialFormState.brokerName);
    setTelegramLink(initialFormState.telegramLink);
    setDiscordLink(initialFormState.discordLink);
    setXLink(initialFormState.xLink);
    setWalletConnectProjectId(initialFormState.walletConnectProjectId);
    setPrivyAppId(initialFormState.privyAppId);
    setPrivyTermsOfUse(initialFormState.privyTermsOfUse);
    setPrivyLoginMethods(initialFormState.privyLoginMethods);
    setEnabledMenus(initialFormState.enabledMenus);
    setCustomMenus(initialFormState.customMenus);
    setEnableAbstractWallet(initialFormState.enableAbstractWallet);
    setEnableServiceDisclaimerDialog(
      initialFormState.enableServiceDisclaimerDialog
    );
    setEnableCampaigns(initialFormState.enableCampaigns);
    setSwapFeeBps(initialFormState.swapFeeBps);
    setPrimaryLogo(initialFormState.primaryLogo);
    setSecondaryLogo(initialFormState.secondaryLogo);
    setFavicon(initialFormState.favicon);
    setPnlPosters(initialFormState.pnlPosters);
    setThemePrompt(initialFormState.themePrompt);
    setCurrentTheme(initialFormState.currentTheme);
    setChainIds(initialFormState.chainIds);
    setDefaultChain(initialFormState.defaultChain);
    setDisableMainnet(initialFormState.disableMainnet);
    setDisableTestnet(initialFormState.disableTestnet);
    setDisableEvmWallets(initialFormState.disableEvmWallets);
    setDisableSolanaWallets(initialFormState.disableSolanaWallets);
    setTradingViewColorConfig(initialFormState.tradingViewColorConfig);
    setAvailableLanguages(initialFormState.availableLanguages);
    setSeoSiteName(initialFormState.seoSiteName);
    setSeoSiteDescription(initialFormState.seoSiteDescription);
    setSeoSiteLanguage(initialFormState.seoSiteLanguage);
    setSeoSiteLocale(initialFormState.seoSiteLocale);
    setSeoTwitterHandle(initialFormState.seoTwitterHandle);
    setSeoThemeColor(initialFormState.seoThemeColor);
    setSeoKeywords(initialFormState.seoKeywords);
    setAnalyticsScript(initialFormState.analyticsScript);
    setSymbolList(initialFormState.symbolList);
    setRestrictedRegions(initialFormState.restrictedRegions);
    setWhitelistedIps(initialFormState.whitelistedIps);
    setDistributorCode(initialFormState.distributorCode);
  };

  const generateTheme = useCallback(
    async (
      token: string,
      originalThemeCSS: string | null | undefined,
      onApply: (theme: string) => void,
      onCancel: () => void,
      openModal: (type: ModalType, props?: Record<string, unknown>) => void,
      prompt?: string,
      previewProps?: DexPreviewProps,
      viewMode: "desktop" | "mobile" = "desktop"
    ) => {
      const effectivePrompt = prompt?.trim() || themePrompt.trim();
      if (!effectivePrompt) {
        toast.error("Please enter a theme description");
        return;
      }

      try {
        const response = await post<{ themes: string[] }>(
          "api/theme/modify",
          {
            prompt: effectivePrompt,
            currentTheme: currentTheme || originalThemeCSS,
          },
          token
        );

        if (
          response &&
          response.themes &&
          Array.isArray(response.themes) &&
          response.themes.length === 3
        ) {
          openModal("themePreview", {
            oldTheme: currentTheme || originalThemeCSS || "",
            themes: response.themes,
            onApply,
            onCancel,
            previewProps,
            viewMode,
          });
          toast.success("Theme generated successfully!");
        } else {
          toast.error("Failed to generate theme");
        }
      } catch (error) {
        console.error("Error generating theme:", error);
        if (
          error &&
          typeof error === "object" &&
          "status" in error &&
          error.status === 429
        ) {
          toast.error(
            "Rate limit exceeded. Please wait 30 seconds before generating another theme."
          );
        } else {
          toast.error("Error generating theme. Please try again.");
        }
      }
    },
    [themePrompt, currentTheme]
  );

  const resetTheme = useCallback(
    (originalThemeCSS: string | null | undefined) => {
      setCurrentTheme(originalThemeCSS ?? null);
      setTradingViewColorConfig(null);
      setThemePrompt("");
      toast.success("Theme reset");
    },
    []
  );

  const resetThemeToDefault = useCallback(() => {
    setCurrentTheme(defaultTheme);
    setTradingViewColorConfig(null);
    setThemePrompt("");
    toast.success("Theme reset to default");
  }, []);

  const toggleThemeEditor = useCallback(() => {
    setShowThemeEditor(prev => !prev);
  }, []);

  const handleThemeEditorChange = useCallback((value: string) => {
    setCurrentTheme(value);
  }, []);

  const handleUpdateCssValue = useCallback(
    (variableName: string, newValue: string) => {
      updateCssValue(variableName, newValue, setCurrentTheme);
    },
    [updateCssValue]
  );

  const handleUpdateCssColor = useCallback(
    (variableName: string, newColorHex: string) => {
      updateCssColor(variableName, newColorHex, setCurrentTheme);
    },
    [updateCssColor]
  );

  const updateDexData = useCallback(
    async (token: string | null, dexId?: string) => {
      if (!token) return null;

      try {
        const endpoint = dexId ? `api/dex/${dexId}` : "api/dex";
        const response = await get<DexData>(endpoint, token);

        if (response && "id" in response) {
          setDexData(response);

          populateFromDexData({
            brokerName: response.brokerName,
            telegramLink: response.telegramLink || "",
            discordLink: response.discordLink || "",
            xLink: response.xLink || "",
            walletConnectProjectId: response.walletConnectProjectId || "",
            privyAppId: response.privyAppId || "",
            privyTermsOfUse: response.privyTermsOfUse || "",
            privyLoginMethods: response.privyLoginMethods || null,
            enabledMenus: response.enabledMenus || "",
            customMenus: response.customMenus || "",
            enableAbstractWallet: response.enableAbstractWallet || false,
            enableServiceDisclaimerDialog:
              response.enableServiceDisclaimerDialog || false,
            enableCampaigns: response.enableCampaigns || false,
            swapFeeBps: response.swapFeeBps ?? null,
            chainIds: response.chainIds || [],
            defaultChain: response.defaultChain || undefined,
            disableMainnet: response.disableMainnet || false,
            disableTestnet: response.disableTestnet || false,
            disableEvmWallets: response.disableEvmWallets || false,
            disableSolanaWallets: response.disableSolanaWallets || false,
            tradingViewColorConfig: response.tradingViewColorConfig ?? null,
            availableLanguages: response.availableLanguages || [],
            seoSiteName: response.seoSiteName || "",
            seoSiteDescription: response.seoSiteDescription || "",
            seoSiteLanguage: response.seoSiteLanguage || "",
            seoSiteLocale: response.seoSiteLocale || "",
            seoTwitterHandle: response.seoTwitterHandle || "",
            seoThemeColor: response.seoThemeColor || "",
            seoKeywords: response.seoKeywords || "",
            analyticsScript: response.analyticsScript || "",
            symbolList: response.symbolList || "",
            restrictedRegions: response.restrictedRegions || "",
            whitelistedIps: response.whitelistedIps || "",
            themeCSS: response.themeCSS,
          });

          setViewCssCode(false);
          if (!response.themeCSS) {
            setCurrentTheme(defaultTheme);
          }

          await loadImagesFromBase64({
            primaryLogo: response.primaryLogo,
            secondaryLogo: response.secondaryLogo,
            favicon: response.favicon,
            pnlPosters: response.pnlPosters,
          });

          return response;
        }
        return null;
      } catch (error) {
        console.error("Failed to fetch DEX data", error);
        toast.error("Failed to load DEX configuration");
        return null;
      }
    },
    [populateFromDexData, loadImagesFromBase64]
  );

  const getSectionProps = useCallback(
    (additionalProps: {
      handleResetTheme: () => void;
      handleResetToDefault: () => void;
      ThemeTabButton: React.FC<{
        tab: "colors" | "fonts" | "rounded" | "spacing" | "tradingview";
        label: string;
      }>;
    }) => ({
      brokerName,
      handleInputChange,
      brokerNameValidator,
      primaryLogo,
      secondaryLogo,
      favicon,
      handleImageChange,
      currentTheme,
      defaultTheme,
      savedTheme: dexData?.themeCSS || null,
      showThemeEditor,
      viewCssCode,
      themePrompt,
      isGeneratingTheme,
      tradingViewColorConfig,
      toggleThemeEditor,
      handleResetTheme: additionalProps.handleResetTheme,
      handleResetToDefault: additionalProps.handleResetToDefault,
      handleThemeEditorChange,
      setViewCssCode,
      ThemeTabButton: additionalProps.ThemeTabButton,
      updateCssColor: handleUpdateCssColor,
      updateCssValue: handleUpdateCssValue,
      setTradingViewColorConfig,
      pnlPosters,
      handlePnLPosterChange,
      telegramLink,
      discordLink,
      xLink,
      urlValidator,
      seoSiteName,
      seoSiteDescription,
      seoSiteLanguage,
      seoSiteLocale,
      seoTwitterHandle,
      seoThemeColor,
      seoKeywords,
      analyticsScript,
      walletConnectProjectId,
      privyAppId,
      privyTermsOfUse,
      enableAbstractWallet,
      onEnableAbstractWalletChange: setEnableAbstractWallet,
      disableEvmWallets,
      disableSolanaWallets,
      enableServiceDisclaimerDialog,
      onDisableEvmWalletsChange: setDisableEvmWallets,
      onDisableSolanaWalletsChange: setDisableSolanaWallets,
      onEnableServiceDisclaimerDialogChange: setEnableServiceDisclaimerDialog,
      privyLoginMethods,
      onPrivyLoginMethodsChange: setPrivyLoginMethods,
      chainIds,
      onChainIdsChange: setChainIds,
      defaultChain,
      onDefaultChainChange: setDefaultChain,
      disableMainnet,
      disableTestnet,
      onDisableMainnetChange: setDisableMainnet,
      onDisableTestnetChange: setDisableTestnet,
      availableLanguages,
      onAvailableLanguagesChange: setAvailableLanguages,
      enabledMenus,
      setEnabledMenus,
      customMenus,
      setCustomMenus,
      enableCampaigns,
      setEnableCampaigns,
      swapFeeBps,
      setSwapFeeBps,
      symbolList,
      setSymbolList,
      restrictedRegions,
      onRestrictedRegionsChange: setRestrictedRegions,
      whitelistedIps,
      onWhitelistedIpsChange: setWhitelistedIps,
      distributorCode,
      distributorCodeValidator,
    }),
    [
      brokerName,
      handleInputChange,
      brokerNameValidator,
      primaryLogo,
      secondaryLogo,
      favicon,
      handleImageChange,
      currentTheme,
      themePrompt,
      tradingViewColorConfig,
      setTradingViewColorConfig,
      pnlPosters,
      handlePnLPosterChange,
      telegramLink,
      discordLink,
      xLink,
      urlValidator,
      seoSiteName,
      seoSiteDescription,
      seoSiteLanguage,
      seoSiteLocale,
      seoTwitterHandle,
      seoThemeColor,
      seoKeywords,
      analyticsScript,
      symbolList,
      restrictedRegions,
      whitelistedIps,
      distributorCode,
      walletConnectProjectId,
      privyAppId,
      privyTermsOfUse,
      enableAbstractWallet,
      setEnableAbstractWallet,
      disableEvmWallets,
      disableSolanaWallets,
      enableServiceDisclaimerDialog,
      setDisableEvmWallets,
      setDisableSolanaWallets,
      setEnableServiceDisclaimerDialog,
      privyLoginMethods,
      setPrivyLoginMethods,
      chainIds,
      setChainIds,
      defaultChain,
      setDefaultChain,
      disableMainnet,
      disableTestnet,
      setDisableMainnet,
      setDisableTestnet,
      availableLanguages,
      setAvailableLanguages,
      enabledMenus,
      setEnabledMenus,
      customMenus,
      setCustomMenus,
      enableCampaigns,
      setEnableCampaigns,
      showThemeEditor,
      viewCssCode,
      isGeneratingTheme,
      toggleThemeEditor,
      handleThemeEditorChange,
      handleUpdateCssValue,
      handleUpdateCssColor,
      distributorCodeValidator,
    ]
  );

  return {
    brokerNameValidator,
    urlValidator,
    dexData,
    setDexData,
    updateDexData,
    brokerName,
    telegramLink,
    discordLink,
    xLink,
    walletConnectProjectId,
    privyAppId,
    privyTermsOfUse,
    privyLoginMethods,
    enabledMenus,
    customMenus,
    enableAbstractWallet,
    enableServiceDisclaimerDialog,
    enableCampaigns,
    swapFeeBps,
    primaryLogo,
    secondaryLogo,
    favicon,
    pnlPosters,
    themePrompt,
    currentTheme,
    chainIds,
    defaultChain,
    disableMainnet,
    disableTestnet,
    disableEvmWallets,
    disableSolanaWallets,
    tradingViewColorConfig,
    availableLanguages,
    seoSiteName,
    seoSiteDescription,
    seoSiteLanguage,
    seoSiteLocale,
    seoTwitterHandle,
    seoThemeColor,
    seoKeywords,
    analyticsScript,
    symbolList,
    restrictedRegions,
    whitelistedIps,
    distributorCode,
    setBrokerName,
    setTelegramLink,
    setDiscordLink,
    setXLink,
    setWalletConnectProjectId,
    setPrivyAppId,
    setPrivyTermsOfUse,
    setPrivyLoginMethods,
    setEnabledMenus,
    setCustomMenus,
    setEnableAbstractWallet,
    setEnableServiceDisclaimerDialog,
    setEnableCampaigns,
    setSwapFeeBps,
    setPrimaryLogo,
    setSecondaryLogo,
    setFavicon,
    setPnlPosters,
    setThemePrompt,
    setCurrentTheme,
    setChainIds,
    setDefaultChain,
    setDisableMainnet,
    setDisableTestnet,
    setDisableEvmWallets,
    setDisableSolanaWallets,
    setTradingViewColorConfig,
    setAvailableLanguages,
    setSeoSiteName,
    setSeoSiteDescription,
    setSeoSiteLanguage,
    setSeoSiteLocale,
    setSeoTwitterHandle,
    setSeoThemeColor,
    setSeoKeywords,
    setAnalyticsScript,
    setSymbolList,
    setRestrictedRegions,
    setWhitelistedIps,
    setDistributorCode,
    handleInputChange,
    handleImageChange,
    handlePnLPosterChange,
    populateFromDexData,
    loadImagesFromBase64,
    getFormDataWithBase64Images,
    generateTheme,
    resetTheme,
    resetThemeToDefault,
    showThemeEditor,
    setShowThemeEditor,
    viewCssCode,
    setViewCssCode,
    isGeneratingTheme,
    setIsGeneratingTheme,
    toggleThemeEditor,
    handleThemeEditorChange,
    handleUpdateCssValue,
    handleUpdateCssColor,
    getSectionProps,
    resetForm,
    distributorCodeValidator,
  };
}
