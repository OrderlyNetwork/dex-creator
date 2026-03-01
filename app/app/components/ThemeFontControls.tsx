import { useState, useEffect } from "react";
import { i18n, useTranslation } from "~/i18n";
import { extractFontValues as extractFontValuesUtil } from "../utils/cssParser";

interface ThemeFontControlsProps {
  css: string;
  onValueChange: (variableName: string, newValue: string) => void;
}

interface FontValues {
  fontFamily: string;
  fontSize: string;
}

interface FontFamilyOption {
  name: string;
  value: string;
  preview: string;
  category: string;
}

function getFontFamilies(): FontFamilyOption[] {
  return [
    {
      name: "Manrope",
      value: "'Manrope', sans-serif",
      preview: "Manrope",
      category: i18n.t("theme.fontControls.category.default"),
    },
    {
      name: "Roboto",
      value: "'Roboto', sans-serif",
      preview: "Roboto",
      category: i18n.t("theme.fontControls.category.modern"),
    },
    {
      name: "Open Sans",
      value: "'Open Sans', sans-serif",
      preview: "Open Sans",
      category: i18n.t("theme.fontControls.category.readable"),
    },
    {
      name: "Lato",
      value: "'Lato', sans-serif",
      preview: "Lato",
      category: i18n.t("theme.fontControls.category.readable"),
    },
    {
      name: "Poppins",
      value: "'Poppins', sans-serif",
      preview: "Poppins",
      category: i18n.t("theme.fontControls.category.modern"),
    },
    {
      name: "Source Sans Pro",
      value: "'Source Sans Pro', sans-serif",
      preview: "Source Sans Pro",
      category: i18n.t("theme.fontControls.category.readable"),
    },
    {
      name: "Nunito",
      value: "'Nunito', sans-serif",
      preview: "Nunito",
      category: i18n.t("theme.fontControls.category.friendly"),
    },
    {
      name: "Montserrat",
      value: "'Montserrat', sans-serif",
      preview: "Montserrat",
      category: i18n.t("theme.fontControls.category.modern"),
    },
    {
      name: "Raleway",
      value: "'Raleway', sans-serif",
      preview: "Raleway",
      category: i18n.t("theme.fontControls.category.elegant"),
    },
    {
      name: "Ubuntu",
      value: "'Ubuntu', sans-serif",
      preview: "Ubuntu",
      category: i18n.t("theme.fontControls.category.modern"),
    },
    {
      name: "Fira Sans",
      value: "'Fira Sans', sans-serif",
      preview: "Fira Sans",
      category: i18n.t("theme.fontControls.category.technical"),
    },
  ];
}

// Custom dropdown component for font selection
const FontDropdown = ({
  value,
  onChange,
  isOpen,
  onToggle,
  fontFamilies,
}: {
  value: string;
  onChange: (newValue: string) => void;
  isOpen: boolean;
  onToggle: () => void;
  fontFamilies: FontFamilyOption[];
}) => {
  const selectedFont =
    fontFamilies.find(font => font.value === value) || fontFamilies[0];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        className="w-full px-3 py-2 bg-background-dark/80 border border-light/20 rounded text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary flex items-center justify-between"
      >
        <span style={{ fontFamily: selectedFont.value }}>
          {selectedFont.name}
        </span>
        <div
          className={`i-mdi:chevron-down h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
        ></div>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-background-dark/95 border border-light/20 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
          {fontFamilies.map(font => (
            <button
              key={font.value}
              type="button"
              onClick={() => {
                onChange(font.value);
                onToggle();
              }}
              className="w-full px-3 py-2 text-left hover:bg-background-light/30 transition-colors flex items-center justify-between"
            >
              <div className="flex flex-col flex-1">
                <span
                  className="text-sm text-white"
                  style={{ fontFamily: font.value }}
                >
                  {font.preview}
                </span>
                <span className="text-xs text-gray-400">{font.category}</span>
                <div
                  className="mt-1 text-md text-gray-300"
                  style={{ fontFamily: font.value }}
                >
                  ABC abc 123
                </div>
              </div>
              {value === font.value && (
                <div className="i-mdi:check h-4 w-4 text-primary"></div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default function ThemeFontControls({
  css,
  onValueChange,
}: ThemeFontControlsProps) {
  const { t } = useTranslation();
  const [fontValues, setFontValues] = useState<FontValues>({
    fontFamily: "'Manrope', sans-serif",
    fontSize: "16px",
  });
  const [isFontDropdownOpen, setIsFontDropdownOpen] = useState(false);

  // Extract font values from CSS when component mounts or CSS changes
  useEffect(() => {
    const extractedValues = extractFontValuesUtil(css);
    setFontValues(extractedValues);
  }, [css]);

  // Parse CSS value to get numeric value and unit
  const parseCssValue = (value: string): { value: number; unit: string } => {
    const match = value.match(/^([\d.]+)(.*)$/);
    if (match) {
      return {
        value: parseFloat(match[1]),
        unit: match[2],
      };
    }
    return { value: 16, unit: "px" };
  };

  // Format CSS value
  const formatCssValue = (value: number, unit: string): string => {
    return `${value}${unit}`;
  };

  // Handle font family change
  const handleFontFamilyChange = (newFontFamily: string) => {
    setFontValues(prev => ({
      ...prev,
      fontFamily: newFontFamily,
    }));
    onValueChange("oui-font-family", newFontFamily);
  };

  // Handle font size slider change
  const handleFontSizeSliderChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = parseFloat(e.target.value);
    const { unit } = parseCssValue(fontValues.fontSize);
    const newValue = formatCssValue(value, unit);

    setFontValues(prev => ({
      ...prev,
      fontSize: newValue,
    }));

    onValueChange("oui-font-size-base", newValue);
  };

  // Handle direct font size input change
  const handleFontSizeInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const inputValue = e.target.value;
    const regex = /^[\d.]+[a-z%]*$/;

    if (regex.test(inputValue)) {
      setFontValues(prev => ({
        ...prev,
        fontSize: inputValue,
      }));

      onValueChange("oui-font-size-base", inputValue);
    }
  };

  // Get the maximum slider value based on the current value
  const getMaxSliderValue = (): number => {
    const { value } = parseCssValue(fontValues.fontSize);

    // If value is already greater than 32, set max to value + 8
    if (value > 32) return Math.ceil(value + 8);

    // Otherwise use 32 as the default max
    return 32;
  };

  const { value: fontSizeValue } = parseCssValue(fontValues.fontSize);

  return (
    <div className="space-y-6">
      {/* Help text */}
      <div className="text-xs text-gray-400 flex items-center gap-1.5 mb-2">
        <span className="i-mdi:format-font text-primary text-sm"></span>
        <span>{t("theme.fontControls.helpText")}</span>
      </div>

      {/* Font Family Selection */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="w-16 h-16 flex-shrink-0 flex items-center justify-center bg-background-dark/50 border border-light/10 rounded">
            <span
              className="text-lg font-medium text-white"
              style={{ fontFamily: fontValues.fontFamily }}
            >
              Aa
            </span>
          </div>
          <div className="flex flex-col">
            {/* i18n-ignore */}
            <span className="text-sm font-medium">Font Family</span>
            {/* i18n-ignore */}
            <span className="text-xs text-gray-400">--oui-font-family</span>
          </div>
        </div>
        <div className="mt-2">
          <FontDropdown
            value={fontValues.fontFamily}
            onChange={handleFontFamilyChange}
            isOpen={isFontDropdownOpen}
            onToggle={() => setIsFontDropdownOpen(!isFontDropdownOpen)}
            fontFamilies={getFontFamilies()}
          />
        </div>
      </div>

      {/* Font Size Control */}
      <div className="space-y-2 border-t border-light/10 pt-4">
        <div className="flex items-center gap-3">
          <div className="w-16 h-16 flex-shrink-0 flex items-center justify-center bg-background-dark/50 border border-light/10 rounded">
            <span
              className="text-white font-medium"
              style={{
                fontFamily: fontValues.fontFamily,
                fontSize: fontValues.fontSize,
              }}
            >
              T
            </span>
          </div>
          <div className="flex flex-col">
            {/* i18n-ignore */}
            <span className="text-sm font-medium">Font Size</span>
            {/* i18n-ignore */}
            <span className="text-xs text-gray-400">--oui-font-size-base</span>
          </div>
        </div>
        <div className="mt-2">
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="8"
              max={getMaxSliderValue()}
              value={fontSizeValue}
              step="0.5"
              onChange={handleFontSizeSliderChange}
              className="flex-grow h-2 rounded-lg appearance-none cursor-pointer bg-background-dark/80 border border-light/20 relative 
              hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
            />
            <input
              type="text"
              value={fontValues.fontSize}
              onChange={handleFontSizeInputChange}
              className="w-16 sm:w-20 px-2 py-1 bg-background-dark/80 border border-light/20 rounded text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
              // i18n-ignore
              aria-label="Font size value"
            />
          </div>
        </div>
      </div>

      {/* Preview Text */}
      <div className="border-t border-light/10 pt-4">
        <div className="mb-2">
          <span className="text-sm font-medium text-gray-300">
            {t("theme.fontControls.preview")}
          </span>
        </div>
        <div
          className="p-4 bg-background-dark/50 border border-light/10 rounded-lg"
          style={{
            fontFamily: fontValues.fontFamily,
            fontSize: fontValues.fontSize,
          }}
        >
          <p className="text-white mb-2">
            {t("theme.fontControls.previewDesc")}
          </p>
          <p className="text-gray-300 text-sm">
            {t("theme.fontControls.previewNote")}
          </p>
        </div>
      </div>
    </div>
  );
}
