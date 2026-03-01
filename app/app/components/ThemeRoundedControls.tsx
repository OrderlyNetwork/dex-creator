import { useState, useEffect } from "react";
import { i18n, useTranslation } from "~/i18n";

interface ThemeRoundedControlsProps {
  css: string;
  onValueChange: (variableName: string, newValue: string) => void;
}

interface RoundedValues {
  [key: string]: string;
}

// The order in which we want to display the rounded variables
const ROUNDED_ORDER = ["sm", "", "md", "lg", "xl", "2xl", "full"] as const;

function getDisplayNameKey(key: (typeof ROUNDED_ORDER)[number]): string {
  const DISPLAY_NAME_KEYS = {
    "": i18n.t("theme.roundedControls.displayName.base"),
    sm: i18n.t("theme.roundedControls.displayName.sm"),
    md: i18n.t("theme.roundedControls.displayName.md"),
    lg: i18n.t("theme.roundedControls.displayName.lg"),
    xl: i18n.t("theme.roundedControls.displayName.xl"),
    "2xl": i18n.t("theme.roundedControls.displayName.2xl"),
    full: i18n.t("theme.roundedControls.displayName.full"),
  };
  return DISPLAY_NAME_KEYS[key];
}

export default function ThemeRoundedControls({
  css,
  onValueChange,
}: ThemeRoundedControlsProps) {
  const { t } = useTranslation();
  const [roundedValues, setRoundedValues] = useState<RoundedValues>({});

  // Extract rounded values from CSS when component mounts or CSS changes
  useEffect(() => {
    const extractedValues = extractRoundedValues(css);
    setRoundedValues(extractedValues);
  }, [css]);

  // Extract rounded values from CSS string
  const extractRoundedValues = (cssString: string): RoundedValues => {
    const values: RoundedValues = {};
    const regex = /--oui-rounded(-[^:]*)?:\s*([^;]+);/g;
    let match;

    while ((match = regex.exec(cssString)) !== null) {
      const suffix = match[1] ? match[1].substring(1) : "";
      const value = match[2].trim();
      values[suffix] = value;
    }

    return values;
  };

  // Parse CSS value to get numeric value and unit
  const parseCssValue = (value: string): { value: number; unit: string } => {
    const match = value.match(/^([\d.]+)(.*)$/);
    if (match) {
      return {
        value: parseFloat(match[1]),
        unit: match[2],
      };
    }
    return { value: 0, unit: "px" };
  };

  // Format CSS value
  const formatCssValue = (value: number, unit: string): string => {
    return `${value}${unit}`;
  };

  // Handle slider change
  const handleSliderChange = (
    key: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    // Don't allow editing the "full" value
    if (key === "full") return;

    const value = parseInt(e.target.value, 10);
    const { unit } = parseCssValue(roundedValues[key]);
    const newValue = formatCssValue(value, unit);

    setRoundedValues({
      ...roundedValues,
      [key]: newValue,
    });

    onValueChange(`oui-rounded${key ? `-${key}` : ""}`, newValue);
  };

  // Handle direct input change
  const handleInputChange = (
    key: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    // Don't allow editing the "full" value
    if (key === "full") return;

    const inputValue = e.target.value;
    const regex = /^[\d.]+[a-z%]*$/;

    if (regex.test(inputValue)) {
      setRoundedValues({
        ...roundedValues,
        [key]: inputValue,
      });

      onValueChange(`oui-rounded${key ? `-${key}` : ""}`, inputValue);
    }
  };

  // Get the maximum slider value based on the current value
  const getMaxSliderValue = (key: string): number => {
    const { value } = parseCssValue(roundedValues[key] || "0px");

    // If value is already greater than 40, set max to value + 10
    if (value > 40) return Math.ceil(value + 10);

    // Otherwise use 40 as the default max
    return 40;
  };

  // Render a preview of the rounded corners
  const renderRoundedPreview = (key: string, value: string) => {
    // Special case for "full" (9999px) - display as circle
    const style =
      key === "full" ? { borderRadius: "50%" } : { borderRadius: value };

    return (
      <div
        className="w-full h-full bg-primary/30 border border-primary transition-all duration-300"
        style={style}
      ></div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Help text on top for mobile */}
      <div className="text-xs text-gray-400 flex items-center gap-1.5 mb-2">
        <span className="i-mdi:radius-outline text-primary text-sm"></span>
        <span>{t("theme.roundedControls.helpText")}</span>
      </div>

      {ROUNDED_ORDER.map(key => {
        const value = roundedValues[key] || "0px";
        const { value: numValue } = parseCssValue(value);
        const isFullRounded = key === "full";
        const variableName = `--oui-rounded${key ? `-${key}` : ""}`;
        const displayName = getDisplayNameKey(key);

        return (
          <div
            key={key}
            className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 py-2 border-b border-light/5"
          >
            <div className="flex items-center gap-3">
              {/* Mobile-friendly preview box */}
              <div className="w-16 h-16 flex-shrink-0 flex items-center justify-center">
                {renderRoundedPreview(key, value)}
              </div>

              <div className="flex flex-col">
                <span className="text-sm font-medium">{displayName}</span>
                <span className="text-xs text-gray-400">{variableName}</span>
              </div>
            </div>

            <div className="flex-grow mt-2 sm:mt-0">
              {!isFullRounded ? (
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="0"
                    max={getMaxSliderValue(key)}
                    value={numValue}
                    onChange={e => handleSliderChange(key, e)}
                    className="flex-grow h-2 rounded-lg appearance-none cursor-pointer bg-background-dark/80 border border-light/20 relative 
                    hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  />

                  <input
                    type="text"
                    value={value}
                    onChange={e => handleInputChange(key, e)}
                    className="w-16 sm:w-20 px-2 py-1 bg-background-dark/80 border border-light/20 rounded text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                    aria-label={`${displayName} value`}
                  />
                </div>
              ) : (
                <div className="text-xs text-gray-400 italic px-1">
                  ({t("theme.roundedControls.fullRoundedCannotModify")})
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
