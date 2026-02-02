import type { FaqItem } from "../components/EditableFaqList";
import type { TeamMember } from "../components/EditableTeamList";

export interface LandingPageConfigForm {
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
  ctaButtonLink?: string;
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
  teamMembers?: TeamMember[];
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

export function createDefaultFormData(): LandingPageConfigForm {
  return {
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
    keyFeatures: [],
    faqItems: [],
    sections: [],
  };
}
