import { FC, useState, useMemo, useEffect, useRef } from "react";
import { Button } from "./Button";
import DexPreview, { DexPreviewProps } from "./DexPreview";
import { themePresets, ThemePreset } from "../types/dex";
import { extractFontValues } from "../utils/cssParser";
import ThemeEditingTabs from "./ThemeEditingTabs";
import { useThemeEditor } from "../hooks/useThemeEditor";

export interface ThemePresetPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  previewProps?: DexPreviewProps;
  onApply: (theme: string) => void;
  viewMode?: "desktop" | "mobile";
  currentTheme?: string | null;
  onPreviewChange?: (theme: string) => void;
}

const ThemePresetPreviewModal: FC<ThemePresetPreviewModalProps> = ({
  isOpen,
  onClose,
  previewProps,
  onApply,
  viewMode = "desktop",
  currentTheme,
  onPreviewChange,
}) => {
  const [selectedPreset, setSelectedPreset] = useState<ThemePreset>("1");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const selectedPresetTheme =
    themePresets.find(p => p.id === selectedPreset)?.theme || "";
  const {
    css,
    activeTab,
    setActiveTab,
    updateCssColor,
    updateCssValue,
    resetCss,
  } = useThemeEditor(selectedPresetTheme);
  const originalMatchMediaRef = useRef<typeof window.matchMedia | null>(null);
  const originalThemeRef = useRef<string | null>(null);

  const isActualMobileDevice = useMemo(() => {
    return window.innerWidth < 768;
  }, []);

  useEffect(() => {
    if (viewMode === "mobile" && isOpen) {
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
  }, [viewMode, isOpen]);

  if (!isOpen) return null;

  useEffect(() => {
    if (isOpen) {
      originalThemeRef.current = currentTheme || null;
      resetCss(selectedPresetTheme);
    }
  }, [isOpen, currentTheme, selectedPresetTheme, resetCss]);

  useEffect(() => {
    if (selectedPresetTheme) {
      resetCss(selectedPresetTheme);
    }
  }, [selectedPresetTheme, resetCss]);

  useEffect(() => {
    if (isOpen && onPreviewChange) {
      onPreviewChange(selectedPresetTheme);
    }
  }, [selectedPreset, selectedPresetTheme, isOpen, onPreviewChange]);

  const handleClose = () => {
    if (onPreviewChange && originalThemeRef.current !== null) {
      onPreviewChange(originalThemeRef.current);
    }
    onClose();
  };

  const { fontFamily, fontSize } = useMemo(
    () => extractFontValues(selectedPresetTheme),
    [selectedPresetTheme]
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

  const handleApplyClick = () => {
    setShowConfirmModal(true);
  };

  const handleConfirmApply = () => {
    originalThemeRef.current = null;
    onApply(css);
    setShowConfirmModal(false);
    onClose();
  };

  const handleCancelConfirm = () => {
    setShowConfirmModal(false);
  };

  if (previewProps && (!isActualMobileDevice || viewMode === "desktop")) {
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
            Select Theme Preset
          </h2>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-background-card border border-light/20 rounded-lg p-1">
              {themePresets.map(preset => (
                <button
                  key={preset.id}
                  onClick={() => setSelectedPreset(preset.id)}
                  className={`px-3 py-1.5 text-sm rounded transition-colors ${
                    selectedPreset === preset.id
                      ? "bg-primary text-white"
                      : "text-gray-400 hover:text-gray-200"
                  }`}
                  type="button"
                >
                  {preset.name}
                </button>
              ))}
            </div>
            <Button
              onClick={handleClose}
              variant="ghost"
              size="md"
              type="button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleApplyClick}
              variant="primary"
              size="md"
              type="button"
            >
              Apply Preset
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
            {cleanPreviewProps && (
              <DexPreview
                {...cleanPreviewProps}
                customStyles={css}
                fontFamily={fontFamily}
                fontSize={fontSize}
                className={viewMode === "mobile" ? "w-full" : "h-full w-full"}
                key={`preset-preview-${selectedPreset}-${css.slice(0, 50)}`}
              />
            )}
          </div>
        </div>

        {showConfirmModal && (
          <div
            className="fixed inset-0 z-[10001] flex items-center justify-center bg-background-dark/80 backdrop-blur-sm"
            onClick={e => {
              if (e.target === e.currentTarget) {
                handleCancelConfirm();
              }
            }}
          >
            <div
              className="bg-background-light border border-light/10 rounded-xl p-6 max-w-md mx-4 shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="i-mdi:alert-circle text-warning h-6 w-6 flex-shrink-0 mt-0.5"></div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-200 mb-2">
                    Apply Theme Preset?
                  </h3>
                  <p className="text-sm text-gray-300">
                    Applying this preset will{" "}
                    <strong>
                      overwrite all your current theme customizations
                    </strong>
                    , including:
                  </p>
                  <ul className="text-sm text-gray-300 list-disc list-inside mt-2 space-y-1">
                    <li>All color customizations</li>
                    <li>Font settings</li>
                    <li>Border radius adjustments</li>
                    <li>Spacing modifications</li>
                    <li>Any AI fine-tune overrides</li>
                  </ul>
                  <p className="text-sm text-gray-300 mt-3">
                    This action cannot be undone. Are you sure you want to
                    continue?
                  </p>
                </div>
              </div>
              <div className="flex gap-3 justify-end">
                <Button
                  onClick={handleCancelConfirm}
                  variant="ghost"
                  size="md"
                  type="button"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirmApply}
                  variant="primary"
                  size="md"
                  type="button"
                >
                  Yes, Apply Preset
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Mobile/editing interface
  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center h-screen">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-background-dark/80 backdrop-blur-sm z-[1001]"
        onClick={handleClose}
      ></div>

      {/* Modal */}
      <div className="relative z-[1002] w-full max-w-3xl p-6 rounded-xl bg-background-light border border-light/10 shadow-2xl slide-fade-in max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold">Select Theme Preset</h3>
          <div className="flex items-center gap-2 bg-background-card border border-light/20 rounded-lg p-1">
            {themePresets.map(preset => (
              <button
                key={preset.id}
                onClick={() => setSelectedPreset(preset.id)}
                className={`px-3 py-1.5 text-sm rounded transition-colors ${
                  selectedPreset === preset.id
                    ? "bg-primary text-white"
                    : "text-gray-400 hover:text-gray-200"
                }`}
                type="button"
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>

        <ThemeEditingTabs
          css={css}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onColorChange={updateCssColor}
          onValueChange={updateCssValue}
        />

        <div className="flex gap-3 justify-end">
          <Button variant="ghost" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleApplyClick}>
            Apply Preset
          </Button>
        </div>
      </div>

      {showConfirmModal && (
        <div
          className="fixed inset-0 z-[10001] flex items-center justify-center bg-background-dark/80 backdrop-blur-sm"
          onClick={e => {
            if (e.target === e.currentTarget) {
              handleCancelConfirm();
            }
          }}
        >
          <div
            className="bg-background-light border border-light/10 rounded-xl p-6 max-w-md mx-4 shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-start gap-4 mb-4">
              <div className="i-mdi:alert-circle text-warning h-6 w-6 flex-shrink-0 mt-0.5"></div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-200 mb-2">
                  Apply Theme Preset?
                </h3>
                <p className="text-sm text-gray-300">
                  Applying this preset will{" "}
                  <strong>
                    overwrite all your current theme customizations
                  </strong>
                  , including:
                </p>
                <ul className="text-sm text-gray-300 list-disc list-inside mt-2 space-y-1">
                  <li>All color customizations</li>
                  <li>Font settings</li>
                  <li>Border radius adjustments</li>
                  <li>Spacing modifications</li>
                  <li>Any AI fine-tune overrides</li>
                </ul>
                <p className="text-sm text-gray-300 mt-3">
                  This action cannot be undone. Are you sure you want to
                  continue?
                </p>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <Button
                onClick={handleCancelConfirm}
                variant="ghost"
                size="md"
                type="button"
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmApply}
                variant="primary"
                size="md"
                type="button"
              >
                Yes, Apply Preset
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThemePresetPreviewModal;
