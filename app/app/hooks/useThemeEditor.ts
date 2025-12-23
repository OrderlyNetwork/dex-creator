import { useState, useCallback } from "react";
import { hexToRgbSpaceSeparated } from "../utils/colorUtils";

export type ThemeTabType = "colors" | "fonts" | "rounded" | "spacing";

/**
 * Hook for managing theme CSS editing state and operations
 */
export function useThemeEditor(initialCss: string) {
  const [css, setCss] = useState(initialCss);
  const [activeTab, setActiveTab] = useState<ThemeTabType>("colors");

  const updateCssColor = useCallback(
    (variableName: string, newColorHex: string) => {
      const newColorRgb = hexToRgbSpaceSeparated(newColorHex);

      setCss(prevCss => {
        let updatedCss = prevCss;

        if (variableName.startsWith("oui-color")) {
          const regex = new RegExp(
            `(--${variableName}:\\s*)(\\d+\\s+\\d+\\s+\\d+)`,
            "g"
          );
          updatedCss = updatedCss.replace(regex, `$1${newColorRgb}`);
        } else if (variableName.startsWith("gradient")) {
          const regex = new RegExp(
            `(--oui-${variableName}:\\s*)(\\d+\\s+\\d+\\s+\\d+)`,
            "g"
          );
          updatedCss = updatedCss.replace(regex, `$1${newColorRgb}`);
        }

        return updatedCss;
      });
    },
    []
  );

  const updateCssValue = useCallback(
    (variableName: string, newValue: string) => {
      setCss(prevCss => {
        const regex = new RegExp(`(--${variableName}:\\s*)([^;]+)`, "g");
        return prevCss.replace(regex, `$1${newValue}`);
      });
    },
    []
  );

  const resetCss = useCallback((newCss: string) => {
    setCss(newCss);
  }, []);

  return {
    css,
    activeTab,
    setActiveTab,
    updateCssColor,
    updateCssValue,
    resetCss,
  };
}
