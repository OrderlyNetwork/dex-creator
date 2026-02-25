import { FC, useEffect } from "react";
import { useTranslation } from "~/i18n";
import { Button } from "./Button";
import ThemeEditingTabs from "./ThemeEditingTabs";
import { useThemeEditor } from "../hooks/useThemeEditor";

export interface ThemeEditorTabsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: string | null;
  defaultTheme: string;
  onThemeChange: (newTheme: string) => void;
}

const ThemeEditorTabsModal: FC<ThemeEditorTabsModalProps> = ({
  isOpen,
  onClose,
  currentTheme,
  defaultTheme,
  onThemeChange,
}) => {
  const { t } = useTranslation();
  const {
    css,
    activeTab,
    setActiveTab,
    updateCssColor,
    updateCssValue,
    resetCss,
  } = useThemeEditor(currentTheme || defaultTheme);

  useEffect(() => {
    if (isOpen) {
      resetCss(currentTheme || defaultTheme);
    }
  }, [isOpen, currentTheme, defaultTheme, resetCss]);

  if (!isOpen) return null;

  const handleApply = () => {
    onThemeChange(css);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[10001] bg-background-dark/95 flex items-center justify-center p-4"
      onClick={e => e.stopPropagation()}
      onKeyDown={e => e.stopPropagation()}
      onKeyUp={e => e.stopPropagation()}
      role="dialog"
      data-higher-modal="true"
    >
      <div className="bg-background-card border border-light/20 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-light/10">
          <h2 className="text-lg font-bold text-gray-200">
            {t("themeEditorTabsModal.title")}
          </h2>
          <Button onClick={onClose} variant="secondary" size="sm" type="button">
            {t("themeEditorTabsModal.close")}
          </Button>
        </div>
        <div className="flex-1 overflow-auto p-4">
          <ThemeEditingTabs
            css={css}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onColorChange={updateCssColor}
            onValueChange={updateCssValue}
            showCssPreview={true}
          />
        </div>
        <div className="flex items-center justify-end gap-2 p-4 border-t border-light/10">
          <Button
            onClick={() => {
              onThemeChange(defaultTheme);
              onClose();
            }}
            variant="danger"
            size="sm"
            type="button"
          >
            {t("themeEditorTabsModal.resetToDefault")}
          </Button>
          <Button
            onClick={handleApply}
            variant="primary"
            size="sm"
            type="button"
          >
            {t("themeEditorTabsModal.applyChanges")}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ThemeEditorTabsModal;
