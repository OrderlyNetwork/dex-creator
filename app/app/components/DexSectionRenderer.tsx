import React, { useState, useEffect, useRef, ReactNode } from "react";
import { i18n, useTranslation } from "~/i18n";
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
import { DexPreviewProps } from "./DexPreview";

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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

export function getDexSections(): DexSectionConfig[] {
  return [
    {
      id: 1,
      key: DEX_SECTION_KEYS.DistributorCode,
      title: i18n.t("dexSectionRenderer.distributorCode.title"),
      label: i18n.t("dexSectionRenderer.distributorCode.label"),
      description: i18n.t("dexSectionRenderer.distributorCode.description"),
      isOptional: true,
      component: DistributorCodeSection,
      getProps: props => ({
        distributorCode: props.distributorCode,
        handleInputChange: props.handleInputChange,
        distributorCodeValidator: props.distributorCodeValidator,
      }),
      getValidationTest: props =>
        props.distributorCode.trim()
          ? props.distributorCodeValidator(props.distributorCode.trim()) ===
            null
          : true,
      getValue: props => props.distributorCode,
    },
    {
      id: 2,
      key: DEX_SECTION_KEYS.BrokerDetails,
      title: i18n.t("dexSectionRenderer.brokerDetails.title"),
      description: i18n.t("dexSectionRenderer.brokerDetails.description"),
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
      title: i18n.t("dexSectionRenderer.branding.title"),
      description: i18n.t("dexSectionRenderer.branding.description"),
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
      title: i18n.t("dexSectionRenderer.themeCustomization.title"),
      description: i18n.t("dexSectionRenderer.themeCustomization.description"),
      isOptional: true,
      component: ThemeCustomizationSection,
      getProps: props => ({
        currentTheme: props.currentTheme,
        defaultTheme: props.defaultTheme,
        showThemeEditor: props.showThemeEditor,
        viewCssCode: props.viewCssCode,
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
        setTradingViewColorConfig: props.setTradingViewColorConfig,
      }),
    },
    {
      id: 5,
      key: DEX_SECTION_KEYS.PnLPosters,
      title: i18n.t("dexSectionRenderer.pnlPosters.title"),
      description: i18n.t("dexSectionRenderer.pnlPosters.description"),
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
      title: i18n.t("dexCard.socialMediaLinks"),
      description: i18n.t("dexSectionRenderer.socialLinks.description"),
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
      title: i18n.t("dexSectionRenderer.seoConfiguration.title"),
      description: i18n.t("dexSectionRenderer.seoConfiguration.description"),
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
      title: i18n.t("dexSectionRenderer.analyticsConfiguration.title"),
      description: i18n.t(
        "dexSectionRenderer.analyticsConfiguration.description"
      ),
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
      title: i18n.t("dexSectionRenderer.reownConfiguration.title"),
      description: i18n.t("dexSectionRenderer.reownConfiguration.description"),
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
      title: i18n.t("dexSectionRenderer.privyConfiguration.title"),
      description: i18n.t("dexSectionRenderer.privyConfiguration.description"),
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
      title: i18n.t("dexSectionRenderer.blockchainConfiguration.title"),
      description: i18n.t(
        "dexSectionRenderer.blockchainConfiguration.description"
      ),
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
      title: i18n.t("assetFilterSection.assetFiltering"),
      description: i18n.t("dexSectionRenderer.assetFilter.description"),
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
      title: i18n.t("dexSectionRenderer.languageSupport.title"),
      description: i18n.t("dexSectionRenderer.languageSupport.description"),
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
      title: i18n.t("dexSectionRenderer.navigationMenus.title"),
      description: i18n.t("dexSectionRenderer.navigationMenus.description"),
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
      title: i18n.t("dexSectionRenderer.serviceDisclaimer.title"),
      description: i18n.t("dexSectionRenderer.serviceDisclaimer.description"),
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
      title: i18n.t("dexSectionRenderer.serviceRestrictions.title"),
      description: i18n.t("dexSectionRenderer.serviceRestrictions.description"),
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
}

interface DexSectionRendererProps {
  mode: "accordion" | "direct";
  sections: DexSectionConfig[];
  sectionProps: DexSectionProps;
  handleGenerateTheme?: (
    prompt?: string,
    previewProps?: DexPreviewProps,
    viewMode?: "desktop" | "mobile"
  ) => void;
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
  handleGenerateTheme,
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

  const { t } = useTranslation();
  const handleSectionClick = (sectionId: number) => {
    setCurrentSection(sectionId);
  };
  const renderSection = (section: DexSectionConfig, index: number) => {
    const Component = section.component;
    const baseProps = section.getProps(sectionProps);
    if (
      section.key === DEX_SECTION_KEYS.ThemeCustomization &&
      handleGenerateTheme
    ) {
      baseProps.handleGenerateTheme = handleGenerateTheme;
    }
    const componentProps = {
      ...baseProps,
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
            {customDescription?.(section) ?? section.description}
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
                    ({t("dexSectionRenderer.optional")})
                  </span>
                )}
              </h3>
              <p className="text-xs text-gray-400 mb-4">
                {customDescription?.(section) ?? section.description}
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
