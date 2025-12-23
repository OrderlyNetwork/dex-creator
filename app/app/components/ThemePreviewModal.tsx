import { useState, useEffect, useRef, useMemo } from "react";
import { Button } from "./Button";
import { Card } from "./Card";
import DexPreview, { DexPreviewProps } from "./DexPreview";
import ThemeEditingTabs from "./ThemeEditingTabs";
import { useThemeEditor } from "../hooks/useThemeEditor";

interface ThemePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (css: string) => void;
  onCancel?: () => void;
  oldTheme?: string;
  themes?: string[];
  previewProps?: DexPreviewProps;
  viewMode?: "desktop" | "mobile";
}

export default function ThemePreviewModal({
  isOpen,
  onClose,
  onApply,
  onCancel,
  oldTheme,
  themes,
  previewProps,
  viewMode = "desktop",
}: ThemePreviewModalProps) {
  const hasMultipleThemes =
    themes && Array.isArray(themes) && themes.length === 3;
  const [selectedVariant, setSelectedVariant] = useState<"old" | 0 | 1 | 2>(
    hasMultipleThemes ? 0 : "old"
  );
  const initialCss = hasMultipleThemes ? themes![0] : oldTheme || "";
  const {
    css,
    activeTab,
    setActiveTab,
    updateCssColor,
    updateCssValue,
    resetCss,
  } = useThemeEditor(initialCss);
  const originalMatchMediaRef = useRef<typeof window.matchMedia | null>(null);

  const isActualMobileDevice = useMemo(() => {
    return window.innerWidth < 768;
  }, []);

  useEffect(() => {
    if (viewMode === "mobile" && isOpen && previewProps) {
      const originalMatchMedia = window.matchMedia.bind(window);
      originalMatchMediaRef.current = originalMatchMedia;
      window.matchMedia = (query: string) => {
        if (query === "(max-width: 768px)") {
          return {
            matches: true,
            media: query,
            onchange: null,
            addListener: () => {},
            removeListener: () => {},
            addEventListener: () => {},
            removeEventListener: () => {},
            dispatchEvent: () => true,
          } as MediaQueryList;
        }
        return originalMatchMedia(query);
      };
    } else if (originalMatchMediaRef.current) {
      window.matchMedia = originalMatchMediaRef.current;
      originalMatchMediaRef.current = null;
    }

    return () => {
      if (originalMatchMediaRef.current) {
        window.matchMedia = originalMatchMediaRef.current;
        originalMatchMediaRef.current = null;
      }
    };
  }, [viewMode, isOpen, previewProps]);

  useEffect(() => {
    if (
      hasMultipleThemes &&
      selectedVariant !== "old" &&
      selectedVariant !== undefined
    ) {
      resetCss(themes[selectedVariant]);
    } else if (hasMultipleThemes && selectedVariant === "old") {
      resetCss(oldTheme || "");
    } else if (!hasMultipleThemes) {
      resetCss(oldTheme || "");
    }
  }, [themes, selectedVariant, oldTheme, hasMultipleThemes, resetCss]);

  if (!isOpen) return null;

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    onClose();
  };

  const getCurrentTheme = () => {
    if (hasMultipleThemes) {
      if (selectedVariant === "old") {
        return oldTheme || "";
      }
      return themes[selectedVariant];
    }
    return css;
  };

  const handleApply = () => {
    if (hasMultipleThemes && selectedVariant === "old") {
      if (onCancel) {
        onCancel();
      }
      onClose();
      return;
    }
    onApply(getCurrentTheme());
  };

  if (
    hasMultipleThemes &&
    previewProps &&
    (!isActualMobileDevice || viewMode === "desktop")
  ) {
    const currentTheme = getCurrentTheme();

    return (
      <div
        className="fixed inset-0 z-[10000] bg-background-dark/95 flex flex-col"
        onClick={e => e.stopPropagation()}
        onKeyDown={e => e.stopPropagation()}
        onKeyUp={e => e.stopPropagation()}
        role="dialog"
        data-higher-modal="true"
      >
        <div className="flex items-center justify-between p-4 border-b border-light/10">
          <h2 className="text-lg font-bold text-gray-200">
            Preview Theme Changes
          </h2>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-background-card border border-light/20 rounded-lg p-1">
              <button
                onClick={() => setSelectedVariant("old")}
                className={`px-3 py-1.5 text-sm rounded transition-colors ${
                  selectedVariant === "old"
                    ? "bg-primary text-white"
                    : "text-gray-400 hover:text-gray-200"
                }`}
                type="button"
              >
                Old
              </button>
              {[0, 1, 2].map(index => (
                <button
                  key={index}
                  onClick={() => setSelectedVariant(index as 0 | 1 | 2)}
                  className={`px-3 py-1.5 text-sm rounded transition-colors ${
                    selectedVariant === index
                      ? "bg-primary text-white"
                      : "text-gray-400 hover:text-gray-200"
                  }`}
                  type="button"
                >
                  {index + 1}
                </button>
              ))}
            </div>
            <Button
              onClick={handleCancel}
              variant="ghost"
              size="md"
              type="button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleApply}
              variant="primary"
              size="md"
              type="button"
              disabled={selectedVariant === "old"}
            >
              {selectedVariant === "old" ? "Select a Variant" : "Accept Theme"}
            </Button>
          </div>
        </div>

        <div
          className={`flex-1 relative min-h-0 ${
            viewMode === "mobile"
              ? "overflow-y-auto overflow-x-hidden"
              : "overflow-hidden"
          }`}
        >
          <div
            data-preview-container
            className={`${
              viewMode === "mobile" ? "max-w-md mx-auto py-4" : "h-full"
            } w-full`}
          >
            <DexPreview
              {...previewProps}
              customStyles={currentTheme}
              className={viewMode === "mobile" ? "w-full" : "h-full w-full"}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center h-screen">
      <div
        className="absolute inset-0 bg-background-dark/80 backdrop-blur-sm z-[1001]"
        onClick={handleCancel}
      ></div>

      <div className="relative z-[1002] w-full max-w-3xl p-6 rounded-xl bg-background-light border border-light/10 shadow-2xl slide-fade-in max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold">Theme Preview</h3>
          {hasMultipleThemes && (
            <div className="flex items-center gap-2 bg-background-card border border-light/20 rounded-lg p-1">
              <button
                onClick={() => setSelectedVariant("old")}
                className={`px-3 py-1.5 text-sm rounded transition-colors ${
                  selectedVariant === "old"
                    ? "bg-primary text-white"
                    : "text-gray-400 hover:text-gray-200"
                }`}
                type="button"
              >
                Old
              </button>
              {[0, 1, 2].map(index => (
                <button
                  key={index}
                  onClick={() => setSelectedVariant(index as 0 | 1 | 2)}
                  className={`px-3 py-1.5 text-sm rounded transition-colors ${
                    selectedVariant === index
                      ? "bg-primary text-white"
                      : "text-gray-400 hover:text-gray-200"
                  }`}
                  type="button"
                >
                  {index + 1}
                </button>
              ))}
            </div>
          )}
        </div>

        <Card className="mb-4 p-3 slide-fade-in" variant="default">
          <div className="flex items-start gap-3">
            <div className="i-mdi:robot text-primary-light h-5 w-5 mt-0.5 flex-shrink-0"></div>
            <div>
              <h4 className="text-sm font-medium mb-1">AI-Generated Theme</h4>
              <p className="text-xs text-gray-300 mb-2">
                This theme was created by an AI based on your description. While
                we strive for quality results:
              </p>
              <ul className="text-xs text-gray-300 list-disc pl-4 space-y-1 mb-2">
                <li>Colors may not always perfectly match your description</li>
                <li>Contrast ratios between elements might need adjustment</li>
                <li>
                  Some color combinations might not look ideal in all contexts
                </li>
              </ul>
              <p className="text-xs text-gray-300">
                <span className="text-primary-light font-medium">
                  Recommendation:
                </span>{" "}
                Use the preview functionality to see how your theme looks in a
                real DEX environment, and make adjustments as needed using the
                color editor below.
              </p>
            </div>
          </div>
        </Card>

        <ThemeEditingTabs
          css={css}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onColorChange={updateCssColor}
          onValueChange={updateCssValue}
        />

        <div className="flex gap-3 justify-end">
          <Button variant="ghost" onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleApply}
            disabled={hasMultipleThemes && selectedVariant === "old"}
          >
            {hasMultipleThemes && selectedVariant === "old"
              ? "Select a Variant"
              : "Apply Theme"}
          </Button>
        </div>
      </div>
    </div>
  );
}
