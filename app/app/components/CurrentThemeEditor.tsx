import React from "react";
import ThemeColorSwatches from "./ThemeColorSwatches";
import ThemeFontControls from "./ThemeFontControls";
import ThemeRoundedControls from "./ThemeRoundedControls";
import ThemeSpacingControls from "./ThemeSpacingControls";
import TradingViewColorConfig from "./TradingViewColorConfig";
import type { ThemeTabType } from "./ThemeCustomizationSection";

export interface CurrentThemeEditorProps {
  currentTheme: string | null;
  defaultTheme: string;
  activeThemeTab: ThemeTabType;
  updateCssColor: (variableName: string, newColorHex: string) => void;
  updateCssValue: (variableName: string, newValue: string) => void;
  tradingViewColorConfig: string | null;
  setTradingViewColorConfig: (config: string | null) => void;
  ThemeTabButton: React.FC<{ tab: ThemeTabType; label: string }>;
}

const CurrentThemeEditor: React.FC<CurrentThemeEditorProps> = ({
  currentTheme,
  defaultTheme,
  activeThemeTab,
  updateCssColor,
  updateCssValue,
  tradingViewColorConfig,
  setTradingViewColorConfig,
  ThemeTabButton,
}) => {
  return (
    <>
      <div className="border-b border-light/10 mt-4">
        <div className="flex overflow-x-auto">
          <ThemeTabButton tab="colors" label="Color Palette" />
          <ThemeTabButton tab="fonts" label="Fonts" />
          <ThemeTabButton tab="rounded" label="Border Radius" />
          <ThemeTabButton tab="spacing" label="Spacing" />
          <ThemeTabButton tab="tradingview" label="TradingView" />
        </div>
      </div>
      <div className="pt-4">
        {activeThemeTab === "colors" && (
          <div className="bg-background-dark/50 p-4 rounded-lg border border-light/10 slide-fade-in">
            <div className="flex items-center gap-1 mb-3 text-xs text-gray-400">
              <div className="i-mdi:information-outline h-3.5 w-3.5"></div>
              <span>
                Click on any color swatch below to edit with a color picker
              </span>
            </div>
            <ThemeColorSwatches
              css={currentTheme || defaultTheme}
              onColorChange={updateCssColor}
            />
          </div>
        )}
        {activeThemeTab === "fonts" && (
          <div className="bg-background-dark/50 p-4 rounded-lg border border-light/10 slide-fade-in">
            <div className="flex items-center gap-1 mb-3 text-xs text-gray-400">
              <div className="i-mdi:information-outline h-3.5 w-3.5"></div>
              <span>
                Customize the font family and base font size used throughout
                your DEX interface
              </span>
            </div>
            <ThemeFontControls
              css={currentTheme || defaultTheme}
              onValueChange={updateCssValue}
            />
          </div>
        )}
        {activeThemeTab === "rounded" && (
          <div className="bg-background-dark/50 p-4 rounded-lg border border-light/10 slide-fade-in">
            <div className="flex items-center gap-1 mb-3 text-xs text-gray-400">
              <div className="i-mdi:information-outline h-3.5 w-3.5"></div>
              <span>
                Adjust the rounded corners of your UI elements with the sliders
              </span>
            </div>
            <ThemeRoundedControls
              css={currentTheme || defaultTheme}
              onValueChange={updateCssValue}
            />
          </div>
        )}
        {activeThemeTab === "spacing" && (
          <div className="bg-background-dark/50 p-4 rounded-lg border border-light/10 slide-fade-in">
            <div className="flex items-center gap-1 mb-3 text-xs text-gray-400">
              <div className="i-mdi:information-outline h-3.5 w-3.5"></div>
              <span>
                Adjust the spacing values used throughout your DEX interface
              </span>
            </div>
            <ThemeSpacingControls
              css={currentTheme || defaultTheme}
              onValueChange={updateCssValue}
            />
          </div>
        )}
        {activeThemeTab === "tradingview" && (
          <div className="bg-background-dark/50 p-4 rounded-lg border border-light/10 slide-fade-in">
            <div className="flex items-center gap-1 mb-3 text-xs text-gray-400">
              <div className="i-mdi:information-outline h-3.5 w-3.5"></div>
              <span>Configure TradingView color settings</span>
            </div>
            <TradingViewColorConfig
              value={tradingViewColorConfig}
              onChange={setTradingViewColorConfig}
            />
          </div>
        )}
      </div>
    </>
  );
};

export default CurrentThemeEditor;
