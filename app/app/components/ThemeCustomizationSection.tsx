import React, { ChangeEvent, useMemo, useState, useEffect } from "react";
import { NetworkId } from "@orderly.network/types";
import { Button } from "./Button";
import { Card } from "./Card";
import FormInput from "./FormInput";
import InteractivePreview from "./InteractivePreview";
import CurrentThemeEditor from "./CurrentThemeEditor";
import { previewConfig } from "../utils/config";
import { extractFontValues } from "../utils/cssParser";
import { createElement } from "react";
import type { DexPreviewProps } from "./DexPreview";
import { useModal } from "../context/ModalContext";

const Textarea = ({
  value,
  onChange,
  className,
  placeholder,
}: {
  value: string | null;
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  className?: string;
  placeholder?: string;
}) => (
  <textarea
    value={value || ""}
    onChange={onChange}
    className={className}
    placeholder={placeholder}
  />
);

export type ThemeTabType =
  | "colors"
  | "fonts"
  | "rounded"
  | "spacing"
  | "tradingview";

export interface ThemeCustomizationProps {
  currentTheme: string | null;
  defaultTheme: string;
  savedTheme: string | null;
  showThemeEditor: boolean;
  viewCssCode: boolean;
  themePrompt: string;
  isGeneratingTheme: boolean;
  brokerName: string;
  primaryLogo: Blob | null;
  secondaryLogo: Blob | null;
  tradingViewColorConfig: string | null;
  toggleThemeEditor: () => void;
  handleResetTheme: () => void;
  handleResetToDefault: () => void;
  handleThemeEditorChange: (value: string) => void;
  setViewCssCode: (value: boolean) => void;
  ThemeTabButton: React.FC<{ tab: ThemeTabType; label: string }>;
  updateCssColor: (variableName: string, newColorHex: string) => void;
  updateCssValue: (variableName: string, newValue: string) => void;
  handleInputChange: (
    field: string
  ) => (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleGenerateTheme: (
    prompt?: string,
    previewProps?: DexPreviewProps,
    viewMode?: "desktop" | "mobile"
  ) => void;
  setTradingViewColorConfig: (config: string | null) => void;
  idPrefix?: string;
}

const ThemeCustomizationSection: React.FC<ThemeCustomizationProps> = ({
  currentTheme,
  defaultTheme,
  savedTheme,
  showThemeEditor,
  viewCssCode,
  themePrompt,
  isGeneratingTheme,
  brokerName,
  primaryLogo,
  secondaryLogo,
  tradingViewColorConfig,
  toggleThemeEditor,
  handleResetTheme,
  handleThemeEditorChange,
  setViewCssCode,
  updateCssColor,
  updateCssValue,
  handleInputChange,
  handleGenerateTheme,
  setTradingViewColorConfig,
  idPrefix = "",
}) => {
  const [activeThemeTab, setActiveThemeTab] = useState<ThemeTabType>("colors");
  const [primaryLogoUrl, setPrimaryLogoUrl] = useState<string | null>(null);
  const [secondaryLogoUrl, setSecondaryLogoUrl] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const { openModal } = useModal();

  const LocalThemeTabButton: React.FC<{ tab: ThemeTabType; label: string }> = ({
    tab,
    label,
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

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (primaryLogoUrl) {
      URL.revokeObjectURL(primaryLogoUrl);
    }
    if (primaryLogo) {
      const url = URL.createObjectURL(primaryLogo);
      setPrimaryLogoUrl(url);
    } else {
      setPrimaryLogoUrl(null);
    }
    return () => {
      if (primaryLogoUrl) {
        URL.revokeObjectURL(primaryLogoUrl);
      }
    };
  }, [primaryLogo]);

  useEffect(() => {
    if (secondaryLogoUrl) {
      URL.revokeObjectURL(secondaryLogoUrl);
    }
    if (secondaryLogo) {
      const url = URL.createObjectURL(secondaryLogo);
      setSecondaryLogoUrl(url);
    } else {
      setSecondaryLogoUrl(null);
    }
    return () => {
      if (secondaryLogoUrl) {
        URL.revokeObjectURL(secondaryLogoUrl);
      }
    };
  }, [secondaryLogo]);

  const previewProps = useMemo<DexPreviewProps>(() => {
    const appIcons = { ...previewConfig.orderlyAppProvider.appIcons };

    if (primaryLogoUrl) {
      appIcons.main = {
        component: createElement("img", {
          src: primaryLogoUrl,
          alt: "logo",
          style: { height: "42px" },
        }),
      };
    }

    if (secondaryLogoUrl) {
      appIcons.secondary = {
        img: secondaryLogoUrl,
      };
    }

    const themeToUse = currentTheme || defaultTheme;
    const { fontFamily, fontSize } = extractFontValues(themeToUse);

    return {
      brokerId: "demo",
      brokerName: brokerName || "My DEX",
      networkId: "testnet" as NetworkId,
      mainNavProps: previewConfig.scaffold.mainNavProps,
      footerProps: previewConfig.scaffold.footerProps,
      initialSymbol: "PERP_BTC_USDC",
      tradingViewConfig: previewConfig.tradingPage.tradingViewConfig,
      sharePnLConfig: previewConfig.tradingPage.sharePnLConfig,
      appIcons,
      customStyles: themeToUse,
      fontFamily,
      fontSize,
    };
  }, [
    brokerName,
    primaryLogoUrl,
    secondaryLogoUrl,
    currentTheme,
    defaultTheme,
  ]);

  const handleThemeChange = (newTheme: string) => {
    handleThemeEditorChange(newTheme);
  };

  return (
    <>
      {!isMobile && (
        <div className="mt-6">
          <InteractivePreview
            previewProps={previewProps}
            currentTheme={currentTheme}
            defaultTheme={defaultTheme}
            savedTheme={savedTheme}
            onThemeChange={handleThemeChange}
            onGenerateTheme={(
              prompt: string,
              viewMode: "desktop" | "mobile"
            ) => {
              handleGenerateTheme(prompt, previewProps, viewMode);
            }}
            updateCssColor={updateCssColor}
            updateCssValue={updateCssValue}
            tradingViewColorConfig={tradingViewColorConfig}
            setTradingViewColorConfig={setTradingViewColorConfig}
          />
        </div>
      )}
      {isMobile && (
        <div className="mt-4 rounded-lg overflow-hidden border border-light/10 p-4 bg-base-7/50">
          {/* Preset Selection */}
          <div className="mb-4 pb-4 border-b border-light/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-300">
                Theme Presets
              </span>
            </div>
            <Button
              onClick={() => {
                openModal("themePresetPreview", {
                  previewProps: undefined,
                  viewMode: "mobile",
                  currentTheme,
                  onApply: (theme: string) => {
                    handleThemeChange(theme);
                  },
                  onPreviewChange: (theme: string) => {
                    handleThemeChange(theme);
                  },
                });
              }}
              variant="secondary"
              size="xs"
              className="w-full"
              type="button"
            >
              <span className="flex items-center gap-1 justify-center">
                <div className="i-mdi:swatch h-3.5 w-3.5"></div>
                Select Preset
              </span>
            </Button>
          </div>

          {/* Current Theme */}
          <div className="flex justify-between mb-2 flex-col sm:flex-row gap-2 sm:gap-0">
            <span className="text-sm font-medium mb-2 text-gray-300">
              Current Theme
            </span>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Button
                onClick={toggleThemeEditor}
                variant="secondary"
                size="xs"
                className="w-full sm:w-auto"
                type="button"
              >
                <span className="flex items-center gap-1 justify-center sm:justify-start">
                  <div
                    className={
                      showThemeEditor
                        ? "i-mdi:eye h-3.5 w-3.5"
                        : "i-mdi:pencil h-3.5 w-3.5"
                    }
                  ></div>
                  {showThemeEditor ? "Hide Editor" : "Edit CSS"}
                </span>
              </Button>
              <Button
                onClick={handleResetTheme}
                variant="danger"
                size="xs"
                className="w-full sm:w-auto"
                type="button"
              >
                Reset
              </Button>
            </div>
          </div>
          {showThemeEditor && (
            <div className="mt-4 slide-fade-in">
              <Textarea
                value={currentTheme || defaultTheme}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                  handleThemeEditorChange(e.target.value)
                }
                className="w-full h-80 bg-black/80 text-xs text-gray-300 font-mono p-3 rounded border border-light/10"
                placeholder="Edit your CSS theme here..."
              />
            </div>
          )}
          {!showThemeEditor && (
            <div className="mt-2 text-xs mb-4">
              <div>
                <button
                  onClick={() => setViewCssCode(!viewCssCode)}
                  className="cursor-pointer text-gray-400 hover:text-gray-300 transition-colors flex items-center"
                  type="button"
                >
                  <span>{viewCssCode ? "Hide" : "View"} CSS code</span>
                  <div
                    className={`i-mdi:chevron-down h-4 w-4 ml-1 transition-transform ${viewCssCode ? "rotate-180" : ""}`}
                  ></div>
                </button>
                {viewCssCode && (
                  <div className="bg-base-8/50 p-4 rounded-lg overflow-auto text-xs max-h-[300px] mt-2 slide-fade-in">
                    <pre className="language-css">
                      {currentTheme || defaultTheme}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}
          <CurrentThemeEditor
            currentTheme={currentTheme}
            defaultTheme={defaultTheme}
            activeThemeTab={activeThemeTab}
            updateCssColor={updateCssColor}
            updateCssValue={updateCssValue}
            tradingViewColorConfig={tradingViewColorConfig}
            setTradingViewColorConfig={setTradingViewColorConfig}
            ThemeTabButton={LocalThemeTabButton}
          />
        </div>
      )}
      {isMobile && (
        <div className="flex flex-col space-y-4 mt-6">
          <div className="flex flex-col gap-2">
            <h4 className="text-base font-bold mb-1">AI Theme Generator</h4>
            <p className="text-xs text-gray-400 mb-2">
              Describe how you want your DEX theme to look and our AI will
              generate it for you.
            </p>
            <Card className="mb-3 p-3 slide-fade-in" variant="default">
              <div className="flex items-start gap-2">
                <div className="i-mdi:information-outline text-primary-light h-4 w-4 mt-0.5 flex-shrink-0"></div>
                <div>
                  <p className="text-xs text-gray-300 mb-1">
                    <span className="text-primary-light font-medium">
                      Note:
                    </span>{" "}
                    AI-generated themes are a starting point and may not be
                    perfect. After generating:
                  </p>
                  <ul className="text-xs text-gray-300 list-disc pl-4 space-y-0.5">
                    <li>Review the theme in the preview modal</li>
                    <li>Make adjustments to colors as needed</li>
                  </ul>
                </div>
              </div>
            </Card>
            <FormInput
              id={`${idPrefix}themePrompt`}
              label="Theme Description"
              value={themePrompt}
              onChange={handleInputChange("themePrompt")}
              placeholder="e.g., A dark blue theme with neon green accents"
              helpText="Describe your desired color scheme and style"
              maxLength={100}
              disabled={isGeneratingTheme}
            />
          </div>
          <div className="mt-1">
            <Button
              onClick={() =>
                handleGenerateTheme(themePrompt, undefined, "mobile")
              }
              isLoading={isGeneratingTheme}
              loadingText="Generating..."
              disabled={!themePrompt.trim() || isGeneratingTheme}
              variant="secondary"
              size="sm"
              type="button"
            >
              <span className="flex items-center gap-1">
                <div className="i-mdi:magic-wand h-4 w-4"></div>Generate Theme
              </span>
            </Button>
          </div>
        </div>
      )}
    </>
  );
};

export default ThemeCustomizationSection;
