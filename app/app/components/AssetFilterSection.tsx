import React, { useState, useEffect, useMemo } from "react";
import { useTranslation } from "~/i18n";
import { getBaseUrl } from "../utils/orderly";

interface AssetInfo {
  symbol: string;
  "24h_volume": number | string;
  "24h_amount": number;
  index_price: number;
  mark_price: number;
}

interface AssetFilterSectionProps {
  symbolList: string;
  onSymbolListChange: (symbolList: string) => void;
}

const getBaseSymbol = (symbol: string): string => {
  const parts = symbol.split("_");
  if (parts.length >= 3 && parts[0] === "PERP") {
    return parts.slice(1, -1).join("_");
  }
  return symbol;
};

const getSymbolLogoUrl = (symbol: string): string => {
  const baseSymbol = getBaseSymbol(symbol);
  return `https://oss.orderly.network/static/symbol_logo/${baseSymbol}.png`;
};

const formatVolume = (volume: number | string): string => {
  const num = typeof volume === "string" ? parseFloat(volume) : volume;
  if (isNaN(num) || num === 0) return "N/A";
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 2,
    style: "currency",
    currency: "USD",
  }).format(num);
};

const formatPrice = (price: number | undefined): string => {
  if (!price) return "N/A";
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
    style: "currency",
    currency: "USD",
  }).format(price);
};

const AssetFilterSection: React.FC<AssetFilterSectionProps> = ({
  symbolList,
  onSymbolListChange,
}) => {
  const { t } = useTranslation();
  const [availableAssets, setAvailableAssets] = useState<AssetInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSymbols, setSelectedSymbols] = useState<string[]>([]);

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${getBaseUrl()}/v1/public/futures`);
        const data = await response.json();
        if (data.success && data.data?.rows) {
          const sorted = [...data.data.rows].sort((a, b) => {
            const volumeA =
              typeof a["24h_volume"] === "number" ? a["24h_volume"] : 0;
            const volumeB =
              typeof b["24h_volume"] === "number" ? b["24h_volume"] : 0;
            const priceA = a.index_price || 0;
            const priceB = b.index_price || 0;
            const usdVolumeA = volumeA * priceA;
            const usdVolumeB = volumeB * priceB;
            return usdVolumeB - usdVolumeA;
          });
          setAvailableAssets(sorted);
        }
      } catch (error) {
        console.error("Error fetching assets:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAssets();
  }, []);

  useEffect(() => {
    if (symbolList && symbolList.trim() !== "") {
      setSelectedSymbols(
        symbolList
          .split(",")
          .map(s => s.trim())
          .filter(s => s.length > 0)
      );
    } else {
      setSelectedSymbols([]);
    }
  }, [symbolList]);

  const filteredAssets = useMemo(() => {
    if (!searchQuery.trim()) {
      return availableAssets;
    }
    const query = searchQuery.toLowerCase();
    return availableAssets.filter(asset => {
      const baseSymbol = getBaseSymbol(asset.symbol);
      return (
        asset.symbol.toLowerCase().includes(query) ||
        baseSymbol.toLowerCase().includes(query)
      );
    });
  }, [availableAssets, searchQuery]);

  const handleToggleSymbol = (symbol: string) => {
    const newSelected = selectedSymbols.includes(symbol)
      ? selectedSymbols.filter(s => s !== symbol)
      : [...selectedSymbols, symbol];
    setSelectedSymbols(newSelected);
    onSymbolListChange(newSelected.join(","));
  };

  const handleSelectAll = () => {
    const allSymbols = filteredAssets.map(asset => asset.symbol);
    const newSelected = [...new Set([...selectedSymbols, ...allSymbols])];
    setSelectedSymbols(newSelected);
    onSymbolListChange(newSelected.join(","));
  };

  const handleClearAll = () => {
    const remaining = selectedSymbols.filter(
      s => !filteredAssets.some(asset => asset.symbol === s)
    );
    setSelectedSymbols(remaining);
    onSymbolListChange(remaining.join(","));
  };

  const handleClearFilter = () => {
    setSelectedSymbols([]);
    onSymbolListChange("");
  };

  if (loading) {
    return (
      <div className="text-center py-8 text-gray-400">
        {t("assetFilterSection.loadingAssets")}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h4 className="text-base font-bold mb-1">
            {t("assetFilterSection.title")}
          </h4>
          <p className="text-xs text-gray-400">
            {t("assetFilterSection.description")}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleClearFilter}
            className="text-xs px-3 py-1 bg-gray-500/20 hover:bg-gray-500/30 text-gray-300 rounded-full transition-all duration-200 ease-in-out"
          >
            {t("assetFilterSection.clearFilter")}
          </button>
        </div>
      </div>

      {selectedSymbols.length === 0 && (
        <div className="text-center py-4 px-2 text-sm bg-blue-500/10 border border-blue-500/20 rounded-lg slide-fade-in">
          <div className="text-blue-300 font-medium mb-1">
            {t("assetFilterSection.allAssetsMode")}
          </div>
          <div className="text-gray-400 text-xs leading-relaxed">
            {t("assetFilterSection.noSpecificAssetsDesc")}
            <strong>{t("assetFilterSection.allAvailableTradingPairs")}</strong>
            {t("assetFilterSection.fromOrderlyNetwork")}
          </div>
        </div>
      )}

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h5 className="text-sm font-semibold text-white">
            {t("assetFilterSection.availableAssetsCount", {
              count: availableAssets.length,
            })}
          </h5>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleSelectAll}
              className="text-xs px-3 py-1 bg-primary/20 hover:bg-primary/30 text-primary-light rounded-full transition-all duration-200 ease-in-out"
            >
              {t("assetFilterSection.selectAllFiltered")}
            </button>
            <button
              type="button"
              onClick={handleClearAll}
              className="text-xs px-3 py-1 bg-gray-500/20 hover:bg-gray-500/30 text-gray-300 rounded-full transition-all duration-200 ease-in-out"
            >
              {t("assetFilterSection.clearFiltered")}
            </button>
          </div>
        </div>

        <div className="mb-3">
          <input
            type="text"
            placeholder={t("assetFilterSection.searchPlaceholder")}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 bg-background-card border border-light/10 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        <div className="max-h-96 overflow-y-auto">
          {filteredAssets.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">
              {t("assetFilterSection.noAssetsMatching", {
                searchQuery,
              })}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
              {filteredAssets.map(asset => {
                const isSelected = selectedSymbols.includes(asset.symbol);
                const baseSymbol = getBaseSymbol(asset.symbol);
                return (
                  <label
                    key={asset.symbol}
                    className={`relative flex flex-col items-center p-2 rounded-lg border cursor-pointer transition-all duration-200 ease-in-out ${
                      isSelected
                        ? "border-primary/50 bg-primary/10 hover:bg-primary/15"
                        : "border-light/10 bg-light/5 hover:bg-light/10"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleSymbol(asset.symbol)}
                      className="sr-only"
                    />
                    <div
                      className={`absolute top-2 right-2 w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 pointer-events-none ${
                        isSelected
                          ? "bg-primary border-primary shadow-lg shadow-primary/20"
                          : "bg-background-dark/50 border-light/30"
                      }`}
                    >
                      {isSelected && (
                        <svg
                          className="w-3 h-3 text-white"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2.5"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path d="M5 13l4 4L19 7"></path>
                        </svg>
                      )}
                    </div>
                    <img
                      src={getSymbolLogoUrl(asset.symbol)}
                      alt={baseSymbol}
                      className="w-8 h-8 rounded-full mb-1.5"
                      onError={e => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                    <div className="font-medium text-xs text-white font-mono text-center truncate w-full">
                      {baseSymbol}
                    </div>
                    <div className="text-[10px] text-gray-400 text-center mt-0.5 truncate w-full">
                      {formatPrice(asset.index_price)}
                    </div>
                    <div className="text-[10px] text-gray-500 text-center mt-0.5 truncate w-full">
                      {t("assetFilterSection.vol")}
                      {": "}
                      {formatVolume(
                        (typeof asset["24h_volume"] === "number"
                          ? asset["24h_volume"]
                          : parseFloat(asset["24h_volume"])) *
                          (asset.index_price || 0)
                      )}
                    </div>
                  </label>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssetFilterSection;
