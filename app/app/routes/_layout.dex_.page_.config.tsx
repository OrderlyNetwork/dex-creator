import { useState, useEffect, FormEvent, useCallback } from "react";
import type { MetaFunction } from "@remix-run/node";
import { toast } from "react-toastify";
import { useAuth } from "../context/useAuth";
import { useLandingPage } from "../context/LandingPageContext";
import { useDex } from "../context/DexContext";
import { useModal } from "../context/ModalContext";
import {
  post,
  postFormData,
  putFormData,
  createLandingPageFormData,
} from "../utils/apiClient";
import WalletConnect from "../components/WalletConnect";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { useNavigate, Link } from "@remix-run/react";
import Form from "../components/Form";
import { parseCSSVariables } from "../utils/cssParser";
import { rgbSpaceSeparatedToHex } from "../utils/colorUtils";
import { defaultTheme } from "../types/dex";
import type { TeamMember } from "../components/EditableTeamList";
import LandingPageEditModal from "../components/LandingPageEditModal";
import type { GeneratedFile, LandingPage } from "../types/landingPage";

import {
  combineGeneratedFilesToHtml,
  migrateTeamMembers,
} from "../utils/landingPagePreview";
import type { LandingPageConfigForm } from "../types/landingPageConfig";

import {
  LandingPageBasicInfoForm,
  LandingPageBrandingForm,
  LandingPageDesignForm,
  LandingPageLanguagesForm,
  LandingPageMetadataForm,
  LandingPageSectionsForm,
  LandingPagePreviewPanel,
} from "../components/landing-page";

export const meta: MetaFunction = () => [
  { title: "Configure Landing Page - Orderly One" },
  {
    name: "description",
    content:
      "Configure your landing page. Set up branding, content, and design for your DEX landing page.",
  },
];

export default function LandingPageConfigRoute() {
  const { isAuthenticated, token, isLoading } = useAuth();
  const { dexData, isLoading: isDexLoading, deploymentUrl } = useDex();
  const {
    landingPageData,
    isLoading: isLandingPageLoading,
    refreshLandingPageData,
  } = useLandingPage();
  const navigate = useNavigate();
  const { openModal } = useModal();

  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [primaryLogo, setPrimaryLogo] = useState<Blob | null>(null);
  const [secondaryLogo, setSecondaryLogo] = useState<Blob | null>(null);
  const [banner, setBanner] = useState<Blob | null>(null);
  const [formData, setFormData] = useState<LandingPageConfigForm>({
    title: "",
    subtitle: "",
    theme: "dark",
    primaryColor: "#000000",
    secondaryColor: "#ffffff",
    fontFamily: "'Manrope', sans-serif",
    languages: ["en"],
    ctaButtonText: "Start Trading",
    ctaButtonLink: "",
    useCustomCtaColor: false,
    ctaPlacement: "both",
    enabledSections: ["hero", "features", "cta"],
    teamMembers: [],
    keyFeatures: [
      "Built on Orderly Network's omnichain infrastructure",
      "Trade perpetual futures across EVM chains and Solana",
      "Unified cross-chain liquidity pool",
      "Up to 50x leverage trading",
      "Advanced order types (limit, stop-loss, take-profit)",
      "Cross-margin account management",
      "Low trading fees with competitive spreads",
      "Sub-second order execution",
      "Real-time market data and analytics",
      "Professional risk management tools",
    ],
    faqItems: [
      {
        question: "What is Orderly Network and how does it power this DEX?",
        answer:
          "Orderly Network is an omnichain infrastructure layer that powers this DEX, providing unified liquidity across EVM chains and Solana. It enables seamless cross-chain perpetual futures trading with deep liquidity and professional-grade trading infrastructure.",
      },
      {
        question: "Can I trade perpetual futures across different blockchains?",
        answer:
          "Yes! This DEX is built on Orderly Network's omnichain infrastructure, allowing you to trade perpetual futures across multiple EVM chains and Solana from a single interface. Your positions and collateral are unified across all supported chains.",
      },
      {
        question: "What is the maximum leverage I can use?",
        answer:
          "You can trade with up to 50x leverage on perpetual futures contracts. However, higher leverage increases both potential profits and risks. Always use appropriate risk management strategies and never risk more than you can afford to lose.",
      },
      {
        question: "How does cross-margin trading work?",
        answer:
          "Cross-margin trading allows you to use your entire account balance as collateral for all open positions. This maximizes capital efficiency by sharing margin across positions, but also means that losses in one position can affect your other positions. Monitor your account health and use stop-loss orders to manage risk.",
      },
      {
        question: "What are the trading fees?",
        answer:
          "Trading fees are competitive and vary based on whether you're a maker (providing liquidity) or taker (taking liquidity). Maker fees are typically lower than taker fees. Check the fee structure section for detailed information.",
      },
      {
        question: "Which wallets are supported?",
        answer:
          "We support a wide range of wallets including MetaMask, WalletConnect-compatible wallets, Privy (for email and social logins), and Solana wallets. You can connect wallets from multiple chains to access the full omnichain trading experience.",
      },
      {
        question: "How do I manage my risk when trading with leverage?",
        answer:
          "Use stop-loss orders to limit potential losses, maintain adequate margin levels, diversify your positions, and never risk more than you can afford to lose. Monitor your account health and liquidation price regularly. Consider using lower leverage until you're comfortable with the risks.",
      },
      {
        question: "What order types are available?",
        answer:
          "We support multiple order types including market orders, limit orders, stop-loss orders, and take-profit orders. Advanced traders can also use conditional orders and trailing stops to implement sophisticated trading strategies.",
      },
      {
        question: "Is my collateral safe and secure?",
        answer:
          "Yes. This DEX is non-custodial, meaning you maintain full control of your funds. Your collateral is secured by Orderly Network's infrastructure, which uses smart contracts on-chain. The platform has been audited and is built on battle-tested DeFi infrastructure. However, always be aware that trading involves risk, and you should never deposit more than you can afford to lose.",
      },
      {
        question: "How does the unified liquidity pool work?",
        answer:
          "Orderly Network aggregates liquidity from across all supported chains into a unified pool. This means you get access to deeper liquidity, tighter spreads, and better execution prices regardless of which blockchain you're trading on. The unified pool ensures optimal trading conditions for all users.",
      },
    ],
    problemStatement:
      "Traditional decentralized exchanges are fragmented across different blockchains, forcing traders to manage multiple accounts and miss out on cross-chain opportunities. Perpetual futures trading has been limited by isolated liquidity pools and complex infrastructure requirements.",
    uniqueValue:
      "Built on Orderly Network's omnichain infrastructure, this DEX breaks down blockchain barriers by providing unified liquidity across EVM chains and Solana. Trade perpetual futures with deep liquidity, competitive fees, and professional-grade tools—all from a single non-custodial interface. Experience seamless cross-chain trading with up to 50x leverage and advanced order types.",
    targetAudience:
      "Active crypto traders seeking professional perpetual futures trading, DeFi enthusiasts looking for omnichain solutions, and trading communities wanting a branded platform with Orderly Network's battle-tested infrastructure.",
    metadata: {
      description:
        "Trade perpetual futures across EVM chains and Solana on a non-custodial DEX powered by Orderly Network. Unified liquidity, up to 50x leverage, and professional trading tools.",
      keywords: [
        "DEX",
        "perpetual futures",
        "Orderly Network",
        "omnichain trading",
        "DeFi",
        "cryptocurrency trading",
        "cross-chain",
        "leverage trading",
        "non-custodial",
        "EVM",
        "Solana",
      ],
    },
    sections: [],
    telegramLink: "",
    discordLink: "",
    xLink: "",
  });
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [showWarning, setShowWarning] = useState(false);
  const [editMode, setEditMode] = useState<
    "modifyConfig" | "interactive" | null
  >(null);
  const [interactiveHasChanges, setInteractiveHasChanges] = useState(false);
  const [teamMemberImageUrls, setTeamMemberImageUrls] = useState<
    (string | null)[]
  >([]);
  const [brandingImageUrls, setBrandingImageUrls] = useState<{
    primaryLogo?: string | null;
    secondaryLogo?: string | null;
    banner?: string | null;
  }>({});
  const [currentGeneratedFiles, setCurrentGeneratedFiles] = useState<
    GeneratedFile[] | null
  >(null);

  useEffect(() => {
    const convertBrandingImages = async () => {
      const blobToDataUrl = (blob: Blob | null): Promise<string | null> => {
        if (!blob) return Promise.resolve(null);
        return new Promise(resolve => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = () => resolve(null);
          reader.readAsDataURL(blob);
        });
      };

      const [primaryLogoUrl, secondaryLogoUrl, bannerUrl] = await Promise.all([
        blobToDataUrl(primaryLogo),
        blobToDataUrl(secondaryLogo),
        blobToDataUrl(banner),
      ]);

      setBrandingImageUrls({
        primaryLogo: primaryLogoUrl,
        secondaryLogo: secondaryLogoUrl,
        banner: bannerUrl,
      });
    };

    convertBrandingImages();
  }, [primaryLogo, secondaryLogo, banner]);

  useEffect(() => {
    const updateTeamMemberImageUrls = async () => {
      if (!formData.teamMembers || formData.teamMembers.length === 0) {
        setTeamMemberImageUrls([]);
        return;
      }

      const urls = await Promise.all(
        formData.teamMembers.map(async member => {
          if (member.image instanceof Blob) {
            return new Promise<string | null>(resolve => {
              const reader = new FileReader();
              reader.onloadend = () => {
                resolve(reader.result as string);
              };
              reader.onerror = () => resolve(null);
              reader.readAsDataURL(member.image as Blob);
            });
          }
          return null;
        })
      );
      setTeamMemberImageUrls(urls);
    };

    updateTeamMemberImageUrls();
  }, [formData.teamMembers]);

  useEffect(() => {
    if (landingPageData?.config?.generatedFiles && !interactiveHasChanges) {
      setCurrentGeneratedFiles(
        landingPageData.config.generatedFiles as GeneratedFile[]
      );
    }
  }, [landingPageData?.config?.generatedFiles, interactiveHasChanges]);

  useEffect(() => {
    if (currentGeneratedFiles) {
      const preview = combineGeneratedFilesToHtml(
        currentGeneratedFiles,
        landingPageData?.config as Record<string, unknown>,
        teamMemberImageUrls,
        brandingImageUrls
      );
      if (preview) {
        setPreviewHtml(preview);
      }
    }
  }, [
    teamMemberImageUrls,
    brandingImageUrls,
    currentGeneratedFiles,
    landingPageData?.config,
  ]);

  const extractDexColors = useCallback(
    (themeCSS: string | null | undefined) => {
      if (!themeCSS) return null;

      const variables = parseCSSVariables(themeCSS);
      const primaryRgb = variables["oui-color-primary"];
      const primaryLightRgb = variables["oui-color-primary-light"];
      const primaryDarkenRgb = variables["oui-color-primary-darken"];
      const linkRgb = variables["oui-color-link"];
      const secondaryRgb = variables["oui-color-secondary"];
      const successRgb = variables["oui-color-success"];
      const dangerRgb = variables["oui-color-danger"];
      const warningRgb = variables["oui-color-warning"];
      const fontFamily =
        variables["oui-font-family"]?.replace(/['"]/g, "") || "sans-serif";

      if (!primaryRgb) return null;

      return {
        primaryColor: rgbSpaceSeparatedToHex(primaryRgb),
        primaryLight: primaryLightRgb
          ? rgbSpaceSeparatedToHex(primaryLightRgb)
          : undefined,
        primaryDarken: primaryDarkenRgb
          ? rgbSpaceSeparatedToHex(primaryDarkenRgb)
          : undefined,
        linkColor: linkRgb ? rgbSpaceSeparatedToHex(linkRgb) : undefined,
        secondaryColor: secondaryRgb
          ? rgbSpaceSeparatedToHex(secondaryRgb)
          : "#ffffff",
        successColor: successRgb
          ? rgbSpaceSeparatedToHex(successRgb)
          : undefined,
        dangerColor: dangerRgb ? rgbSpaceSeparatedToHex(dangerRgb) : undefined,
        warningColor: warningRgb
          ? rgbSpaceSeparatedToHex(warningRgb)
          : undefined,
        fontFamily,
      };
    },
    []
  );

  const base64ToBlob = useCallback(async (base64: string): Promise<Blob> => {
    const response = await fetch(base64);
    return response.blob();
  }, []);

  const loadDexColors = useCallback(() => {
    const dexThemeCSS = dexData?.themeCSS || defaultTheme;
    const dexColors = extractDexColors(dexThemeCSS);

    if (dexColors) {
      setFormData(prev => ({
        ...prev,
        ...dexColors,
      }));
      toast.success("Reset to DEX theme colors");
    } else {
      toast.error("Could not extract colors from DEX theme");
    }
  }, [dexData, extractDexColors]);

  const loadDexImages = useCallback(async () => {
    if (dexData) {
      if (dexData.primaryLogo) {
        try {
          const blob = await base64ToBlob(dexData.primaryLogo);
          setPrimaryLogo(blob);
        } catch (error) {
          console.error("Error loading primary logo:", error);
        }
      }
      if (dexData.secondaryLogo) {
        try {
          const blob = await base64ToBlob(dexData.secondaryLogo);
          setSecondaryLogo(blob);
        } catch (error) {
          console.error("Error loading secondary logo:", error);
        }
      }
      if (dexData.banner) {
        try {
          const blob = await base64ToBlob(dexData.banner);
          setBanner(blob);
        } catch (error) {
          console.error("Error loading banner:", error);
        }
      }
    }
  }, [dexData, base64ToBlob]);

  useEffect(() => {
    if (!isAuthenticated || !token) return;

    if (landingPageData) {
      if (landingPageData.config) {
        const config = landingPageData.config as Record<string, unknown>;
        const configForm = config as Partial<LandingPageConfigForm>;

        setFormData(prev => ({
          ...prev,
          ...configForm,
          ctaButtonText:
            configForm.ctaButtonText || prev.ctaButtonText || "Start Trading",
          ctaPlacement: configForm.ctaPlacement || prev.ctaPlacement || "both",
          enabledSections: configForm.enabledSections ||
            prev.enabledSections || ["hero", "features", "cta"],
          keyFeatures: configForm.keyFeatures || prev.keyFeatures || [],
          faqItems: configForm.faqItems || prev.faqItems || [],
          problemStatement:
            configForm.problemStatement || prev.problemStatement || "",
          uniqueValue: configForm.uniqueValue || prev.uniqueValue || "",
          targetAudience:
            configForm.targetAudience || prev.targetAudience || "",
          metadata: configForm.metadata ||
            prev.metadata || {
              description:
                "Trade perpetual futures across EVM chains and Solana on a non-custodial DEX powered by Orderly Network. Unified liquidity, up to 50x leverage, and professional trading tools.",
              keywords: [
                "DEX",
                "perpetual futures",
                "Orderly Network",
                "omnichain trading",
                "DeFi",
                "cryptocurrency trading",
                "cross-chain",
                "leverage trading",
                "non-custodial",
                "EVM",
                "Solana",
              ],
            },
        }));

        const loadImage = async (
          imageData: unknown,
          setter: (blob: Blob | null) => void
        ) => {
          if (imageData && typeof imageData === "string") {
            try {
              const dataUrl = imageData.startsWith("data:")
                ? imageData
                : `data:image/webp;base64,${imageData}`;
              const blob = await base64ToBlob(dataUrl);
              setter(blob);
            } catch (error) {
              console.error("Error loading image:", error);
              setter(null);
            }
          } else {
            setter(null);
          }
        };

        loadImage(config.primaryLogoData, setPrimaryLogo);
        loadImage(config.secondaryLogoData, setSecondaryLogo);
        loadImage(config.bannerData, setBanner);
      }
      if (landingPageData.config?.generatedFiles) {
        const preview = combineGeneratedFilesToHtml(
          landingPageData.config.generatedFiles as GeneratedFile[],
          landingPageData.config as Record<string, unknown>
        );
        if (preview) {
          setPreviewHtml(preview);
        }
      }
    } else if (dexData && !landingPageData) {
      const dexThemeCSS = dexData.themeCSS || defaultTheme;
      const dexColors = extractDexColors(dexThemeCSS);
      if (dexColors) {
        setFormData(prev => ({
          ...prev,
          ...dexColors,
        }));
      }
      const dexLanguages = dexData.availableLanguages || ["en"];
      if (dexLanguages.length > 0) {
        setFormData(prev => ({
          ...prev,
          languages: dexLanguages,
        }));
      }
      setFormData(prev => {
        if (!prev.keyFeatures || prev.keyFeatures.length === 0) {
          return {
            ...prev,
            keyFeatures: [
              "Built on Orderly Network's omnichain infrastructure",
              "Trade perpetual futures across EVM chains and Solana",
              "Unified cross-chain liquidity pool",
              "Up to 50x leverage trading",
              "Advanced order types (limit, stop-loss, take-profit)",
              "Cross-margin account management",
              "Low trading fees with competitive spreads",
              "Sub-second order execution",
              "Real-time market data and analytics",
              "Professional risk management tools",
            ],
          };
        }
        return prev;
      });

      setFormData(prev => {
        if (!prev.faqItems || prev.faqItems.length === 0) {
          return {
            ...prev,
            faqItems: [
              {
                question:
                  "What is Orderly Network and how does it power this DEX?",
                answer:
                  "Orderly Network is an omnichain infrastructure layer that powers this DEX, providing unified liquidity across EVM chains and Solana. It enables seamless cross-chain perpetual futures trading with deep liquidity and professional-grade trading infrastructure.",
              },
              {
                question:
                  "Can I trade perpetual futures across different blockchains?",
                answer:
                  "Yes! This DEX is built on Orderly Network's omnichain infrastructure, allowing you to trade perpetual futures across multiple EVM chains and Solana from a single interface. Your positions and collateral are unified across all supported chains.",
              },
              {
                question: "What is the maximum leverage I can use?",
                answer:
                  "You can trade with up to 50x leverage on perpetual futures contracts. However, higher leverage increases both potential profits and risks. Always use appropriate risk management strategies and never risk more than you can afford to lose.",
              },
              {
                question: "How does cross-margin trading work?",
                answer:
                  "Cross-margin trading allows you to use your entire account balance as collateral for all open positions. This maximizes capital efficiency by sharing margin across positions, but also means that losses in one position can affect your other positions. Monitor your account health and use stop-loss orders to manage risk.",
              },
              {
                question: "What are the trading fees?",
                answer:
                  "Trading fees are competitive and vary based on whether you're a maker (providing liquidity) or taker (taking liquidity). Maker fees are typically lower than taker fees. Check the fee structure section for detailed information.",
              },
              {
                question: "Which wallets are supported?",
                answer:
                  "We support a wide range of wallets including MetaMask, WalletConnect-compatible wallets, Privy (for email and social logins), and Solana wallets. You can connect wallets from multiple chains to access the full omnichain trading experience.",
              },
              {
                question: "How do I manage my risk when trading with leverage?",
                answer:
                  "Use stop-loss orders to limit potential losses, maintain adequate margin levels, diversify your positions, and never risk more than you can afford to lose. Monitor your account health and liquidation price regularly. Consider using lower leverage until you're comfortable with the risks.",
              },
              {
                question: "What order types are available?",
                answer:
                  "We support multiple order types including market orders, limit orders, stop-loss orders, and take-profit orders. Advanced traders can also use conditional orders and trailing stops to implement sophisticated trading strategies.",
              },
              {
                question: "Is my collateral safe and secure?",
                answer:
                  "Yes. This DEX is non-custodial, meaning you maintain full control of your funds. Your collateral is secured by Orderly Network's infrastructure, which uses smart contracts on-chain. The platform has been audited and is built on battle-tested DeFi infrastructure. However, always be aware that trading involves risk, and you should never deposit more than you can afford to lose.",
              },
              {
                question: "How does the unified liquidity pool work?",
                answer:
                  "Orderly Network aggregates liquidity from across all supported chains into a unified pool. This means you get access to deeper liquidity, tighter spreads, and better execution prices regardless of which blockchain you're trading on. The unified pool ensures optimal trading conditions for all users.",
              },
            ],
          };
        }
        return prev;
      });

      setFormData(prev => {
        const needsDefaults =
          !prev.problemStatement || !prev.uniqueValue || !prev.targetAudience;
        if (needsDefaults) {
          return {
            ...prev,
            problemStatement:
              prev.problemStatement ||
              "Traditional decentralized exchanges are fragmented across different blockchains, forcing traders to manage multiple accounts and miss out on cross-chain opportunities. Perpetual futures trading has been limited by isolated liquidity pools and complex infrastructure requirements.",
            uniqueValue:
              prev.uniqueValue ||
              "Built on Orderly Network's omnichain infrastructure, this DEX breaks down blockchain barriers by providing unified liquidity across EVM chains and Solana. Trade perpetual futures with deep liquidity, competitive fees, and professional-grade tools—all from a single non-custodial interface. Experience seamless cross-chain trading with up to 50x leverage and advanced order types.",
            targetAudience:
              prev.targetAudience ||
              "Active crypto traders seeking professional perpetual futures trading, DeFi enthusiasts looking for omnichain solutions, and trading communities wanting a branded platform with Orderly Network's battle-tested infrastructure.",
          };
        }
        return prev;
      });

      setFormData(prev => {
        const needsMetadataDefaults =
          !prev.metadata?.description ||
          !prev.metadata?.keywords ||
          prev.metadata?.keywords.length === 0;
        if (needsMetadataDefaults) {
          return {
            ...prev,
            metadata: {
              description:
                prev.metadata?.description ||
                "Trade perpetual futures across EVM chains and Solana on a non-custodial DEX powered by Orderly Network. Unified liquidity, up to 50x leverage, and professional trading tools.",
              keywords:
                prev.metadata?.keywords && prev.metadata.keywords.length > 0
                  ? prev.metadata.keywords
                  : [
                      "DEX",
                      "perpetual futures",
                      "Orderly Network",
                      "omnichain trading",
                      "DeFi",
                      "cryptocurrency trading",
                      "cross-chain",
                      "leverage trading",
                      "non-custodial",
                      "EVM",
                      "Solana",
                    ],
            },
          };
        }
        return prev;
      });

      const hasSocialLinks =
        dexData.telegramLink || dexData.discordLink || dexData.xLink;
      setFormData(prev => {
        const currentSections = prev.enabledSections || [
          "hero",
          "features",
          "cta",
        ];
        const updatedSections =
          hasSocialLinks && !currentSections.includes("socials")
            ? [...currentSections, "socials"]
            : currentSections;

        return {
          ...prev,
          telegramLink: dexData.telegramLink || "",
          discordLink: dexData.discordLink || "",
          xLink: dexData.xLink || "",
          enabledSections: updatedSections,
        };
      });
    }
  }, [
    isAuthenticated,
    token,
    landingPageData,
    dexData,
    extractDexColors,
    base64ToBlob,
  ]);

  useEffect(() => {
    if (dexData && !landingPageData) {
      loadDexImages();
    }
  }, [dexData, landingPageData, loadDexImages]);

  useEffect(() => {
    if (!isLoading && !isDexLoading && !dexData) {
      navigate("/dex/page");
    }
  }, [dexData, isLoading, isDexLoading, navigate]);

  const handleInputChange = (
    field: keyof LandingPageConfigForm,
    value: unknown
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    if (landingPageData) {
      setShowWarning(true);
    }
  };

  const getDefaultDexUrl = useCallback(() => {
    if (dexData?.customDomain) {
      return `https://${dexData.customDomain}`;
    }
    if (deploymentUrl) {
      return deploymentUrl;
    }
    if (dexData?.repoUrl) {
      return `https://dex.orderly.network/${dexData.repoUrl.split("/").pop()}/`;
    }
    return "";
  }, [dexData, deploymentUrl]);

  useEffect(() => {
    const defaultUrl = getDefaultDexUrl();
    if (defaultUrl && !formData.ctaButtonLink) {
      setFormData(prev => ({ ...prev, ctaButtonLink: defaultUrl }));
    }
  }, [getDefaultDexUrl, formData.ctaButtonLink]);

  const sectionsWithConfig = [
    "cta",
    "features",
    "feeStructure",
    "faq",
    "team",
    "contact",
    "about",
    "socials",
  ];

  const openSectionConfig = useCallback(
    (sectionType: string) => {
      if (!sectionsWithConfig.includes(sectionType)) {
        return;
      }

      const sectionData: Record<string, unknown> = {};
      if (sectionType === "cta") {
        sectionData.ctaButtonText = formData.ctaButtonText || "Start Trading";
        sectionData.ctaButtonColor = formData.ctaButtonColor;
        sectionData.ctaButtonLink =
          formData.ctaButtonLink || getDefaultDexUrl() || "";
        sectionData.useCustomCtaColor = formData.useCustomCtaColor || false;
        sectionData.ctaPlacement = formData.ctaPlacement || "both";
        sectionData.primaryColor = formData.primaryColor;
      } else if (sectionType === "features") {
        sectionData.keyFeatures = formData.keyFeatures || [];
      } else if (sectionType === "faq") {
        sectionData.faqItems = formData.faqItems || [];
      } else if (sectionType === "team") {
        sectionData.teamMembers = formData.teamMembers || [];
      } else if (sectionType === "contact") {
        sectionData.contactMethods = formData.contactMethods || [];
      } else if (sectionType === "about") {
        sectionData.problemStatement = formData.problemStatement || "";
        sectionData.uniqueValue = formData.uniqueValue || "";
        sectionData.targetAudience = formData.targetAudience || "";
      } else if (sectionType === "feeStructure") {
        sectionData.makerFee = formData.makerFee;
        sectionData.takerFee = formData.takerFee;
        sectionData.rwaMakerFee = formData.rwaMakerFee;
        sectionData.rwaTakerFee = formData.rwaTakerFee;
      } else if (sectionType === "socials") {
        sectionData.telegramLink = formData.telegramLink || "";
        sectionData.discordLink = formData.discordLink || "";
        sectionData.xLink = formData.xLink || "";
      }

      try {
        openModal("sectionConfig", {
          sectionType,
          formData: sectionData,
          onUpdate: (section: string, data: Record<string, unknown>) => {
            if (section === "cta") {
              handleInputChange(
                "ctaButtonText",
                data.ctaButtonText || "Start Trading"
              );
              handleInputChange("ctaButtonColor", data.ctaButtonColor);
              handleInputChange(
                "ctaButtonLink",
                data.ctaButtonLink || getDefaultDexUrl() || ""
              );
              handleInputChange(
                "useCustomCtaColor",
                data.useCustomCtaColor || false
              );
              handleInputChange("ctaPlacement", data.ctaPlacement || "both");
            } else if (section === "features") {
              handleInputChange("keyFeatures", data.keyFeatures || []);
            } else if (section === "faq") {
              handleInputChange("faqItems", data.faqItems || []);
            } else if (section === "team") {
              handleInputChange("teamMembers", data.teamMembers || []);
            } else if (section === "contact") {
              handleInputChange("contactMethods", data.contactMethods || []);
            } else if (section === "about") {
              handleInputChange(
                "problemStatement",
                data.problemStatement || ""
              );
              handleInputChange("uniqueValue", data.uniqueValue || "");
              handleInputChange("targetAudience", data.targetAudience || "");
            } else if (section === "feeStructure") {
              handleInputChange("makerFee", data.makerFee);
              handleInputChange("takerFee", data.takerFee);
              handleInputChange("rwaMakerFee", data.rwaMakerFee);
              handleInputChange("rwaTakerFee", data.rwaTakerFee);
            } else if (section === "socials") {
              handleInputChange("telegramLink", data.telegramLink || "");
              handleInputChange("discordLink", data.discordLink || "");
              handleInputChange("xLink", data.xLink || "");
            }
          },
        });
      } catch (error) {
        console.error("Error calling openModal:", error);
      }
    },
    [formData, getDefaultDexUrl, openModal, handleInputChange]
  );

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result;
        if (typeof result === "string") {
          resolve(result);
        } else {
          reject(new Error("Failed to convert blob to base64"));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const prepareTeamMembersForSubmission = async (
    members: TeamMember[]
  ): Promise<Array<Omit<TeamMember, "image"> & { imageData?: string }>> => {
    return Promise.all(
      members.map(async member => {
        const { image, ...rest } = member;
        if (image instanceof Blob) {
          const imageData = await blobToBase64(image);
          return { ...rest, imageData };
        }
        return rest;
      })
    );
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!token) {
      toast.error("Authentication required");
      return;
    }

    setIsSaving(true);

    try {
      const preparedFormData = {
        ...formData,
        teamMembers: formData.teamMembers
          ? await prepareTeamMembersForSubmission(formData.teamMembers)
          : formData.teamMembers,
      };

      const formDataToSend = createLandingPageFormData(preparedFormData, {
        primaryLogo,
        secondaryLogo,
        banner,
      });

      if (landingPageData) {
        const result = await putFormData<{ id: string }>(
          `api/landing-page/${landingPageData.id}`,
          formDataToSend,
          token
        );

        if (result) {
          toast.success("Landing page configuration updated!");
          refreshLandingPageData();
          setShowWarning(false);
        }
      } else {
        const result = await postFormData<{ id: string }>(
          "api/landing-page",
          formDataToSend,
          token
        );

        if (result) {
          toast.success("Landing page created successfully!");
          refreshLandingPageData();
          navigate("/dex/page");
        }
      }
    } catch (error) {
      console.error("Error saving landing page:", error);
      toast.error("Failed to save landing page configuration");
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    if (
      editMode === "modifyConfig" &&
      landingPageData &&
      landingPageData.config
    ) {
      const config = landingPageData.config as Record<string, unknown>;
      const configForm = config as Partial<LandingPageConfigForm>;

      setFormData(prev => ({
        ...prev,
        ...configForm,
        ctaButtonText:
          configForm.ctaButtonText || prev.ctaButtonText || "Start Trading",
        ctaPlacement: configForm.ctaPlacement || prev.ctaPlacement || "both",
        enabledSections: configForm.enabledSections ||
          prev.enabledSections || ["hero", "features", "cta"],
        keyFeatures: configForm.keyFeatures || prev.keyFeatures || [],
        faqItems: configForm.faqItems || prev.faqItems || [],
        teamMembers:
          migrateTeamMembers(config.teamMembers) || prev.teamMembers || [],
        problemStatement:
          configForm.problemStatement || prev.problemStatement || "",
        uniqueValue: configForm.uniqueValue || prev.uniqueValue || "",
        targetAudience: configForm.targetAudience || prev.targetAudience || "",
        metadata: configForm.metadata ||
          prev.metadata || {
            description:
              "Trade perpetual futures across EVM chains and Solana on a non-custodial DEX powered by Orderly Network. Unified liquidity, up to 50x leverage, and professional trading tools.",
            keywords: [
              "DEX",
              "perpetual futures",
              "Orderly Network",
              "omnichain trading",
              "DeFi",
              "cryptocurrency trading",
              "cross-chain",
              "leverage trading",
              "non-custodial",
              "EVM",
              "Solana",
            ],
          },
      }));

      const loadImage = async (
        imageData: unknown,
        setter: (blob: Blob | null) => void
      ) => {
        if (imageData && typeof imageData === "string") {
          try {
            const dataUrl = imageData.startsWith("data:")
              ? imageData
              : `data:image/webp;base64,${imageData}`;
            const blob = await base64ToBlob(dataUrl);
            setter(blob);
          } catch (error) {
            console.error("Error loading image:", error);
            setter(null);
          }
        } else {
          setter(null);
        }
      };

      loadImage(config.primaryLogoData, setPrimaryLogo);
      loadImage(config.secondaryLogoData, setSecondaryLogo);
      loadImage(config.bannerData, setBanner);

      const migratedMembers = migrateTeamMembers(config.teamMembers);
      if (migratedMembers && migratedMembers.length > 0) {
        Promise.all(
          migratedMembers.map(async (member, index) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const memberWithImageData = member as any;
            if (
              memberWithImageData.imageData &&
              typeof memberWithImageData.imageData === "string"
            ) {
              try {
                const dataUrl = memberWithImageData.imageData.startsWith(
                  "data:"
                )
                  ? memberWithImageData.imageData
                  : `data:image/webp;base64,${memberWithImageData.imageData}`;
                const blob = await base64ToBlob(dataUrl);
                setFormData(prev => {
                  const updatedMembers = [...(prev.teamMembers || [])];
                  if (updatedMembers[index]) {
                    updatedMembers[index] = {
                      ...updatedMembers[index],
                      image: blob,
                    };
                  }
                  return { ...prev, teamMembers: updatedMembers };
                });
              } catch (error) {
                console.error("Error loading team member image:", error);
              }
            }
          })
        ).catch(error => {
          console.error("Error loading team member images:", error);
        });
      }
    }
  }, [editMode, landingPageData, base64ToBlob]);

  if (isLoading || isDexLoading || isLandingPageLoading) {
    return (
      <div className="w-full h-[calc(100vh-64px)] flex items-center justify-center px-4 mt-26 pb-52">
        <div className="text-center">
          <div className="i-svg-spinners:pulse-rings-multiple h-12 w-12 mx-auto text-primary-light mb-4"></div>
          <div className="text-base md:text-lg mb-2">Loading configuration</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="w-full max-w-3xl mx-auto px-4 py-6 md:py-10 mt-26 pb-52">
        <div className="text-center">
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold mb-4 md:mb-6">
            Configure Landing Page
          </h1>
          <Card>
            <h2 className="text-lg md:text-xl font-medium mb-3 md:mb-4">
              Authentication Required
            </h2>
            <p className="mb-4 md:mb-6 text-sm md:text-base text-gray-300">
              Please connect your wallet and login to configure your landing
              page.
            </p>
            <div className="flex justify-center">
              <WalletConnect />
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (!dexData) {
    return (
      <div className="w-full max-w-3xl mx-auto px-4 py-6 md:py-10 mt-26 pb-52">
        <Card className="bg-warning/10 border border-warning/30">
          <div className="text-center">
            <div className="i-mdi:warning text-warning h-12 w-12 mx-auto mb-4"></div>
            <h2 className="text-xl md:text-2xl font-bold mb-4">DEX Required</h2>
            <p className="text-gray-300 mb-6">
              You need to create a DEX first before configuring a landing page.
            </p>
            <Button as="a" href="/dex" className="whitespace-nowrap">
              Create Your DEX
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-7xl mt-26 pb-52">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <Link
            to="/dex/page"
            className="text-sm text-gray-400 hover:text-primary-light mb-2 inline-flex items-center"
          >
            <div className="i-mdi:arrow-left h-4 w-4 mr-1"></div>
            Back to Landing Page
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold gradient-text">
            Configure Landing Page
          </h1>
        </div>
      </div>

      {showWarning && (
        <Card className="mb-6 bg-warning/10 border border-warning/30">
          <div className="flex items-start gap-3">
            <div className="i-mdi:warning text-warning h-6 w-6 flex-shrink-0 mt-0.5"></div>
            <div>
              <h3 className="font-semibold text-warning mb-1">
                Configuration Change Warning
              </h3>
              <p className="text-sm text-gray-300">
                Changing these settings will regenerate your landing page. The
                current content will be replaced.
              </p>
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          {landingPageData && !editMode ? (
            <Card>
              <h2 className="text-xl font-bold mb-4">Modify Landing Page</h2>
              <p className="text-gray-300 mb-4">
                Choose how you want to modify your landing page:
              </p>
              <div className="space-y-4">
                <Button
                  onClick={() => setEditMode("modifyConfig")}
                  variant="primary"
                  className="w-full"
                  type="button"
                >
                  <span className="flex items-center gap-2 justify-center">
                    <div className="i-mdi:cog h-5 w-5"></div>
                    Modify Initial Config
                  </span>
                </Button>
                <p className="text-sm text-gray-400 text-center">
                  Update your configuration and regenerate the entire landing
                  page with AI, using your existing page as context.
                </p>
                <Button
                  onClick={() => setEditMode("interactive")}
                  variant="secondary"
                  className="w-full"
                  type="button"
                >
                  <span className="flex items-center gap-2 justify-center">
                    <div className="i-mdi:cursor-pointer h-5 w-5"></div>
                    Interactive Edit Mode
                  </span>
                </Button>
                <p className="text-sm text-gray-400 text-center">
                  Ctrl+click elements on your landing page to modify them via
                  AI.
                </p>
              </div>
            </Card>
          ) : editMode === "interactive" ? (
            <>
              <LandingPageEditModal
                isOpen={true}
                onClose={() => {
                  setEditMode(null);
                  setInteractiveHasChanges(false);
                }}
                previewHtml={previewHtml || ""}
                generatedFiles={
                  currentGeneratedFiles ||
                  (landingPageData?.config
                    ?.generatedFiles as GeneratedFile[]) ||
                  []
                }
                landingPageId={landingPageData?.id || ""}
                token={token}
                onFilesUpdate={(updatedFiles: GeneratedFile[]) => {
                  setCurrentGeneratedFiles(updatedFiles);
                  const newPreview = combineGeneratedFilesToHtml(
                    updatedFiles,
                    landingPageData?.config as Record<string, unknown>,
                    teamMemberImageUrls,
                    brandingImageUrls
                  );
                  if (newPreview) {
                    setPreviewHtml(newPreview);
                  }
                }}
                onSave={async () => {
                  if (!landingPageData?.id) return;
                  await post(
                    `api/landing-page/${landingPageData.id}/deploy`,
                    { generatedFiles: currentGeneratedFiles },
                    token
                  );
                  setInteractiveHasChanges(false);
                  await refreshLandingPageData();
                  setEditMode(null);
                }}
                hasChanges={interactiveHasChanges}
                onMarkDirty={() => setInteractiveHasChanges(true)}
                teamMemberImageUrls={teamMemberImageUrls}
                brandingImageUrls={brandingImageUrls}
              />
            </>
          ) : (
            <>
              {editMode === "modifyConfig" && (
                <Card className="mb-4">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold">Modify Initial Config</h2>
                    <Button
                      onClick={() => setEditMode(null)}
                      variant="ghost"
                      size="sm"
                      type="button"
                    >
                      <div className="i-mdi:close h-5 w-5"></div>
                    </Button>
                  </div>
                  <p className="text-gray-300 mb-4">
                    Update your configuration below. The AI will regenerate your
                    entire landing page using your existing page as context.
                  </p>
                </Card>
              )}
              <Form
                onSubmit={
                  editMode === "modifyConfig"
                    ? async e => {
                        e.preventDefault();
                        if (!token || !landingPageData) return;

                        setIsSaving(true);
                        setIsGenerating(true);

                        try {
                          const preparedFormData = {
                            ...formData,
                            teamMembers: formData.teamMembers
                              ? await prepareTeamMembersForSubmission(
                                  formData.teamMembers
                                )
                              : formData.teamMembers,
                          };

                          const formDataToSend = createLandingPageFormData(
                            preparedFormData,
                            {
                              primaryLogo,
                              secondaryLogo,
                              banner,
                            }
                          );

                          const updateResult = await putFormData<{
                            id: string;
                          }>(
                            `api/landing-page/${landingPageData.id}`,
                            formDataToSend,
                            token
                          );

                          if (updateResult) {
                            const existingFiles = landingPageData.config
                              ?.generatedFiles as GeneratedFile[] | undefined;
                            const regenerateResult = await post<{
                              landingPage: LandingPage;
                            }>(
                              `api/landing-page/${landingPageData.id}/regenerate`,
                              {
                                prompt: formData.aiDescription || "",
                                existingFiles: existingFiles || [],
                              },
                              token
                            );

                            if (regenerateResult?.landingPage) {
                              await refreshLandingPageData();
                              if (
                                regenerateResult.landingPage.config
                                  ?.generatedFiles
                              ) {
                                const newFiles = regenerateResult.landingPage
                                  .config.generatedFiles as GeneratedFile[];
                                setCurrentGeneratedFiles(newFiles);
                                const preview = combineGeneratedFilesToHtml(
                                  newFiles,
                                  regenerateResult.landingPage.config as Record<
                                    string,
                                    unknown
                                  >,
                                  teamMemberImageUrls,
                                  brandingImageUrls
                                );
                                if (preview) {
                                  setPreviewHtml(preview);
                                }
                              }
                              toast.success(
                                "Landing page regenerated successfully!"
                              );
                              setEditMode(null);
                            }
                          }
                        } catch (error) {
                          console.error(
                            "Error regenerating landing page:",
                            error
                          );
                          toast.error("Failed to regenerate landing page");
                        } finally {
                          setIsSaving(false);
                          setIsGenerating(false);
                        }
                      }
                    : handleSubmit
                }
                className="space-y-6"
                submitText={
                  editMode === "modifyConfig"
                    ? "Update & Regenerate"
                    : landingPageData
                      ? "Update Configuration"
                      : "Create Landing Page"
                }
                isLoading={
                  isSaving || (editMode === "modifyConfig" && isGenerating)
                }
                loadingText={
                  editMode === "modifyConfig" ? "Regenerating..." : "Saving"
                }
                disabled={false}
              >
                {!landingPageData && formData.aiDescription && (
                  <Card className="bg-primary/10 border border-primary/30">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="i-mdi:lightbulb-on text-primary h-6 w-6 flex-shrink-0 mt-0.5"></div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-primary mb-1">
                          Ready to Generate
                        </h3>
                        <p className="text-sm text-gray-300 mb-4">
                          You can generate your landing page using the AI
                          description you provided. Save the configuration
                          first, then click generate.
                        </p>
                        <Button
                          type="button"
                          variant="primary"
                          onClick={async () => {
                            if (!token) {
                              toast.error("Authentication required");
                              return;
                            }

                            if (!landingPageData) {
                              try {
                                const preparedFormData = {
                                  ...formData,
                                  teamMembers: formData.teamMembers
                                    ? await prepareTeamMembersForSubmission(
                                        formData.teamMembers
                                      )
                                    : formData.teamMembers,
                                };

                                const formDataToSend =
                                  createLandingPageFormData(preparedFormData, {
                                    primaryLogo,
                                    secondaryLogo,
                                    banner,
                                  });
                                const result = await postFormData<{
                                  id: string;
                                }>("api/landing-page", formDataToSend, token);

                                if (result) {
                                  await refreshLandingPageData();
                                  if (result.id) {
                                    setIsGenerating(true);
                                    try {
                                      const genResult = await post<{
                                        landingPage: LandingPage;
                                      }>(
                                        `api/landing-page/${result.id}/generate`,
                                        {
                                          prompt: formData.aiDescription || "",
                                        },
                                        token
                                      );

                                      if (genResult && genResult.landingPage) {
                                        await refreshLandingPageData();

                                        if (
                                          genResult.landingPage.config
                                            ?.generatedFiles
                                        ) {
                                          const newFiles = genResult.landingPage
                                            .config
                                            .generatedFiles as GeneratedFile[];
                                          setCurrentGeneratedFiles(newFiles);
                                          const preview =
                                            combineGeneratedFilesToHtml(
                                              newFiles,
                                              genResult.landingPage
                                                .config as Record<
                                                string,
                                                unknown
                                              >,
                                              teamMemberImageUrls,
                                              brandingImageUrls
                                            );
                                          if (preview) {
                                            setPreviewHtml(preview);
                                          }
                                        }
                                        toast.success(
                                          "Landing page generated successfully!"
                                        );
                                      }
                                    } catch (error) {
                                      console.error(
                                        "Error generating landing page:",
                                        error
                                      );
                                      toast.error(
                                        "Failed to generate landing page"
                                      );
                                    } finally {
                                      setIsGenerating(false);
                                    }
                                  }
                                }
                              } catch (error) {
                                console.error(
                                  "Error creating landing page:",
                                  error
                                );
                                toast.error(
                                  "Failed to create landing page. Please try again."
                                );
                              }
                            }
                          }}
                          disabled={isGenerating || isSaving}
                          className="w-full"
                        >
                          {isGenerating
                            ? "Generating..."
                            : "Generate Landing Page with AI"}
                        </Button>
                      </div>
                    </div>
                  </Card>
                )}
                <LandingPageBasicInfoForm
                  formData={formData}
                  onInputChange={handleInputChange}
                />

                <LandingPageBrandingForm
                  primaryLogo={primaryLogo}
                  secondaryLogo={secondaryLogo}
                  banner={banner}
                  onPrimaryLogoChange={setPrimaryLogo}
                  onSecondaryLogoChange={setSecondaryLogo}
                  onBannerChange={setBanner}
                  showResetButton={
                    !!(
                      dexData &&
                      (dexData.primaryLogo ||
                        dexData.secondaryLogo ||
                        dexData.banner)
                    )
                  }
                  onReset={loadDexImages}
                />

                <LandingPageDesignForm
                  formData={formData}
                  onInputChange={handleInputChange}
                  showResetButton={!!dexData}
                  onReset={loadDexColors}
                />

                <LandingPageLanguagesForm
                  formData={formData}
                  onLanguagesChange={languages =>
                    setFormData(prev => ({ ...prev, languages }))
                  }
                />

                <LandingPageMetadataForm
                  formData={formData}
                  onInputChange={handleInputChange}
                />

                <LandingPageSectionsForm
                  formData={formData}
                  onInputChange={handleInputChange}
                  sectionsWithConfig={sectionsWithConfig}
                  onOpenSectionConfig={openSectionConfig}
                />
              </Form>
            </>
          )}
        </div>

        <div>
          <LandingPagePreviewPanel previewHtml={previewHtml} />
        </div>
      </div>
    </div>
  );
}
