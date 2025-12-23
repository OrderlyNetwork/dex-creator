import { FC, useState, useEffect } from "react";
import { Button } from "./Button";
import CurrentThemeEditor from "./CurrentThemeEditor";
import type { ThemeTabType } from "./ThemeCustomizationSection";

export interface CurrentThemeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: string | null;
  defaultTheme: string;
  updateCssColor: (variableName: string, newColorHex: string) => void;
  updateCssValue: (variableName: string, newValue: string) => void;
  tradingViewColorConfig: string | null;
  setTradingViewColorConfig: (config: string | null) => void;
}

const CurrentThemeModal: FC<CurrentThemeModalProps> = ({
  isOpen,
  onClose,
  currentTheme,
  defaultTheme,
  updateCssColor,
  updateCssValue,
  tradingViewColorConfig,
  setTradingViewColorConfig,
}) => {
  const [activeThemeTab, setActiveThemeTab] = useState<ThemeTabType>("colors");

  useEffect(() => {
    if (!isOpen) {
      setActiveThemeTab("colors");
    }
  }, [isOpen]);

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
          <h2 className="text-lg font-bold text-gray-200">Current Theme</h2>
          <Button onClick={onClose} variant="secondary" size="sm" type="button">
            Close
          </Button>
        </div>
        <div className="flex-1 overflow-auto p-4">
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
      </div>
    </div>
  );
};

export default CurrentThemeModal;
