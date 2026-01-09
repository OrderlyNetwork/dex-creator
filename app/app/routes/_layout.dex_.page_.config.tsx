import { useState, useEffect, FormEvent, useCallback } from "react";
import type { MetaFunction } from "@remix-run/node";
import { toast } from "react-toastify";
import { useAuth } from "../context/useAuth";
import { useLandingPage } from "../context/LandingPageContext";
import { useDex } from "../context/DexContext";
import { post, put } from "../utils/apiClient";
import WalletConnect from "../components/WalletConnect";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { useNavigate, Link } from "@remix-run/react";
import Form from "../components/Form";
import { parseCSSVariables } from "../utils/cssParser";
import { rgbSpaceSeparatedToHex } from "../utils/colorUtils";
import { defaultTheme } from "../types/dex";

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
  theme: "light" | "dark";
  primaryColor: string;
  primaryLight?: string;
  primaryDarken?: string;
  secondaryColor: string;
  linkColor?: string;
  successColor?: string;
  dangerColor?: string;
  warningColor?: string;
  useDexColors: boolean;
  fontFamily: string;
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

  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [formData, setFormData] = useState<LandingPageConfigForm>({
    title: "",
    subtitle: "",
    theme: "light",
    primaryColor: "#000000",
    secondaryColor: "#ffffff",
    useDexColors: false,
    fontFamily: "'Manrope', sans-serif",
    sections: [],
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

  const loadDexColors = useCallback(() => {
    const dexThemeCSS = dexData?.themeCSS || defaultTheme;
    const dexColors = extractDexColors(dexThemeCSS);

    if (dexColors) {
      setFormData(prev => ({
        ...prev,
        ...dexColors,
        useDexColors: true,
      }));
      toast.success("Loaded DEX theme colors");
    } else {
      toast.error("Could not extract colors from DEX theme");
    }
  }, [dexData, extractDexColors]);

  useEffect(() => {
    if (!isAuthenticated || !token) return;

    if (landingPageData) {
      setChatMode(true);
      if (landingPageData.config) {
        const config = landingPageData.config as Partial<LandingPageConfigForm>;
        setFormData(prev => ({
          ...prev,
          ...config,
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
          useDexColors: true,
        }));
      }
    }
  }, [isAuthenticated, token, landingPageData, dexData, extractDexColors]);

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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!token) {
      toast.error("Authentication required");
      return;
    }

    setIsSaving(true);

    try {
      if (landingPageData) {
        // Update existing landing page
        const result = await put<{ id: string }>(
          `api/landing-page/${landingPageData.id}`,
          { config: formData },
          token
        );

        if (result) {
          toast.success("Landing page configuration updated!");
          refreshLandingPageData();
          setShowWarning(false);
        }
      } else {
        // Create new landing page
        const result = await post<{ id: string }>(
          "api/landing-page",
          formData,
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
                    placeholder="e.g., Make the hero section more vibrant, add a testimonials section, change colors to blue..."
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
                      Reset to DEX Theme
                    </Button>
                  )}
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Theme
                    </label>
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
                    <div className="flex items-center justify-between mb-3">
                      <label className="block text-sm font-medium">
                        Color Palette
                      </label>
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.useDexColors}
                          onChange={e =>
                            handleInputChange("useDexColors", e.target.checked)
                          }
                          className="sr-only"
                        />
                        <div
                          className={`w-10 h-5 rounded-full mr-2 flex items-center px-0.5 transition-colors duration-200 ease-in-out ${
                            formData.useDexColors
                              ? "bg-primary/60"
                              : "bg-background-dark/80"
                          }`}
                        >
                          <div
                            className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ease-in-out ${
                              formData.useDexColors
                                ? "transform translate-x-5"
                                : "transform translate-x-0"
                            }`}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-300">
                          Use DEX Colors
                        </span>
                      </label>
                    </div>
                    {formData.useDexColors && dexData && (
                      <div className="mb-3 p-3 bg-primary/10 border border-primary/30 rounded-lg">
                        <p className="text-xs text-gray-300">
                          Using colors from your DEX theme. Toggle off to use
                          custom colors.
                        </p>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Primary Color
                        </label>
                        <input
                          type="color"
                          value={formData.primaryColor}
                          onChange={e => {
                            handleInputChange("primaryColor", e.target.value);
                            handleInputChange("useDexColors", false);
                          }}
                          disabled={formData.useDexColors}
                          className="w-full h-10 bg-background-dark border border-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Secondary Color
                        </label>
                        <input
                          type="color"
                          value={formData.secondaryColor}
                          onChange={e => {
                            handleInputChange("secondaryColor", e.target.value);
                            handleInputChange("useDexColors", false);
                          }}
                          disabled={formData.useDexColors}
                          className="w-full h-10 bg-background-dark border border-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
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
                            onChange={e => {
                              handleInputChange("primaryLight", e.target.value);
                              handleInputChange("useDexColors", false);
                            }}
                            disabled={formData.useDexColors}
                            className="w-full h-10 bg-background-dark border border-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
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
                            onChange={e => {
                              handleInputChange("linkColor", e.target.value);
                              handleInputChange("useDexColors", false);
                            }}
                            disabled={formData.useDexColors}
                            className="w-full h-10 bg-background-dark border border-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
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
