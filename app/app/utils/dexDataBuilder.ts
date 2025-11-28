import type { DexFormData } from "../hooks/useDexForm";

type DexFormDataWithoutImages = Omit<
  DexFormData,
  "primaryLogo" | "secondaryLogo" | "favicon" | "pnlPosters"
>;

export function buildDexDataToSend(formValues: DexFormDataWithoutImages) {
  return {
    brokerName: formValues.brokerName.trim(),
    telegramLink: formValues.telegramLink.trim(),
    discordLink: formValues.discordLink.trim(),
    xLink: formValues.xLink.trim(),
    walletConnectProjectId: formValues.walletConnectProjectId.trim(),
    privyAppId: formValues.privyAppId.trim(),
    privyTermsOfUse: formValues.privyTermsOfUse.trim(),
    privyLoginMethods: formValues.privyLoginMethods.join(","),
    themeCSS: formValues.currentTheme ?? null,
    enabledMenus: formValues.enabledMenus,
    customMenus: formValues.customMenus,
    enableAbstractWallet: formValues.enableAbstractWallet,
    enableServiceDisclaimerDialog: formValues.enableServiceDisclaimerDialog,
    enableCampaigns: formValues.enableCampaigns,
    ...(formValues.swapFeeBps !== null && {
      swapFeeBps: formValues.swapFeeBps,
    }),
    chainIds: formValues.chainIds,
    defaultChain: formValues.defaultChain,
    disableMainnet: formValues.disableMainnet,
    disableTestnet: formValues.disableTestnet,
    disableEvmWallets: formValues.disableEvmWallets,
    disableSolanaWallets: formValues.disableSolanaWallets,
    tradingViewColorConfig: formValues.tradingViewColorConfig,
    availableLanguages: formValues.availableLanguages,
    seoSiteName: formValues.seoSiteName.trim(),
    seoSiteDescription: formValues.seoSiteDescription.trim(),
    seoSiteLanguage: formValues.seoSiteLanguage.trim(),
    seoSiteLocale: formValues.seoSiteLocale.trim(),
    seoTwitterHandle: formValues.seoTwitterHandle.trim(),
    seoThemeColor: formValues.seoThemeColor.trim(),
    seoKeywords: formValues.seoKeywords.trim(),
    analyticsScript: formValues.analyticsScript.trim()
      ? btoa(encodeURIComponent(formValues.analyticsScript.trim()))
      : "",
    symbolList: formValues.symbolList.trim(),
    distributorCode: formValues.distributorCode.trim(),
  };
}
