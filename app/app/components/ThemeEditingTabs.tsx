import { FC } from "react";
import { useTranslation } from "~/i18n";
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
  const { t } = useTranslation();
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
          <TabButton tab="colors" label={t("themeEditingTabs.colorPalette")} />
          <TabButton tab="fonts" label={t("themeEditingTabs.fonts")} />
          <TabButton tab="rounded" label={t("themeEditingTabs.borderRadius")} />
          <TabButton tab="spacing" label={t("themeEditingTabs.spacing")} />
        </div>
      </div>

      <div className="pt-2">
        {activeTab === "colors" && (
          <div className="bg-background-dark/50 p-4 rounded-lg border border-light/10">
            <h4 className="font-semibold mb-2 flex justify-between items-center">
              <span>{t("themeEditingTabs.colorPalette")}</span>
              <span className="text-xs text-gray-400">
                {t("themeEditingTabs.clickOnColorToEdit")}
              </span>
            </h4>
            <ThemeColorSwatches css={css} onColorChange={onColorChange} />
          </div>
        )}

        {activeTab === "fonts" && (
          <div className="bg-background-dark/50 p-4 rounded-lg border border-light/10">
            <h4 className="font-semibold mb-2 flex justify-between items-center">
              <span>{t("themeEditingTabs.fonts")}</span>
              <span className="text-xs text-gray-400">
                {t("themeEditingTabs.customizeFontFamilyAndSize")}
              </span>
            </h4>
            <ThemeFontControls css={css} onValueChange={onValueChange} />
          </div>
        )}

        {activeTab === "rounded" && (
          <div className="bg-background-dark/50 p-4 rounded-lg border border-light/10">
            <h4 className="font-semibold mb-2 flex justify-between items-center">
              <span>{t("themeEditingTabs.borderRadius")}</span>
              <span className="text-xs text-gray-400">
                {t("themeEditingTabs.adjustValuesWithSliders")}
              </span>
            </h4>
            <ThemeRoundedControls css={css} onValueChange={onValueChange} />
          </div>
        )}

        {activeTab === "spacing" && (
          <div className="bg-background-dark/50 p-4 rounded-lg border border-light/10">
            <h4 className="font-semibold mb-2 flex justify-between items-center">
              <span>{t("themeEditingTabs.spacing")}</span>
              <span className="text-xs text-gray-400">
                {t("themeEditingTabs.adjustSpacingWithSliders")}
              </span>
            </h4>
            <ThemeSpacingControls css={css} onValueChange={onValueChange} />
          </div>
        )}
      </div>

      {showCssPreview && (
        <div>
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-semibold">{t("themeEditingTabs.css")}</h4>
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
