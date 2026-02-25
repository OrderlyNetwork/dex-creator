import React, { useState } from "react";
import { useTranslation } from "~/i18n";

interface ThemeColorSwatchesProps {
  css: string;
  onColorChange: (variableName: string, newColorHex: string) => void;
}

export default function ThemeColorSwatches({
  css,
  onColorChange,
}: ThemeColorSwatchesProps) {
  const { t } = useTranslation();
  const [syncBrandWithPrimary, setSyncBrandWithPrimary] = useState(true);

  const extractRgbValues = (cssText: string) => {
    const colorVariables: Record<string, string | null> = {};

    const variableRegex = /--oui-color-([a-zA-Z0-9-]+):\s*([^;]+)/g;
    let variableMatch;

    while ((variableMatch = variableRegex.exec(cssText)) !== null) {
      const [, colorName, valueStr] = variableMatch;

      const rgbRegex = /^\s*(\d+)\s+(\d+)\s+(\d+)\s*$/;
      const rgbMatch = valueStr.match(rgbRegex);

      if (rgbMatch) {
        colorVariables[colorName] = valueStr.trim().replace(/\s+/g, " ");
      } else {
        colorVariables[colorName] = null;
      }
    }

    return colorVariables;
  };

  const extractGradientValues = (cssText: string) => {
    const gradientVariables: Record<string, string | null> = {};
    const gradientRegex = /--oui-gradient-([a-zA-Z0-9-]+):\s*([^;]+);/g;
    let match;

    while ((match = gradientRegex.exec(cssText)) !== null) {
      const [, name, value] = match;
      gradientVariables[name] = value.trim();
    }

    return gradientVariables;
  };

  const rgbToHex = (rgb: string) => {
    const [r, g, b] = rgb.replace(/,/g, " ").split(/\s+/).map(Number);

    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  };

  const rgbColors = extractRgbValues(css);
  const gradientColors = extractGradientValues(css);
  const allColorKeys = Object.keys(rgbColors);

  const colorCategories = [
    {
      title: t("themeColorSwatches.primaryColors"),
      colors: allColorKeys.filter(
        key =>
          key.includes("primary") ||
          key.includes("link") ||
          key === "secondary" ||
          key === "tertiary" ||
          key === "quaternary"
      ),
    },
    {
      title: t("themeColorSwatches.statusColors"),
      colors: allColorKeys.filter(
        key =>
          key.includes("success") ||
          key.includes("warning") ||
          key.includes("danger")
      ),
    },
    {
      title: t("themeColorSwatches.baseColors"),
      colors: allColorKeys.filter(key => key.includes("base")),
    },
    {
      title: t("themeColorSwatches.tradingColors"),
      colors: allColorKeys.filter(key => key.includes("trading")),
    },
    {
      title: t("themeColorSwatches.fillColors"),
      colors: allColorKeys.filter(key => key.includes("fill")),
    },
    {
      title: t("themeColorSwatches.lineColors"),
      colors: allColorKeys.filter(
        key => key.includes("line") && !key.includes("trading")
      ),
    },
    {
      title: t("themeColorSwatches.otherColors"),
      colors: allColorKeys.filter(
        key =>
          !key.includes("primary") &&
          !key.includes("link") &&
          !key.includes("success") &&
          !key.includes("warning") &&
          !key.includes("danger") &&
          !key.includes("base") &&
          !key.includes("trading") &&
          !key.includes("fill") &&
          !key.includes("line") &&
          key !== "secondary" &&
          key !== "tertiary" &&
          key !== "quaternary"
      ),
    },
  ];

  const nonEmptyCategories = colorCategories.filter(
    category => category.colors.length > 0
  );

  function formatDisplayName(name: string): string {
    return name
      .split("-")
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
  }

  const isColorDark = (rgbStr: string) => {
    const [r, g, b] = rgbStr.split(",").map(Number);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance < 0.5;
  };

  const renderSwatch = (name: string) => {
    const displayName = formatDisplayName(name);
    const storedValue = rgbColors[name];
    const isValid = storedValue !== null;
    const commaRgb = isValid ? storedValue?.replace(/\s+/g, ",") : "255,0,0";

    const isDark = isColorDark(commaRgb);
    const textColor = isDark ? "white" : "black";
    const needsShadow = isDark;

    const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newColorHex = e.target.value;
      onColorChange(`oui-color-${name}`, newColorHex);
    };

    return (
      <div key={name} className="relative flex-[0_1_160px]">
        <div
          className={`h-16 w-full rounded-md flex items-center justify-between px-3 py-2 border ${!isValid ? "border-error/50" : "border-light/10"} cursor-pointer hover:ring-2 hover:ring-primary transition-all`}
          style={{
            backgroundColor: isValid
              ? `rgb(${commaRgb})`
              : storedValue === null
                ? "rgba(255,255,255,0.05)"
                : "rgba(255,0,0,0.15)",
          }}
          title={
            isValid
              ? t("themeColorSwatches.clickToEditColor", { displayName })
              : storedValue === null
                ? t("themeColorSwatches.clickToSetColor", { displayName })
                : t("themeColorSwatches.invalidCssFormat", { displayName })
          }
        >
          <div className="flex flex-col items-start">
            <span
              className="font-medium text-[0.8rem]"
              style={{
                color: isValid ? textColor : "white",
                textShadow:
                  needsShadow || !isValid ? "0 0 2px rgba(0,0,0,0.8)" : "none",
              }}
            >
              {displayName}
            </span>
            <span
              className="text-[0.65rem] opacity-80"
              style={{
                color: isValid ? textColor : "white",
                textShadow:
                  needsShadow || !isValid ? "0 0 2px rgba(0,0,0,0.8)" : "none",
              }}
            >
              {isValid
                ? t("themeColorSwatches.rgbValue", {
                    rgbValue: storedValue?.replace(/\s+/g, ", "),
                  })
                : storedValue === null
                  ? t("themeColorSwatches.notSet")
                  : t("themeColorSwatches.invalidFormat")}
            </span>
          </div>

          {!isValid && storedValue != null && (
            <div className="absolute -right-3 -top-3 text-error bg-background-dark/90 rounded-full p-0.5 h-5 w-5 flex items-center justify-center">
              <span className="i-mdi:alert-circle text-xs"></span>
            </div>
          )}

          <input
            type="color"
            className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
            value={isValid ? rgbToHex(commaRgb) : "#FF0000"}
            onChange={handleColorChange}
            onClick={e => e.stopPropagation()}
          />
        </div>
      </div>
    );
  };

  const renderGradientPreview = () => {
    const brandStart = gradientColors["brand-start"];
    const brandEnd = gradientColors["brand-end"];
    const brandAngle = gradientColors["brand-angle"] || "17.44deg";
    const brandStopStart = gradientColors["brand-stop-start"] || "6.62%";
    const brandStopEnd = gradientColors["brand-stop-end"] || "86.5%";

    const hasValidGradient = brandStart && brandEnd;

    return (
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <h5 className="text-sm font-medium text-gray-300">
            {t("themeColorSwatches.brandGradient")}
          </h5>
          <label className="flex items-center cursor-pointer relative">
            <input
              type="checkbox"
              checked={syncBrandWithPrimary}
              onChange={() => setSyncBrandWithPrimary(!syncBrandWithPrimary)}
              className="sr-only"
            />
            <div
              className={`w-10 h-5 rounded-full mr-2 flex items-center px-0.5 transition-colors duration-200 ease-in-out ${syncBrandWithPrimary ? "bg-primary/60" : "bg-background-dark/80"}`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ease-in-out ${syncBrandWithPrimary ? "transform translate-x-5" : "transform translate-x-0"}`}
              ></div>
            </div>
            <span className="text-xs text-gray-300">
              {t("themeColorSwatches.syncWithPrimary")}
            </span>
          </label>
        </div>

        {hasValidGradient ? (
          <div
            className="w-full h-16 rounded-md border border-light/10 overflow-hidden mb-2"
            style={{
              background: `linear-gradient(${brandAngle}, rgb(${brandStart.replace(/\s+/g, ",")}) ${brandStopStart}, rgb(${brandEnd.replace(/\s+/g, ",")}) ${brandStopEnd})`,
            }}
          ></div>
        ) : (
          <div className="w-full h-16 rounded-md border border-error/50 bg-background-dark/50 flex items-center justify-center">
            <span className="text-xs text-gray-400">
              {t("themeColorSwatches.invalidGradientFormat")}
            </span>
          </div>
        )}

        <div className="text-xs text-gray-400 mt-1">
          {t("themeColorSwatches.brandGradientUsedFor")}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {renderGradientPreview()}

      {nonEmptyCategories.map(category => (
        <div key={category.title} className="space-y-2">
          <h5 className="text-sm font-medium text-gray-300">
            {category.title} ({category.colors.length})
          </h5>
          <div className="flex flex-wrap gap-3 mt-4">
            {category.colors.map(name => renderSwatch(name))}
          </div>
        </div>
      ))}
    </div>
  );
}
