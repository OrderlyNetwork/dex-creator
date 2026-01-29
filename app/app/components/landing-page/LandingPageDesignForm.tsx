import { Card } from "../Card";
import { Button } from "../Button";
import { FONT_FAMILIES } from "../../constants/landingPageDefaults";
import type { LandingPageConfigForm } from "../../types/landingPageConfig";

interface LandingPageDesignFormProps {
  formData: LandingPageConfigForm;
  onInputChange: (field: keyof LandingPageConfigForm, value: unknown) => void;
  showResetButton?: boolean;
  onReset?: () => void;
}

export function LandingPageDesignForm({
  formData,
  onInputChange,
  showResetButton,
  onReset,
}: LandingPageDesignFormProps) {
  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold">Design & Colors</h2>
        {showResetButton && onReset && (
          <Button type="button" variant="secondary" size="sm" onClick={onReset}>
            <div className="i-mdi:refresh h-4 w-4 mr-2"></div>
            Reset
          </Button>
        )}
      </div>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Default Theme
          </label>
          <p className="text-xs text-gray-400 mb-2">
            The default theme for the landing page. Users can toggle between
            light and dark modes.
          </p>
          <select
            value={formData.theme}
            onChange={e =>
              onInputChange("theme", e.target.value as "light" | "dark")
            }
            className="w-full p-3 bg-background-dark border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary"
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </div>

        <div className="border-t border-gray-700 pt-4">
          <label className="block text-sm font-medium mb-3">
            Color Palette
          </label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Primary Color
              </label>
              <input
                type="color"
                value={formData.primaryColor}
                onChange={e => onInputChange("primaryColor", e.target.value)}
                className="w-full h-10 bg-background-dark border border-gray-700 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Secondary Color
              </label>
              <input
                type="color"
                value={formData.secondaryColor}
                onChange={e => onInputChange("secondaryColor", e.target.value)}
                className="w-full h-10 bg-background-dark border border-gray-700 rounded-lg"
              />
            </div>
            {formData.primaryLight && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  Primary Light
                </label>
                <input
                  type="color"
                  value={formData.primaryLight}
                  onChange={e => onInputChange("primaryLight", e.target.value)}
                  className="w-full h-10 bg-background-dark border border-gray-700 rounded-lg"
                />
              </div>
            )}
            {formData.linkColor && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  Link Color
                </label>
                <input
                  type="color"
                  value={formData.linkColor}
                  onChange={e => onInputChange("linkColor", e.target.value)}
                  className="w-full h-10 bg-background-dark border border-gray-700 rounded-lg"
                />
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Font Family</label>
          <select
            value={formData.fontFamily}
            onChange={e => onInputChange("fontFamily", e.target.value)}
            className="w-full p-3 bg-background-dark border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary"
            style={{ fontFamily: formData.fontFamily }}
          >
            {FONT_FAMILIES.map(font => (
              <option key={font.value} value={font.value}>
                {font.name} ({font.category})
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-400 mt-1">
            Selected font:{" "}
            <span style={{ fontFamily: formData.fontFamily }}>ABC abc 123</span>
          </p>
        </div>
      </div>
    </Card>
  );
}
