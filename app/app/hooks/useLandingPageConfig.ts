import { useState, useEffect, useCallback } from "react";
import type { LandingPageConfigForm } from "../types/landingPageConfig";
import type { GeneratedFile, LandingPage } from "../types/landingPage";
import type { TeamMember } from "../components/EditableTeamList";
import {
  DEFAULT_KEY_FEATURES,
  DEFAULT_FAQ_ITEMS,
  DEFAULT_METADATA,
} from "../constants/landingPageDefaults";
import {
  combineGeneratedFilesToHtml,
  migrateTeamMembers,
  base64ToBlob,
  blobToDataUrl,
} from "../utils/landingPagePreview";
import { parseCSSVariables } from "../utils/cssParser";
import { rgbSpaceSeparatedToHex } from "../utils/colorUtils";
import { defaultTheme } from "../types/dex";

interface UseLandingPageConfigOptions {
  landingPageData: LandingPage | null;
  dexData: {
    themeCSS?: string | null;
    availableLanguages?: string[] | null;
  } | null;
  deploymentUrl?: string;
}

function extractDexColors(
  themeCSS: string
): { primaryColor: string; secondaryColor: string } | null {
  const cssVars = parseCSSVariables(themeCSS);
  if (cssVars["--oui-color-primary"]) {
    const primaryRgb = cssVars["--oui-color-primary"];
    const secondaryRgb =
      cssVars["--oui-color-secondary"] ||
      cssVars["--oui-color-base-6"] ||
      "255 255 255";
    return {
      primaryColor: rgbSpaceSeparatedToHex(primaryRgb),
      secondaryColor: rgbSpaceSeparatedToHex(secondaryRgb),
    };
  }
  return null;
}

export function useLandingPageConfig({
  landingPageData,
  dexData,
  deploymentUrl,
}: UseLandingPageConfigOptions) {
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
    keyFeatures: [...DEFAULT_KEY_FEATURES],
    faqItems: [...DEFAULT_FAQ_ITEMS],
    sections: [],
  });

  const [primaryLogo, setPrimaryLogo] = useState<Blob | null>(null);
  const [secondaryLogo, setSecondaryLogo] = useState<Blob | null>(null);
  const [banner, setBanner] = useState<Blob | null>(null);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [currentGeneratedFiles, setCurrentGeneratedFiles] = useState<
    GeneratedFile[] | null
  >(null);
  const [teamMemberImageUrls, setTeamMemberImageUrls] = useState<
    (string | null)[]
  >([]);
  const [brandingImageUrls, setBrandingImageUrls] = useState<{
    primaryLogo?: string | null;
    secondaryLogo?: string | null;
    banner?: string | null;
  }>({});

  useEffect(() => {
    const convertBrandingImages = async () => {
      const [primaryUrl, secondaryUrl, bannerUrl] = await Promise.all([
        blobToDataUrl(primaryLogo),
        blobToDataUrl(secondaryLogo),
        blobToDataUrl(banner),
      ]);
      setBrandingImageUrls({
        primaryLogo: primaryUrl,
        secondaryLogo: secondaryUrl,
        banner: bannerUrl,
      });
    };
    convertBrandingImages();
  }, [primaryLogo, secondaryLogo, banner]);

  useEffect(() => {
    const convertTeamImages = async () => {
      if (!formData.teamMembers) return;
      const urls = await Promise.all(
        formData.teamMembers.map(async member => {
          if (member.image) {
            return blobToDataUrl(member.image);
          }
          return null;
        })
      );
      setTeamMemberImageUrls(urls);
    };
    convertTeamImages();
  }, [formData.teamMembers]);

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
    currentGeneratedFiles,
    landingPageData?.config,
    teamMemberImageUrls,
    brandingImageUrls,
  ]);

  // Initialize form from existing data
  useEffect(() => {
    if (landingPageData && landingPageData.config) {
      const config = landingPageData.config as Record<string, unknown>;
      const configForm = config as Partial<LandingPageConfigForm>;

      setFormData(prev => ({
        ...prev,
        ...configForm,
        ctaButtonText:
          configForm.ctaButtonText || prev.ctaButtonText || "Start Trading",
        ctaButtonLink:
          configForm.ctaButtonLink || prev.ctaButtonLink || deploymentUrl || "",
        ctaPlacement: configForm.ctaPlacement || prev.ctaPlacement || "both",
        enabledSections: configForm.enabledSections ||
          prev.enabledSections || ["hero", "features", "cta"],
        keyFeatures:
          configForm.keyFeatures || prev.keyFeatures || DEFAULT_KEY_FEATURES,
        faqItems: configForm.faqItems || prev.faqItems || DEFAULT_FAQ_ITEMS,
        teamMembers:
          migrateTeamMembers(config.teamMembers) || prev.teamMembers || [],
        metadata: configForm.metadata || prev.metadata || DEFAULT_METADATA,
      }));

      // Load images
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
        }
      };

      loadImage(config.primaryLogoData, setPrimaryLogo);
      loadImage(config.secondaryLogoData, setSecondaryLogo);
      loadImage(config.bannerData, setBanner);

      // Load generated files
      if (landingPageData.config?.generatedFiles) {
        setCurrentGeneratedFiles(
          landingPageData.config.generatedFiles as GeneratedFile[]
        );
      }
    } else if (dexData && !landingPageData) {
      // Initialize from DEX data
      const dexThemeCSS = dexData.themeCSS || defaultTheme;
      const dexColors = extractDexColors(dexThemeCSS);
      if (dexColors) {
        setFormData(prev => ({ ...prev, ...dexColors }));
      }
      const dexLanguages = dexData.availableLanguages || ["en"];
      if (dexLanguages.length > 0) {
        setFormData(prev => ({ ...prev, languages: dexLanguages }));
      }
    }
  }, [landingPageData, dexData, deploymentUrl]);

  // Set default CTA link
  useEffect(() => {
    if (deploymentUrl && !formData.ctaButtonLink) {
      setFormData(prev => ({
        ...prev,
        ctaButtonLink: deploymentUrl,
      }));
    }
  }, [deploymentUrl, formData.ctaButtonLink]);

  const handleInputChange = useCallback(
    (field: keyof LandingPageConfigForm, value: unknown) => {
      setFormData(prev => ({ ...prev, [field]: value }));
    },
    []
  );

  const prepareTeamMembersForSubmission = useCallback(
    async (
      members: TeamMember[]
    ): Promise<Array<Omit<TeamMember, "image"> & { imageData?: string }>> => {
      return Promise.all(
        members.map(async member => {
          if (member.image) {
            const dataUrl = await blobToDataUrl(member.image);
            return {
              ...member,
              imageData: dataUrl || undefined,
            };
          }
          return member;
        })
      );
    },
    []
  );

  return {
    formData,
    setFormData,
    handleInputChange,
    primaryLogo,
    setPrimaryLogo,
    secondaryLogo,
    setSecondaryLogo,
    banner,
    setBanner,
    previewHtml,
    setPreviewHtml,
    currentGeneratedFiles,
    setCurrentGeneratedFiles,
    teamMemberImageUrls,
    brandingImageUrls,
    prepareTeamMembersForSubmission,
  };
}
