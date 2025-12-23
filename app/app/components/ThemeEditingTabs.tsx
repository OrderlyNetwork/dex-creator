import { FC } from "react";
import ThemeColorSwatches from "./ThemeColorSwatches";
import ThemeFontControls from "./ThemeFontControls";
import ThemeRoundedControls from "./ThemeRoundedControls";
import ThemeSpacingControls from "./ThemeSpacingControls";
import { ThemeTabType } from "../hooks/useThemeEditor";

export interface ThemeEditingTabsProps {
  css: string;
  activeTab: ThemeTabType;
  onTabChange: (tab: ThemeTabType) => void;
  onColorChange: (variableName: string, newColorHex: string) => void;
  onValueChange: (variableName: string, newValue: string) => void;
  showCssPreview?: boolean;
}

const ThemeEditingTabs: FC<ThemeEditingTabsProps> = ({
  css,
  activeTab,
  onTabChange,
  onColorChange,
  onValueChange,
  showCssPreview = true,
}) => {
  const TabButton = ({ tab, label }: { tab: ThemeTabType; label: string }) => (
    <button
      className={`px-4 py-2 text-sm font-medium rounded-t-lg ${
        activeTab === tab
          ? "bg-background-dark/50 text-white border-t border-l border-r border-light/10"
          : "bg-transparent text-gray-400 hover:text-white"
      }`}
      onClick={() => onTabChange(tab)}
      type="button"
    >
      {label}
    </button>
  );

  return (
    <div className="mb-6 space-y-4">
      <div className="border-b border-light/10">
        <div className="flex">
          <TabButton tab="colors" label="Color Palette" />
          <TabButton tab="fonts" label="Fonts" />
          <TabButton tab="rounded" label="Border Radius" />
          <TabButton tab="spacing" label="Spacing" />
        </div>
      </div>

      <div className="pt-2">
        {activeTab === "colors" && (
          <div className="bg-background-dark/50 p-4 rounded-lg border border-light/10">
            <h4 className="font-semibold mb-2 flex justify-between items-center">
              <span>Color Palette</span>
              <span className="text-xs text-gray-400">
                Click on any color to edit
              </span>
            </h4>
            <ThemeColorSwatches css={css} onColorChange={onColorChange} />
          </div>
        )}

        {activeTab === "fonts" && (
          <div className="bg-background-dark/50 p-4 rounded-lg border border-light/10">
            <h4 className="font-semibold mb-2 flex justify-between items-center">
              <span>Fonts</span>
              <span className="text-xs text-gray-400">
                Customize font family and size
              </span>
            </h4>
            <ThemeFontControls css={css} onValueChange={onValueChange} />
          </div>
        )}

        {activeTab === "rounded" && (
          <div className="bg-background-dark/50 p-4 rounded-lg border border-light/10">
            <h4 className="font-semibold mb-2 flex justify-between items-center">
              <span>Border Radius</span>
              <span className="text-xs text-gray-400">
                Adjust values with the sliders
              </span>
            </h4>
            <ThemeRoundedControls css={css} onValueChange={onValueChange} />
          </div>
        )}

        {activeTab === "spacing" && (
          <div className="bg-background-dark/50 p-4 rounded-lg border border-light/10">
            <h4 className="font-semibold mb-2 flex justify-between items-center">
              <span>Spacing</span>
              <span className="text-xs text-gray-400">
                Adjust spacing values with the sliders
              </span>
            </h4>
            <ThemeSpacingControls css={css} onValueChange={onValueChange} />
          </div>
        )}
      </div>

      {showCssPreview && (
        <div>
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-semibold">CSS</h4>
          </div>
          <pre className="bg-background-dark/95 p-4 rounded-lg text-sm border-2 border-primary/20 overflow-x-auto text-gray-200 shadow-inner max-h-[300px] overflow-y-auto">
            {css}
          </pre>
        </div>
      )}
    </div>
  );
};

export default ThemeEditingTabs;
