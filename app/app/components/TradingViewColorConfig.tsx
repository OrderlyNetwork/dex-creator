import { useState, useEffect } from "react";
import { Card } from "./Card";

interface ColorConfigInterface {
  upColor?: string;
  downColor?: string;
  pnlUpColor?: string;
  pnlDownColor?: string;
  chartBG?: string;
}

interface TradingViewColorConfigProps {
  value: string | null;
  onChange: (value: string | null) => void;
  disabled?: boolean;
}

const DEFAULT_COLORS: ColorConfigInterface = {
  upColor: "#00C896",
  downColor: "#F7525F",
  pnlUpColor: "#00C896",
  pnlDownColor: "#F7525F",
  chartBG: "#131722",
};

const COLOR_LABELS = {
  upColor: "Candle Up Color",
  downColor: "Candle Down Color",
  pnlUpColor: "PnL Profit Color",
  pnlDownColor: "PnL Loss Color",
  chartBG: "Chart Background",
};

const COLOR_DESCRIPTIONS = {
  upColor: "Color for bullish/rising price candles",
  downColor: "Color for bearish/falling price candles",
  pnlUpColor: "Color for positive PnL values",
  pnlDownColor: "Color for negative PnL values",
  chartBG: "Background color of the chart area",
};

export default function TradingViewColorConfig({
  value,
  onChange,
  disabled = false,
}: TradingViewColorConfigProps) {
  const [isEnabled, setIsEnabled] = useState(false);
  const [colors, setColors] = useState<ColorConfigInterface>(DEFAULT_COLORS);
  const [savedColors, setSavedColors] =
    useState<ColorConfigInterface>(DEFAULT_COLORS);

  useEffect(() => {
    if (value) {
      try {
        const parsed = JSON.parse(value);
        const mergedColors = { ...DEFAULT_COLORS, ...parsed };
        setColors(mergedColors);
        setSavedColors(mergedColors);
        setIsEnabled(true);
      } catch (error) {
        console.error("Error parsing TradingView color config:", error);
        setColors(DEFAULT_COLORS);
        setSavedColors(DEFAULT_COLORS);
        setIsEnabled(false);
      }
    } else {
      setIsEnabled(false);
    }
  }, [value]);

  const handleToggle = () => {
    const newEnabled = !isEnabled;
    setIsEnabled(newEnabled);

    if (newEnabled) {
      onChange(JSON.stringify(colors));
    } else {
      setSavedColors(colors);
      onChange(null);
    }
  };

  const handleColorChange = (
    colorKey: keyof ColorConfigInterface,
    newColor: string
  ) => {
    const newColors = { ...colors, [colorKey]: newColor };
    setColors(newColors);

    if (isEnabled) {
      onChange(JSON.stringify(newColors));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-base font-bold text-gray-300">
            TradingView Chart Colors
          </h4>
          <p className="text-xs text-gray-400 mt-1">
            Customize the colors used in TradingView charts
          </p>
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={isEnabled}
            onChange={handleToggle}
            disabled={disabled}
            className="sr-only"
          />
          <div
            className={`relative w-11 h-6 rounded-full transition-colors ${
              isEnabled ? "bg-primary" : "bg-gray-600"
            } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
          >
            <div
              className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                isEnabled ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </div>
          <span className="text-xs text-gray-400">
            {isEnabled ? "Enabled" : "Disabled"}
          </span>
        </label>
      </div>

      {(isEnabled ||
        (!isEnabled &&
          JSON.stringify(savedColors) !== JSON.stringify(DEFAULT_COLORS))) && (
        <Card className="p-4 slide-fade-in" variant="default">
          <div className="space-y-4">
            <div className="flex items-center gap-1 mb-3 text-xs text-gray-400">
              <div className="i-mdi:information-outline h-3.5 w-3.5"></div>
              <span>
                {isEnabled
                  ? "These colors will override TradingView's default chart colors"
                  : "Previously saved TradingView color configuration (currently disabled)"}
              </span>
            </div>

            {!isEnabled && (
              <div className="mb-3 p-2 bg-warning/10 rounded border border-warning/20">
                <div className="flex items-center gap-1 text-xs text-warning">
                  <div className="i-mdi:eye-off h-3.5 w-3.5"></div>
                  <span>
                    Custom colors are disabled. Enable above to apply these
                    colors.
                  </span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Object.entries(COLOR_LABELS).map(([colorKey, label]) => {
                const displayColors = isEnabled ? colors : savedColors;
                return (
                  <div key={colorKey} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <label
                          className={`text-sm font-medium ${isEnabled ? "text-gray-300" : "text-gray-500"}`}
                        >
                          {label}
                        </label>
                        <p
                          className={`text-xs ${isEnabled ? "text-gray-400" : "text-gray-600"}`}
                        >
                          {
                            COLOR_DESCRIPTIONS[
                              colorKey as keyof ColorConfigInterface
                            ]
                          }
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={
                            displayColors[
                              colorKey as keyof ColorConfigInterface
                            ] ||
                            DEFAULT_COLORS[
                              colorKey as keyof ColorConfigInterface
                            ]
                          }
                          onChange={e =>
                            handleColorChange(
                              colorKey as keyof ColorConfigInterface,
                              e.target.value
                            )
                          }
                          disabled={disabled || !isEnabled}
                          className={`w-8 h-8 rounded border border-light/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${!isEnabled ? "opacity-60" : ""}`}
                        />
                        <input
                          type="text"
                          value={
                            displayColors[
                              colorKey as keyof ColorConfigInterface
                            ] ||
                            DEFAULT_COLORS[
                              colorKey as keyof ColorConfigInterface
                            ]
                          }
                          onChange={e =>
                            handleColorChange(
                              colorKey as keyof ColorConfigInterface,
                              e.target.value
                            )
                          }
                          disabled={disabled || !isEnabled}
                          placeholder="#000000"
                          className={`w-20 px-2 py-1 bg-background-dark/80 border border-light/20 rounded text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary disabled:opacity-50 ${!isEnabled ? "opacity-60" : ""}`}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 p-3 bg-background-dark/50 rounded-lg border border-light/10">
              <h5
                className={`text-xs font-medium mb-2 ${isEnabled ? "text-gray-300" : "text-gray-500"}`}
              >
                Preview {!isEnabled && "(Disabled)"}
              </h5>
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-4 h-4 rounded ${!isEnabled ? "opacity-60" : ""}`}
                    style={{
                      backgroundColor: isEnabled
                        ? colors.upColor
                        : savedColors.upColor,
                    }}
                  ></div>
                  <span
                    className={isEnabled ? "text-gray-400" : "text-gray-600"}
                  >
                    Bullish
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-4 h-4 rounded ${!isEnabled ? "opacity-60" : ""}`}
                    style={{
                      backgroundColor: isEnabled
                        ? colors.downColor
                        : savedColors.downColor,
                    }}
                  ></div>
                  <span
                    className={isEnabled ? "text-gray-400" : "text-gray-600"}
                  >
                    Bearish
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-4 h-4 rounded border border-light/20 ${!isEnabled ? "opacity-60" : ""}`}
                    style={{
                      backgroundColor: isEnabled
                        ? colors.chartBG
                        : savedColors.chartBG,
                    }}
                  ></div>
                  <span
                    className={isEnabled ? "text-gray-400" : "text-gray-600"}
                  >
                    Chart BG
                  </span>
                </div>
              </div>
            </div>

            <Card className="mt-3" variant="warning">
              <div className="flex items-start gap-2">
                <div className="i-heroicons:exclamation-triangle h-4 w-4 text-amber-400 mt-0.5 flex-shrink-0"></div>
                <div className="space-y-2">
                  <p className="text-xs text-amber-200">
                    <span className="font-medium">Important Notes:</span>
                  </p>
                  <ul className="text-xs text-amber-300/90 space-y-1 list-disc list-inside ml-2">
                    <li>Colors will not appear in the DEX preview mode</li>
                    <li>
                      After deployment, you may need to clear browser local
                      storage to see color changes
                    </li>
                    <li>
                      Disable this feature to use TradingView's default theme
                      colors
                    </li>
                  </ul>
                </div>
              </div>
            </Card>
          </div>
        </Card>
      )}
    </div>
  );
}
