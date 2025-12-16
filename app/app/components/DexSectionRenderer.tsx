import React, { useState, useEffect, useRef, ReactNode } from "react";
import AccordionItem from "./AccordionItem";
import BrokerDetailsSection from "./BrokerDetailsSection";
import BrandingSection from "./BrandingSection";
import ThemeCustomizationSection from "./ThemeCustomizationSection";
import PnLPostersSection from "./PnLPostersSection";
import SocialLinksSection from "./SocialLinksSection";
import SEOConfigSection from "./SEOConfigSection";
import AnalyticsConfigSection from "./AnalyticsConfigSection";
import ReownConfigSection from "./ReownConfigSection";
import PrivyConfigSection from "./PrivyConfigSection";
import BlockchainConfigSection from "./BlockchainConfigSection";
import LanguageSupportSection from "./LanguageSupportSection";
import NavigationMenuSection from "./NavigationMenuSection";
import ServiceRestrictionsSection from "./ServiceRestrictionsSection";
import AssetFilterSection from "./AssetFilterSection";
import ProgressTracker from "./ProgressTracker";
import { DexSectionProps } from "../hooks/useDexForm";
import DistributorCodeSection from "./DistributorCodeSection";
import ServiceDisclaimerSection from "./ServiceDisclaimerSection";

export interface DexSectionConfig {
  id: number;
  key: string;
  title: string;
  label?: string;
  description: string;
  isOptional: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component: React.ComponentType<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getProps: (sectionProps: DexSectionProps) => any;
  getValidationTest?: (sectionProps: DexSectionProps) => boolean;
  /** get the value of the section */
  getValue?: (sectionProps: DexSectionProps) => any;
}

export enum DEX_SECTION_KEYS {
  DistributorCode = "distributorCode",
  BrokerDetails = "brokerDetails",
  Branding = "branding",
  ThemeCustomization = "themeCustomization",
  PnLPosters = "pnlPosters",
  SocialLinks = "socialLinks",
  SEOConfiguration = "seoConfiguration",
  AnalyticsConfiguration = "analyticsConfiguration",
  ReownConfiguration = "reownConfiguration",
  PrivyConfiguration = "privyConfiguration",
  BlockchainConfiguration = "blockchainConfiguration",
  LanguageSupport = "languageSupport",
  AssetFilter = "assetFilter",
  NavigationMenus = "navigationMenus",
  ServiceDisclaimer = "serviceDisclaimer",
  ServiceRestrictions = "serviceRestrictions",
}

export const DEX_SECTIONS: DexSectionConfig[] = [
  {
    id: 1,
    key: DEX_SECTION_KEYS.DistributorCode,
    title: "Are you invited by any distributor? ",
    label: "Distributor code",
    description:
      "If you have been referred by a distributor and given a distributor code, please input below for binding.",
    isOptional: true,
    component: DistributorCodeSection,
    getProps: props => ({
      distributorCode: props.distributorCode,
      handleInputChange: props.handleInputChange,
      distributorCodeValidator: props.distributorCodeValidator,
    }),
    getValidationTest: props =>
      props.distributorCode.trim()
        ? props.distributorCodeValidator(props.distributorCode.trim()) === null
        : true,
    getValue: props => props.distributorCode,
  },
  {
    id: 2,
    key: DEX_SECTION_KEYS.BrokerDetails,
    title: "Broker Details",
    description:
      "Configure your DEX's basic information and trading broker details. Broker name can only contain letters, numbers, spaces, dots, hyphens, and underscores.",
    isOptional: false,
    component: BrokerDetailsSection,
    getProps: props => ({
      brokerName: props.brokerName,
      handleInputChange: props.handleInputChange,
      brokerNameValidator: props.brokerNameValidator,
    }),
    getValidationTest: props =>
      props.brokerNameValidator(props.brokerName.trim()) === null,
    getValue: props => props.brokerName,
  },
  {
    id: 3,
    key: DEX_SECTION_KEYS.Branding,
    title: "Branding",
    description:
      "Customize your DEX with your own branding by pasting your logos below. Copy an image to your clipboard (from any image editor or browser), then click in the paste area and press Ctrl+V or ⌘+V. All branding fields are optional.",
    isOptional: true,
    component: BrandingSection,
    getProps: props => ({
      primaryLogo: props.primaryLogo,
      secondaryLogo: props.secondaryLogo,
      favicon: props.favicon,
      handleImageChange: props.handleImageChange,
    }),
  },
  {
    id: 4,
    key: DEX_SECTION_KEYS.ThemeCustomization,
    title: "Theme Customization",
    description:
      "Customize your DEX's colors and theme by editing the CSS directly or describing how you want it to look for AI-assisted generation. Theme customization is completely optional - your DEX will work great with the default theme.",
    isOptional: true,
    component: ThemeCustomizationSection,
    getProps: props => ({
      currentTheme: props.currentTheme,
      defaultTheme: props.defaultTheme,
      showThemeEditor: props.showThemeEditor,
      viewCssCode: props.viewCssCode,
      activeThemeTab: props.activeThemeTab,
      themePrompt: props.themePrompt,
      isGeneratingTheme: props.isGeneratingTheme,
      brokerName: props.brokerName,
      primaryLogo: props.primaryLogo,
      secondaryLogo: props.secondaryLogo,
      tradingViewColorConfig: props.tradingViewColorConfig,
      toggleThemeEditor: props.toggleThemeEditor,
      handleResetTheme: props.handleResetTheme,
      handleResetToDefault: props.handleResetToDefault,
      handleThemeEditorChange: props.handleThemeEditorChange,
      setViewCssCode: props.setViewCssCode,
      ThemeTabButton: props.ThemeTabButton,
      updateCssColor: props.updateCssColor,
      updateCssValue: props.updateCssValue,
      handleInputChange: props.handleInputChange,
      handleGenerateTheme: props.handleGenerateTheme,
      setTradingViewColorConfig: props.setTradingViewColorConfig,
    }),
  },
  {
    id: 5,
    key: DEX_SECTION_KEYS.PnLPosters,
    title: "PnL Posters",
    description:
      "Upload custom background images for PnL sharing posters. Users can share their trading performance with these backgrounds. You can upload up to 8 custom poster backgrounds. Leave empty to use default poster designs.",
    isOptional: true,
    component: PnLPostersSection,
    getProps: props => ({
      pnlPosters: props.pnlPosters,
      onChange: props.handlePnLPosterChange,
    }),
  },
  {
    id: 6,
    key: DEX_SECTION_KEYS.SocialLinks,
    title: "Social Media Links",
    description:
      "Add social media links that will appear in your DEX footer. All social media links are optional. Leave empty if not applicable.",
    isOptional: true,
    component: SocialLinksSection,
    getProps: props => ({
      telegramLink: props.telegramLink,
      discordLink: props.discordLink,
      xLink: props.xLink,
      handleInputChange: props.handleInputChange,
      urlValidator: props.urlValidator,
    }),
  },
  {
    id: 7,
    key: DEX_SECTION_KEYS.SEOConfiguration,
    title: "SEO Configuration",
    description:
      "Configure SEO settings to optimize how your DEX appears in search engines and social media sharing. All SEO fields are optional but recommended for better discoverability.",
    isOptional: true,
    component: SEOConfigSection,
    getProps: props => ({
      seoSiteName: props.seoSiteName,
      seoSiteDescription: props.seoSiteDescription,
      seoSiteLanguage: props.seoSiteLanguage,
      seoSiteLocale: props.seoSiteLocale,
      seoTwitterHandle: props.seoTwitterHandle,
      seoThemeColor: props.seoThemeColor,
      seoKeywords: props.seoKeywords,
      handleInputChange: props.handleInputChange,
      updateCssColor: props.updateCssColor,
    }),
  },
  {
    id: 8,
    key: DEX_SECTION_KEYS.AnalyticsConfiguration,
    title: "Analytics Configuration",
    description:
      "Add your analytics tracking script to monitor usage and performance of your DEX. Supports Google Analytics, Plausible, Matomo, and other analytics services. This is completely optional.",
    isOptional: true,
    component: AnalyticsConfigSection,
    getProps: props => ({
      analyticsScript: props.analyticsScript,
      handleInputChange: props.handleInputChange,
    }),
  },
  {
    id: 9,
    key: DEX_SECTION_KEYS.ReownConfiguration,
    title: "Reown Configuration",
    description:
      "Add your Reown Project ID to enable enhanced wallet connectivity functionality in your DEX. This is completely optional - your DEX will work without it.",
    isOptional: true,
    component: ReownConfigSection,
    getProps: props => ({
      walletConnectProjectId: props.walletConnectProjectId,
      handleInputChange: props.handleInputChange,
    }),
  },
  {
    id: 10,
    key: DEX_SECTION_KEYS.PrivyConfiguration,
    title: "Privy Configuration",
    description:
      "Add your Privy credentials to enable social login, email authentication, and other wallet connection options in your DEX. This is completely optional. Only the App ID is required if you want to use Privy.",
    isOptional: true,
    component: PrivyConfigSection,
    getProps: props => ({
      privyAppId: props.privyAppId,
      privyTermsOfUse: props.privyTermsOfUse,
      handleInputChange: props.handleInputChange,
      urlValidator: props.urlValidator,
      enableAbstractWallet: props.enableAbstractWallet,
      onEnableAbstractWalletChange: props.onEnableAbstractWalletChange,
      disableEvmWallets: props.disableEvmWallets,
      disableSolanaWallets: props.disableSolanaWallets,
      onDisableEvmWalletsChange: props.onDisableEvmWalletsChange,
      onDisableSolanaWalletsChange: props.onDisableSolanaWalletsChange,
      privyLoginMethods: props.privyLoginMethods,
      onPrivyLoginMethodsChange: props.onPrivyLoginMethodsChange,
    }),
    getValidationTest: props =>
      props.privyTermsOfUse.trim()
        ? props.urlValidator(props.privyTermsOfUse.trim()) === null
        : true,
  },
  {
    id: 11,
    key: DEX_SECTION_KEYS.BlockchainConfiguration,
    title: "Blockchain Configuration",
    description:
      "Choose which blockchains your DEX will support for trading. This is optional - your DEX will support all available blockchains by default.",
    isOptional: true,
    component: BlockchainConfigSection,
    getProps: props => ({
      chainIds: props.chainIds,
      onChainIdsChange: props.onChainIdsChange,
      defaultChain: props.defaultChain,
      onDefaultChainChange: props.onDefaultChainChange,
      disableMainnet: props.disableMainnet,
      disableTestnet: props.disableTestnet,
      onDisableMainnetChange: props.onDisableMainnetChange,
      onDisableTestnetChange: props.onDisableTestnetChange,
    }),
  },
  {
    id: 12,
    key: DEX_SECTION_KEYS.AssetFilter,
    title: "Asset Filtering",
    description:
      "Select which trading pairs will be displayed in your DEX. Leave empty to show all available assets. This is optional - your DEX will show all assets by default.",
    isOptional: true,
    component: AssetFilterSection,
    getProps: props => ({
      symbolList: props.symbolList,
      onSymbolListChange: props.setSymbolList,
    }),
  },
  {
    id: 13,
    key: DEX_SECTION_KEYS.LanguageSupport,
    title: "Language Support",
    description:
      "Select the languages you want to support in your DEX interface. This is optional - your DEX will default to English only.",
    isOptional: true,
    component: LanguageSupportSection,
    getProps: props => ({
      availableLanguages: props.availableLanguages,
      onAvailableLanguagesChange: props.onAvailableLanguagesChange,
    }),
  },
  {
    id: 14,
    key: DEX_SECTION_KEYS.NavigationMenus,
    title: "Navigation Menus",
    description:
      "Customize which navigation links appear in your DEX. This is optional - if you don't select any menus, the default menus will be displayed.",
    isOptional: true,
    component: NavigationMenuSection,
    getProps: props => ({
      enabledMenus: props.enabledMenus,
      setEnabledMenus: props.setEnabledMenus,
      customMenus: props.customMenus,
      setCustomMenus: props.setCustomMenus,
      enableCampaigns: props.enableCampaigns,
      setEnableCampaigns: props.setEnableCampaigns,
      swapFeeBps: props.swapFeeBps,
      setSwapFeeBps: props.setSwapFeeBps,
    }),
  },
  {
    id: 15,
    key: DEX_SECTION_KEYS.ServiceDisclaimer,
    title: "Service Disclaimer",
    description:
      "Enable a one-time disclaimer dialog that informs users about the platform's use of Orderly Network's infrastructure. This is optional and can help set proper expectations for users.",
    isOptional: true,
    component: ServiceDisclaimerSection,
    getProps: props => ({
      enableServiceDisclaimerDialog: props.enableServiceDisclaimerDialog,
      onEnableServiceDisclaimerDialogChange:
        props.onEnableServiceDisclaimerDialogChange,
    }),
  },
  {
    id: 16,
    key: DEX_SECTION_KEYS.ServiceRestrictions,
    title: "Service Restrictions",
    description:
      "Configure geo-restrictions to limit access to your DEX by region.",
    isOptional: true,
    component: ServiceRestrictionsSection,
    getProps: props => ({
      restrictedRegions: props.restrictedRegions,
      onRestrictedRegionsChange: props.onRestrictedRegionsChange,
      whitelistedIps: props.whitelistedIps,
      onWhitelistedIpsChange: props.onWhitelistedIpsChange,
    }),
  },
];

interface DexSectionRendererProps {
  mode: "accordion" | "direct";
  sections: DexSectionConfig[];
  sectionProps: DexSectionProps;
  currentStep?: number;
  completedSteps?: Record<number, boolean>;
  setCurrentStep?: (step: number) => void;
  handleNextStep?: (step: number, skip?: boolean) => Promise<void>;
  allRequiredPreviousStepsCompleted?: (stepNumber: number) => boolean;
  showSectionHeaders?: boolean;
  idPrefix?: string;
  showProgressTracker?: boolean;
  customRender?: (children: ReactNode, section: DexSectionConfig) => ReactNode;
  shouldShowSkip?: (section: DexSectionConfig) => boolean;
  customDescription?: (section: DexSectionConfig) => ReactNode;
  isValidating?: boolean;
}

const DexSectionRenderer: React.FC<DexSectionRendererProps> = ({
  mode,
  sections,
  sectionProps,
  currentStep,
  completedSteps,
  setCurrentStep,
  handleNextStep,
  allRequiredPreviousStepsCompleted,
  showSectionHeaders = true,
  idPrefix = "",
  showProgressTracker = false,
  customRender,
  shouldShowSkip,
  customDescription,
  isValidating,
}) => {
  const [currentSection, setCurrentSection] = useState(1);
  const sectionRefsRef = useRef<Record<number, HTMLElement | null>>({});

  useEffect(() => {
    if (mode !== "direct" || !showProgressTracker) return;

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const sectionId = parseInt(
              entry.target.getAttribute("data-section-id") || "0"
            );
            setCurrentSection(sectionId);
          }
        });
      },
      {
        rootMargin: "-30% 0px -30% 0px",
        threshold: 0.1,
      }
    );

    const timeoutId = setTimeout(() => {
      Object.values(sectionRefsRef.current).forEach(ref => {
        if (ref) {
          observer.observe(ref);
        }
      });
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      observer.disconnect();
    };
  }, [mode, showProgressTracker, sections.length]);

  const handleSectionClick = (sectionId: number) => {
    setCurrentSection(sectionId);
  };
  const renderSection = (section: DexSectionConfig, index: number) => {
    const Component = section.component;
    const componentProps = {
      ...section.getProps(sectionProps),
      idPrefix: mode === "accordion" ? "" : idPrefix,
    };

    if (mode === "accordion") {
      if (
        !setCurrentStep ||
        !allRequiredPreviousStepsCompleted ||
        !completedSteps ||
        !handleNextStep
      ) {
        throw new Error(
          "Accordion mode requires setCurrentStep, allRequiredPreviousStepsCompleted, completedSteps, and handleNextStep props"
        );
      }

      const areAllPreviousStepsCompleted = (stepNumber: number) => {
        if (stepNumber === 1) return true;
        for (let i = 1; i < stepNumber; i++) {
          if (!completedSteps[i]) {
            return false;
          }
        }
        return true;
      };

      if (!areAllPreviousStepsCompleted(section.id)) {
        return null;
      }

      const accordionItem = (
        <AccordionItem
          key={section.key}
          title={section.title}
          stepNumber={section.id}
          isOptional={section.isOptional}
          showSkip={shouldShowSkip?.(section)}
          onNextInternal={(skip?: boolean) => handleNextStep(section.id, skip)}
          isStepContentValidTest={
            section.getValidationTest
              ? section.getValidationTest(sectionProps)
              : true
          }
          isActive={currentStep === section.id}
          isCompleted={!!completedSteps[section.id]}
          canOpen={
            allRequiredPreviousStepsCompleted(section.id) ||
            !!completedSteps[section.id]
          }
          setCurrentStep={setCurrentStep}
          allRequiredPreviousStepsCompleted={allRequiredPreviousStepsCompleted}
          value={section.getValue ? section.getValue(sectionProps) : undefined}
          isValidating={isValidating}
        >
          <p className="text-xs text-gray-400 mb-4">
            {customDescription?.(section) || section.description}
          </p>
          <Component {...componentProps} />
        </AccordionItem>
      );

      if (typeof customRender === "function") {
        return customRender(accordionItem, section);
      }

      return accordionItem;
    } else {
      const content = (
        <div
          key={section.key}
          ref={el => {
            if (el) {
              sectionRefsRef.current[section.id] = el;
            }
          }}
          data-section-id={section.id}
          className={index > 0 ? "mt-6 pt-4 border-t border-light/10" : ""}
        >
          {showSectionHeaders && (
            <>
              <h3 className="text-lg font-bold mb-3">
                {section.title}{" "}
                {section.isOptional && (
                  <span className="text-gray-400 text-sm font-normal">
                    (optional)
                  </span>
                )}
              </h3>
              <p className="text-xs text-gray-400 mb-4">
                {customDescription?.(section) || section.description}
              </p>
            </>
          )}
          <Component {...componentProps} />
        </div>
      );

      if (typeof customRender === "function") {
        return customRender(content, section);
      }
      return content;
    }
  };

  if (mode === "direct" && showProgressTracker) {
    return (
      <div className="flex gap-6">
        <ProgressTracker
          sections={sections}
          currentSection={currentSection}
          onSectionClick={handleSectionClick}
        />
        <div className="flex-1 min-w-0">
          {sections.map((section, index) => renderSection(section, index))}
        </div>
      </div>
    );
  }

  return <>{sections.map((section, index) => renderSection(section, index))}</>;
};

export default DexSectionRenderer;
