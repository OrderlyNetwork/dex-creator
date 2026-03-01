import { FC, useState, useEffect, ChangeEvent } from "react";
import { useTranslation } from "~/i18n";
import { Button } from "./Button";
import CurrentThemeEditor from "./CurrentThemeEditor";
import type { ThemeTabType } from "./ThemeCustomizationSection";

export interface CurrentThemeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: string | null;
  defaultTheme: string;
  savedTheme?: string | null;
  updateCssColor: (variableName: string, newColorHex: string) => void;
  updateCssValue: (variableName: string, newValue: string) => void;
  tradingViewColorConfig: string | null;
  setTradingViewColorConfig: (config: string | null) => void;
  onThemeChange?: (newTheme: string) => void;
}

const CurrentThemeModal: FC<CurrentThemeModalProps> = ({
  isOpen,
  onClose,
  currentTheme,
  defaultTheme,
  savedTheme,
  updateCssColor,
  updateCssValue,
  tradingViewColorConfig,
  setTradingViewColorConfig,
  onThemeChange,
}) => {
  const { t } = useTranslation();
  const [activeThemeTab, setActiveThemeTab] = useState<ThemeTabType>("colors");
  const [showThemeEditor, setShowThemeEditor] = useState(false);
  const [viewCssCode, setViewCssCode] = useState(false);
  const [localTheme, setLocalTheme] = useState(currentTheme || defaultTheme);

  useEffect(() => {
    if (!isOpen) {
      setActiveThemeTab("colors");
      setShowThemeEditor(false);
      setViewCssCode(false);
    } else {
      setLocalTheme(currentTheme || defaultTheme);
    }
  }, [isOpen, currentTheme, defaultTheme]);

  const handleThemeEditorChange = (value: string) => {
    setLocalTheme(value);
    if (onThemeChange) {
      onThemeChange(value);
    }
  };

  const handleApply = () => {
    if (onThemeChange) {
      onThemeChange(localTheme);
    }
    onClose();
  };

  const hasAIFineTuneOverrides = (theme: string): boolean => {
    return /\/\*\s*AI Fine-Tune Overrides\s*\*\//i.test(theme);
  };

  const handleResetAIFineTune = () => {
    let cleanedTheme = localTheme;
    if (hasAIFineTuneOverrides(cleanedTheme)) {
      cleanedTheme = cleanedTheme.replace(
        /\/\*\s*AI Fine-Tune Overrides\s*\*\/\s*[\s\S]*?(?=\/\*\s*AI Fine-Tune Overrides\s*\*\/|$)/gi,
        ""
      );
      cleanedTheme = cleanedTheme.replace(/\n{3,}/g, "\n\n").trim();
    }
    setLocalTheme(cleanedTheme);
    if (onThemeChange) {
      onThemeChange(cleanedTheme);
    }
  };

  if (!isOpen) return null;

  const ModalTabButton: React.FC<{ tab: ThemeTabType; label: string }> = ({
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

  return (
    <div
      className="fixed inset-0 z-[60] bg-background-dark/95 flex items-center justify-center p-4"
      onClick={e => e.stopPropagation()}
      onKeyDown={e => e.stopPropagation()}
      onKeyUp={e => e.stopPropagation()}
      role="dialog"
      data-higher-modal="true"
    >
      <div className="bg-background-card border border-light/20 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-light/10">
          <h2 className="text-lg font-bold text-gray-200">
            {t("theme.currentTheme")}
          </h2>
          <Button onClick={onClose} variant="secondary" size="sm" type="button">
            {t("common.close")}
          </Button>
        </div>
        <div className="flex-1 overflow-auto p-4">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex gap-2">
              <Button
                onClick={() => setShowThemeEditor(!showThemeEditor)}
                variant="secondary"
                size="sm"
                type="button"
              >
                <span className="flex items-center gap-1">
                  <div
                    className={
                      showThemeEditor
                        ? "i-mdi:eye h-4 w-4"
                        : "i-mdi:pencil h-4 w-4"
                    }
                  ></div>
                  {showThemeEditor
                    ? t("theme.hideEditor")
                    : t("theme.editCss")}
                </span>
              </Button>
            </div>
          </div>

          {showThemeEditor && (
            <div className="mb-4 slide-fade-in">
              <textarea
                value={localTheme}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                  handleThemeEditorChange(e.target.value)
                }
                className="w-full h-80 bg-black/80 text-xs text-gray-300 font-mono p-3 rounded border border-light/10"
                placeholder={t("theme.editYourCssTheme")}
              />
            </div>
          )}

          {!showThemeEditor && (
            <div className="mb-4 text-xs">
              <button
                onClick={() => setViewCssCode(!viewCssCode)}
                className="cursor-pointer text-gray-400 hover:text-gray-300 transition-colors flex items-center"
                type="button"
              >
                <span>
                  {viewCssCode
                    ? t("theme.hideCssCode")
                    : t("theme.viewCssCode")}
                </span>
                <div
                  className={`i-mdi:chevron-down h-4 w-4 ml-1 transition-transform ${viewCssCode ? "rotate-180" : ""}`}
                ></div>
              </button>
              {viewCssCode && (
                <div className="bg-base-8/50 p-4 rounded-lg overflow-auto text-xs max-h-[300px] mt-2 slide-fade-in">
                  <pre className="language-css">{localTheme}</pre>
                </div>
              )}
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
            ThemeTabButton={ModalTabButton}
          />
        </div>
        <div className="flex items-center justify-between p-4 border-t border-light/10 gap-2">
          <div className="flex gap-2">
            {hasAIFineTuneOverrides(localTheme) && (
              <Button
                onClick={handleResetAIFineTune}
                variant="secondary"
                size="sm"
                type="button"
              >
                {t("currentThemeModal.resetAIFineTune")}
              </Button>
            )}
            <Button
              onClick={() => {
                const resetValue = savedTheme ?? defaultTheme;
                if (onThemeChange) {
                  onThemeChange(resetValue);
                }
                onClose();
              }}
              variant="danger"
              size="sm"
              type="button"
            >
              {t("common.reset")}
            </Button>
          </div>
          <Button
            onClick={handleApply}
            variant="primary"
            size="sm"
            type="button"
          >
            {t("common.applyChanges")}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CurrentThemeModal;
