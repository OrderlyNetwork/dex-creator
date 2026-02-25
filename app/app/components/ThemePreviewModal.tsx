import { useState, useEffect, useRef, useMemo, useId } from "react";
import { Button } from "./Button";
import { Card } from "./Card";
import DexPreview, { DexPreviewProps } from "./DexPreview";
import ThemeEditingTabs from "./ThemeEditingTabs";
import { useThemeEditor } from "../hooks/useThemeEditor";
import { extractFontValues } from "../utils/cssParser";
import { useTranslation } from "~/i18n";

/**
 * Transforms CSS to scope :root selectors to a specific container using data attribute.
 * This ensures the CSS takes precedence over other :root styles that may be
 * rendered by other components (like EditModeModal's DexPreview).
 */
function scopeThemeCssToContainer(css: string, containerId: string): string {
  if (!css) return css;

  return css.replace(
    /:root\s*\{/g,
    `:root[data-theme-preview-id="${containerId}"], [data-theme-preview-id="${containerId}"] {`
  );
}

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
  const { t } = useTranslation();
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
  const themePreviewId = useId();

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
    const { fontFamily, fontSize } = useMemo(
      () => extractFontValues(currentTheme),
      [currentTheme]
    );

    const scopedTheme = useMemo(
      () => scopeThemeCssToContainer(currentTheme, themePreviewId),
      [currentTheme, themePreviewId]
    );

    const cleanPreviewProps = useMemo(() => {
      if (!previewProps) return undefined;
      const {
        customStyles: _customStyles,
        fontFamily: _fontFamily,
        fontSize: _fontSize,
        ...rest
      } = previewProps;
      return rest;
    }, [previewProps]);

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
            {t("themePreviewModal.previewThemeChanges")}
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
                {t("themePreviewModal.old")}
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
              {t("themePreviewModal.cancel")}
            </Button>
            <Button
              onClick={handleApply}
              variant="primary"
              size="md"
              type="button"
              disabled={selectedVariant === "old"}
            >
              {selectedVariant === "old"
                ? t("themePreviewModal.selectVariant")
                : t("themePreviewModal.acceptTheme")}
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
            data-theme-preview-id={themePreviewId}
            className={`${
              viewMode === "mobile" ? "max-w-md mx-auto py-4" : "h-full"
            } w-full`}
            style={
              viewMode === "mobile"
                ? {
                    maxWidth: "450px",
                    margin: "0 auto",
                  }
                : undefined
            }
          >
            {cleanPreviewProps && (
              <DexPreview
                {...cleanPreviewProps}
                customStyles={scopedTheme}
                fontFamily={fontFamily}
                fontSize={fontSize}
                className={viewMode === "mobile" ? "w-full" : "h-full w-full"}
                key={`theme-preview-${selectedVariant}-${themePreviewId}-${currentTheme?.substring(0, 50)}`}
              />
            )}
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
          <h3 className="text-xl font-bold">
            {t("themePreviewModal.themePreview")}
          </h3>
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
                {t("themePreviewModal.old")}
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
              <h4 className="text-sm font-medium mb-1">
                {t("themePreviewModal.aiGeneratedTheme")}
              </h4>
              <p className="text-xs text-gray-300 mb-2">
                {t("themePreviewModal.aiGeneratedThemeDesc")}
              </p>
              <ul className="text-xs text-gray-300 list-disc pl-4 space-y-1 mb-2">
                <li>{t("themePreviewModal.colorsMayNotMatch")}</li>
                <li>{t("themePreviewModal.contrastMayNeedAdjustments")}</li>
                <li>{t("themePreviewModal.combinationsMayNotLookIdeal")}</li>
              </ul>
              <p className="text-xs text-gray-300">
                <span className="text-primary-light font-medium">
                  {t("themePreviewModal.recommendation")}
                </span>{" "}
                {t("themePreviewModal.recommendationDesc")}
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
            {t("themePreviewModal.cancel")}
          </Button>
          <Button
            variant="primary"
            onClick={handleApply}
            disabled={hasMultipleThemes && selectedVariant === "old"}
          >
            {hasMultipleThemes && selectedVariant === "old"
              ? t("themePreviewModal.selectVariant")
              : t("themePreviewModal.applyTheme")}
          </Button>
        </div>
      </div>
    </div>
  );
}
