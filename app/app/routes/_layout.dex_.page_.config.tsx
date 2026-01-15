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
import { AVAILABLE_LANGUAGES } from "../components/LanguageSupportSection";
import { FaqItem } from "../components/EditableFaqList";
import ImagePaste from "../components/ImagePaste";

const FONT_FAMILIES = [
  {
    name: "Manrope",
    value: "'Manrope', sans-serif",
    category: "Default",
  },
  {
    name: "Roboto",
    value: "'Roboto', sans-serif",
    category: "Modern",
  },
  {
    name: "Open Sans",
    value: "'Open Sans', sans-serif",
    category: "Readable",
  },
  {
    name: "Lato",
    value: "'Lato', sans-serif",
    category: "Readable",
  },
  {
    name: "Poppins",
    value: "'Poppins', sans-serif",
    category: "Modern",
  },
  {
    name: "Source Sans Pro",
    value: "'Source Sans Pro', sans-serif",
    category: "Readable",
  },
  {
    name: "Nunito",
    value: "'Nunito', sans-serif",
    category: "Friendly",
  },
  {
    name: "Montserrat",
    value: "'Montserrat', sans-serif",
    category: "Modern",
  },
  {
    name: "Raleway",
    value: "'Raleway', sans-serif",
    category: "Elegant",
  },
  {
    name: "Ubuntu",
    value: "'Ubuntu', sans-serif",
    category: "Modern",
  },
  {
    name: "Fira Sans",
    value: "'Fira Sans', sans-serif",
    category: "Technical",
  },
];

export const meta: MetaFunction = () => [
  { title: "Configure Landing Page - Orderly One" },
  {
    name: "description",
    content:
      "Configure your landing page. Set up branding, content, and design for your DEX landing page.",
  },
];

interface LandingPageConfigForm {
  title: string;
  subtitle?: string;
  aiDescription?: string;
  theme: "light" | "dark";
  primaryColor: string;
  primaryLight?: string;
  primaryDarken?: string;
  secondaryColor: string;
  linkColor?: string;
  successColor?: string;
  dangerColor?: string;
  warningColor?: string;
  fontFamily: string;
  languages: string[];
  ctaButtonText?: string;
  ctaButtonColor?: string;
  useCustomCtaColor?: boolean;
  ctaPlacement?: "hero" | "footer" | "both";
  enabledSections?: string[];
  telegramLink?: string;
  discordLink?: string;
  xLink?: string;
  problemStatement?: string;
  uniqueValue?: string;
  targetAudience?: string;
  keyFeatures?: string[];
  faqItems?: FaqItem[];
  teamMembers?: string[];
  contactMethods?: string[];
  makerFee?: number;
  takerFee?: number;
  rwaMakerFee?: number;
  rwaTakerFee?: number;
  sections: Array<{
    type: "hero" | "features" | "about" | "contact" | "custom";
    content: Record<string, unknown>;
    order: number;
  }>;
  metadata?: {
    description?: string;
    keywords?: string[];
    favicon?: string;
  };
}

export default function LandingPageConfigRoute() {
  const { isAuthenticated, token, isLoading } = useAuth();
  const { dexData, isLoading: isDexLoading } = useDex();
  const {
    landingPageData,
    isLoading: isLandingPageLoading,
    refreshLandingPageData,
    updateLandingPageData,
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
    useCustomCtaColor: false,
    ctaPlacement: "both",
    enabledSections: ["hero", "features", "cta"],
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
  const [chatMode, setChatMode] = useState(false);
  const [chatPrompt, setChatPrompt] = useState("");
  const [showWarning, setShowWarning] = useState(false);

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
      setChatMode(true);
      if (landingPageData.config) {
        const config = landingPageData.config as Partial<LandingPageConfigForm>;
        setFormData(prev => ({
          ...prev,
          ...config,
          ctaButtonText:
            config.ctaButtonText || prev.ctaButtonText || "Start Trading",
          ctaPlacement: config.ctaPlacement || prev.ctaPlacement || "both",
          enabledSections: config.enabledSections ||
            prev.enabledSections || ["hero", "features", "cta"],
          keyFeatures: config.keyFeatures || prev.keyFeatures || [],
          faqItems: config.faqItems || prev.faqItems || [],
          problemStatement:
            config.problemStatement || prev.problemStatement || "",
          uniqueValue: config.uniqueValue || prev.uniqueValue || "",
          targetAudience: config.targetAudience || prev.targetAudience || "",
          metadata: config.metadata ||
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
      }
      if (landingPageData.htmlContent) {
        setPreviewHtml(landingPageData.htmlContent);
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

      // Set default SEO & Metadata if not already set
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
  }, [isAuthenticated, token, landingPageData, dexData, extractDexColors]);

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

  const sectionsWithConfig = [
    "cta",
    "features",
    "feeStructure",
    "faq",
    "team",
    "contact",
    "about",
    "socials",
  ]; // Sections that have dedicated configuration

  const openSectionConfig = (sectionType: string) => {
    console.log("openSectionConfig called with:", sectionType);
    console.log("sectionsWithConfig:", sectionsWithConfig);
    console.log("openModal function:", openModal);

    if (!sectionsWithConfig.includes(sectionType)) {
      console.log("Section not in config list, returning");
      return; // Don't open modal for sections without config
    }

    const sectionData: Record<string, unknown> = {};
    if (sectionType === "cta") {
      sectionData.ctaButtonText = formData.ctaButtonText || "Start Trading";
      sectionData.ctaButtonColor = formData.ctaButtonColor;
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

    console.log("Calling openModal with:", {
      sectionType,
      formData: sectionData,
    });

    try {
      openModal("sectionConfig", {
        sectionType,
        formData: sectionData,
        onUpdate: (section: string, data: Record<string, unknown>) => {
          console.log("onUpdate called:", section, data);
          if (section === "cta") {
            handleInputChange(
              "ctaButtonText",
              data.ctaButtonText || "Start Trading"
            );
            handleInputChange("ctaButtonColor", data.ctaButtonColor);
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
            handleInputChange("problemStatement", data.problemStatement || "");
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
      console.log("openModal called successfully");
    } catch (error) {
      console.error("Error calling openModal:", error);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!token) {
      toast.error("Authentication required");
      return;
    }

    setIsSaving(true);

    try {
      const formDataToSend = createLandingPageFormData(formData, {
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

  const handleGenerate = async () => {
    if (!landingPageData || !token) {
      toast.error("Landing page must be created first");
      return;
    }

    if (!chatPrompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }

    setIsGenerating(true);

    try {
      const result = await post<{ landingPage: { htmlContent: string } }>(
        `api/landing-page/${landingPageData.id}/generate`,
        { prompt: chatPrompt },
        token
      );

      if (result && result.landingPage) {
        setPreviewHtml(result.landingPage.htmlContent);
        updateLandingPageData({ htmlContent: result.landingPage.htmlContent });
        toast.success("Landing page generated successfully!");
        setChatPrompt("");
      }
    } catch (error) {
      console.error("Error generating landing page:", error);
      toast.error("Failed to generate landing page");
    } finally {
      setIsGenerating(false);
    }
  };

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
            {chatMode ? "Fine-tune Landing Page" : "Configure Landing Page"}
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
          {chatMode ? (
            <Card>
              <h2 className="text-xl font-bold mb-4">Chat Mode</h2>
              <p className="text-gray-300 mb-4">
                Fine-tune your landing page by describing the changes you want.
              </p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Describe your changes
                  </label>
                  <textarea
                    value={chatPrompt}
                    onChange={e => setChatPrompt(e.target.value)}
                    placeholder="e.g., Make the hero section more vibrant, add a fee structure section, change colors to blue..."
                    className="w-full p-3 bg-background-dark border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary"
                    rows={6}
                  />
                </div>
                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating || !chatPrompt.trim()}
                  className="w-full"
                >
                  {isGenerating ? "Generating..." : "Generate Changes"}
                </Button>
              </div>
            </Card>
          ) : (
            <Form
              onSubmit={handleSubmit}
              className="space-y-6"
              submitText={
                landingPageData ? "Update Configuration" : "Create Landing Page"
              }
              isLoading={isSaving}
              loadingText="Saving"
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
                        description you provided. Save the configuration first,
                        then click generate.
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
                              const formDataToSend = createLandingPageFormData(
                                formData,
                                {
                                  primaryLogo,
                                  secondaryLogo,
                                  banner,
                                }
                              );
                              const result = await postFormData<{ id: string }>(
                                "api/landing-page",
                                formDataToSend,
                                token
                              );

                              if (result) {
                                await refreshLandingPageData();
                                if (result.id) {
                                  setIsGenerating(true);
                                  try {
                                    const genResult = await post<{
                                      landingPage: { htmlContent: string };
                                    }>(
                                      `api/landing-page/${result.id}/generate`,
                                      {
                                        prompt: formData.aiDescription || "",
                                      },
                                      token
                                    );

                                    if (genResult && genResult.landingPage) {
                                      setPreviewHtml(
                                        genResult.landingPage.htmlContent
                                      );
                                      await refreshLandingPageData();
                                      toast.success(
                                        "Landing page generated successfully!"
                                      );
                                      setChatMode(true);
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
              <Card>
                <h2 className="text-lg font-bold mb-4">Basic Information</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Title *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={e => handleInputChange("title", e.target.value)}
                      placeholder="Your Landing Page Title"
                      className="w-full p-3 bg-background-dark border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Subtitle
                    </label>
                    <input
                      type="text"
                      value={formData.subtitle || ""}
                      onChange={e =>
                        handleInputChange("subtitle", e.target.value)
                      }
                      placeholder="A brief description"
                      className="w-full p-3 bg-background-dark border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      AI Description
                    </label>
                    <p className="text-xs text-gray-400 mb-2">
                      Describe your landing page vision for AI generation. This
                      helps the AI understand what you want to create.
                    </p>
                    <textarea
                      value={formData.aiDescription || ""}
                      onChange={e =>
                        handleInputChange("aiDescription", e.target.value)
                      }
                      placeholder="e.g., A modern landing page for a DeFi DEX with a hero section showcasing trading features, a features section highlighting low fees and fast transactions, and a call-to-action section..."
                      className="w-full p-3 bg-background-dark border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary"
                      rows={5}
                    />
                  </div>
                </div>
              </Card>

              <Card>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold">Branding</h2>
                  {dexData &&
                    (dexData.primaryLogo ||
                      dexData.secondaryLogo ||
                      dexData.banner) && (
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={loadDexImages}
                      >
                        <div className="i-mdi:refresh h-4 w-4 mr-2"></div>
                        Reset
                      </Button>
                    )}
                </div>
                <div className="space-y-4">
                  <div>
                    <ImagePaste
                      id="landingPagePrimaryLogo"
                      label={
                        <>
                          Primary Logo{" "}
                          <span className="text-gray-400 text-sm font-normal">
                            (optional)
                          </span>
                        </>
                      }
                      value={primaryLogo || undefined}
                      onChange={setPrimaryLogo}
                      imageType="primaryLogo"
                      helpText="Main logo for your landing page. Recommended: 400x400px or larger."
                    />
                  </div>
                  <div>
                    <ImagePaste
                      id="landingPageSecondaryLogo"
                      label={
                        <>
                          Secondary Logo{" "}
                          <span className="text-gray-400 text-sm font-normal">
                            (optional)
                          </span>
                        </>
                      }
                      value={secondaryLogo || undefined}
                      onChange={setSecondaryLogo}
                      imageType="secondaryLogo"
                      helpText="Secondary logo for footer and other areas. Recommended: 200x200px or larger."
                    />
                  </div>
                  <div>
                    <ImagePaste
                      id="landingPageBanner"
                      label={
                        <>
                          Banner Image{" "}
                          <span className="text-gray-400 text-sm font-normal">
                            (optional)
                          </span>
                        </>
                      }
                      value={banner || undefined}
                      onChange={setBanner}
                      imageType="banner"
                      helpText="Large banner image for hero section. Recommended: 1200x400px or larger."
                    />
                  </div>
                </div>
              </Card>

              <Card>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold">Design & Colors</h2>
                  {dexData && (
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={loadDexColors}
                    >
                      <div className="i-mdi:refresh h-4 w-4 mr-2"></div>
                      Reset
                    </Button>
                  )}
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Default Theme
                    </label>
                    <p className="text-xs text-gray-400 mb-2">
                      The default theme for the landing page. Users can toggle
                      between light and dark modes.
                    </p>
                    <select
                      value={formData.theme}
                      onChange={e =>
                        handleInputChange(
                          "theme",
                          e.target.value as "light" | "dark"
                        )
                      }
                      className="w-full p-3 bg-background-dark border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary"
                    >
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                    </select>
                  </div>

                  <div className="border-t border-gray-700 pt-4">
                    <label className="block text-sm font-medium mb-3">
                      Color Palette
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Primary Color
                        </label>
                        <input
                          type="color"
                          value={formData.primaryColor}
                          onChange={e =>
                            handleInputChange("primaryColor", e.target.value)
                          }
                          className="w-full h-10 bg-background-dark border border-gray-700 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Secondary Color
                        </label>
                        <input
                          type="color"
                          value={formData.secondaryColor}
                          onChange={e =>
                            handleInputChange("secondaryColor", e.target.value)
                          }
                          className="w-full h-10 bg-background-dark border border-gray-700 rounded-lg"
                        />
                      </div>
                      {formData.primaryLight && (
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Primary Light
                          </label>
                          <input
                            type="color"
                            value={formData.primaryLight}
                            onChange={e =>
                              handleInputChange("primaryLight", e.target.value)
                            }
                            className="w-full h-10 bg-background-dark border border-gray-700 rounded-lg"
                          />
                        </div>
                      )}
                      {formData.linkColor && (
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Link Color
                          </label>
                          <input
                            type="color"
                            value={formData.linkColor}
                            onChange={e =>
                              handleInputChange("linkColor", e.target.value)
                            }
                            className="w-full h-10 bg-background-dark border border-gray-700 rounded-lg"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Font Family
                    </label>
                    <select
                      value={formData.fontFamily}
                      onChange={e =>
                        handleInputChange("fontFamily", e.target.value)
                      }
                      className="w-full p-3 bg-background-dark border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary"
                      style={{ fontFamily: formData.fontFamily }}
                    >
                      {FONT_FAMILIES.map(font => (
                        <option key={font.value} value={font.value}>
                          {font.name} ({font.category})
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-400 mt-1">
                      Selected font:{" "}
                      <span style={{ fontFamily: formData.fontFamily }}>
                        ABC abc 123
                      </span>
                    </p>
                  </div>
                </div>
              </Card>

              <Card>
                <h2 className="text-lg font-bold mb-4">Supported Languages</h2>
                <div className="space-y-4">
                  <div className="mb-3">
                    <p className="text-xs text-gray-400 mb-2">
                      Select languages for your landing page. At least one
                      language is required.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {AVAILABLE_LANGUAGES.map(language => {
                      const isSelected = formData.languages.includes(
                        language.code
                      );

                      return (
                        <button
                          key={language.code}
                          type="button"
                          onClick={() => {
                            const newLanguages = isSelected
                              ? formData.languages.filter(
                                  code => code !== language.code
                                )
                              : [...formData.languages, language.code];

                            // Ensure at least one language is selected
                            if (newLanguages.length === 0) {
                              toast.error(
                                "At least one language must be selected"
                              );
                              return;
                            }

                            setFormData(prev => ({
                              ...prev,
                              languages: newLanguages,
                            }));
                          }}
                          className={`
                            flex items-center gap-2 p-2 rounded-lg border text-sm transition-all cursor-pointer
                            ${
                              isSelected
                                ? "bg-primary/20 border-primary text-primary-light"
                                : "bg-background-dark/50 border-light/10 text-gray-300 hover:border-light/20 hover:bg-background-dark/80"
                            }
                          `}
                        >
                          <span className="text-base">{language.flag}</span>
                          <span className="flex-1 text-left truncate">
                            {language.name}
                          </span>
                          {isSelected && (
                            <div className="i-mdi:check h-4 w-4 text-primary-light flex-shrink-0"></div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  {formData.languages.length === 0 && (
                    <div className="text-center py-4 text-gray-400 text-sm mt-2">
                      <div className="i-mdi:information-outline h-5 w-5 mx-auto mb-2"></div>
                      No languages selected. At least one language is required.
                    </div>
                  )}
                </div>
              </Card>

              <Card>
                <h2 className="text-lg font-bold mb-4">SEO & Metadata</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Meta Description
                    </label>
                    <p className="text-xs text-gray-400 mb-2">
                      A brief description of your landing page for search
                      engines (150-160 characters recommended). If left empty,
                      the AI will generate one.
                    </p>
                    <textarea
                      value={formData.metadata?.description || ""}
                      onChange={e =>
                        handleInputChange("metadata", {
                          ...formData.metadata,
                          description: e.target.value,
                        })
                      }
                      placeholder="e.g., Trade cryptocurrencies with zero fees on our advanced DEX platform..."
                      maxLength={300}
                      className="w-full p-3 bg-background-dark border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary"
                      rows={3}
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      {(formData.metadata?.description || "").length}/300
                      characters
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Meta Keywords
                    </label>
                    <p className="text-xs text-gray-400 mb-2">
                      Comma-separated keywords for SEO (e.g., "DEX, trading,
                      cryptocurrency, DeFi").
                    </p>
                    <input
                      type="text"
                      value={(formData.metadata?.keywords || []).join(", ")}
                      onChange={e => {
                        const keywords = e.target.value
                          .split(",")
                          .map(k => k.trim())
                          .filter(k => k.length > 0);
                        handleInputChange("metadata", {
                          ...formData.metadata,
                          keywords,
                        });
                      }}
                      placeholder="DEX, trading, cryptocurrency, DeFi, blockchain"
                      className="w-full p-3 bg-background-dark border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      {(formData.metadata?.keywords || []).length} keyword(s)
                      added
                    </p>
                  </div>
                </div>
              </Card>

              {/* Page Sections */}
              <Card>
                <h2 className="text-lg font-bold mb-4">Page Sections</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Enable Sections
                    </label>
                    <p className="text-xs text-gray-400 mb-2">
                      Select which sections to include on your landing page. The
                      AI will generate appropriate content for each enabled
                      section.
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {[
                        { id: "hero", label: "Hero", icon: "i-mdi:home" },
                        {
                          id: "cta",
                          label: "CTA",
                          icon: "i-mdi:cursor-pointer",
                        },
                        {
                          id: "about",
                          label: "About",
                          icon: "i-mdi:information",
                        },
                        {
                          id: "features",
                          label: "Features",
                          icon: "i-mdi:star",
                        },
                        {
                          id: "feeStructure",
                          label: "Fee Structure",
                          icon: "i-mdi:percent",
                        },
                        { id: "faq", label: "FAQ", icon: "i-mdi:help-circle" },
                        {
                          id: "team",
                          label: "Team",
                          icon: "i-mdi:account-multiple",
                        },
                        {
                          id: "contact",
                          label: "Contact",
                          icon: "i-mdi:email",
                        },
                        {
                          id: "socials",
                          label: "Socials",
                          icon: "i-mdi:share-variant",
                        },
                      ].map(section => {
                        const isEnabled = (
                          formData.enabledSections || []
                        ).includes(section.id);
                        const hasConfig = sectionsWithConfig.includes(
                          section.id
                        );

                        return (
                          <div
                            key={section.id}
                            className={`
                              relative flex flex-col items-center gap-2 p-3 rounded-lg border text-sm transition-all
                              ${
                                isEnabled
                                  ? "bg-primary/20 border-primary text-primary-light"
                                  : "bg-background-dark/50 border-light/10 text-gray-300 hover:border-light/20 hover:bg-background-dark/80"
                              }
                            `}
                          >
                            <button
                              type="button"
                              onClick={() => {
                                const currentSections =
                                  formData.enabledSections || [];
                                const newSections = isEnabled
                                  ? currentSections.filter(
                                      s => s !== section.id
                                    )
                                  : [...currentSections, section.id];
                                // Ensure at least hero is always enabled
                                if (
                                  section.id === "hero" &&
                                  isEnabled &&
                                  newSections.length === 0
                                ) {
                                  toast.error(
                                    "Hero section must always be enabled"
                                  );
                                  return;
                                }
                                handleInputChange(
                                  "enabledSections",
                                  newSections
                                );
                                // Open config modal when enabling sections with config
                                if (
                                  !isEnabled &&
                                  newSections.includes(section.id) &&
                                  hasConfig
                                ) {
                                  setTimeout(() => {
                                    openSectionConfig(section.id);
                                  }, 100);
                                }
                              }}
                              disabled={
                                section.id === "hero" &&
                                isEnabled &&
                                (formData.enabledSections || []).length === 1
                              }
                              className={`
                                flex flex-col items-center gap-2 w-full cursor-pointer
                                ${section.id === "hero" && isEnabled && (formData.enabledSections || []).length === 1 ? "opacity-50 cursor-not-allowed" : ""}
                              `}
                            >
                              <div className={`${section.icon} h-6 w-6`}></div>
                              <span>{section.label}</span>
                              {isEnabled && (
                                <div className="i-mdi:check h-4 w-4 text-primary-light"></div>
                              )}
                            </button>
                            {isEnabled && hasConfig && (
                              <button
                                type="button"
                                onClick={e => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  openSectionConfig(section.id);
                                }}
                                className="absolute top-2 right-2 p-1.5 rounded hover:bg-primary/30 text-gray-400 hover:text-primary-light transition-colors z-10"
                                title="Configure section"
                                onMouseDown={e => e.stopPropagation()}
                              >
                                <div className="i-mdi:cog h-4 w-4"></div>
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    {(formData.enabledSections || []).length === 0 && (
                      <p className="text-sm text-red-400 mt-2">
                        Please select at least one section (Hero is required).
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            </Form>
          )}
        </div>

        <div>
          <Card>
            <h2 className="text-lg font-bold mb-4">Preview</h2>
            <div className="border border-gray-700 rounded-lg overflow-hidden">
              {previewHtml ? (
                <iframe
                  srcDoc={previewHtml}
                  className="w-full h-[600px] border-0"
                  title="Landing Page Preview"
                />
              ) : (
                <div className="w-full h-[600px] flex items-center justify-center bg-background-dark text-gray-400">
                  <div className="text-center">
                    <div className="i-mdi:eye-off h-12 w-12 mx-auto mb-4"></div>
                    <p>No preview available</p>
                    <p className="text-sm mt-2">
                      {chatMode
                        ? "Generate content to see preview"
                        : "Save configuration and generate content to see preview"}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
