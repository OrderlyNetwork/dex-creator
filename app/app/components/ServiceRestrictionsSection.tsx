import { useState, useMemo } from "react";
import { useTranslation } from "~/i18n";
import FuzzySearchInput from "./FuzzySearchInput";
import { ALL_REGIONS } from "../utils/regions";

interface ServiceRestrictionsSectionProps {
  restrictedRegions: string;
  onRestrictedRegionsChange: (value: string) => void;
  whitelistedIps: string;
  onWhitelistedIpsChange: (value: string) => void;
}

export default function ServiceRestrictionsSection({
  restrictedRegions,
  onRestrictedRegionsChange,
}: ServiceRestrictionsSectionProps) {
  const { t } = useTranslation();
  const [regionSearchQuery, setRegionSearchQuery] = useState("");
  const [filteredRegions, setFilteredRegions] = useState<string[]>([]);

  const selectedRegions = useMemo(() => {
    if (!restrictedRegions) return [];
    return restrictedRegions
      .split(",")
      .map(r => r.trim())
      .filter(Boolean);
  }, [restrictedRegions]);

  const handleRegionSearch = (query: string) => {
    setRegionSearchQuery(query);
    if (!query.trim()) {
      setFilteredRegions([]);
      return;
    }

    const queryLower = query.toLowerCase();
    const filtered = ALL_REGIONS.filter(region =>
      region.toLowerCase().includes(queryLower)
    ).slice(0, 10);
    setFilteredRegions(filtered);
  };

  const handleSelectRegion = (region: string) => {
    if (selectedRegions.includes(region)) return;

    const newRegions = [...selectedRegions, region];
    onRestrictedRegionsChange(newRegions.join(","));
    setRegionSearchQuery("");
    setFilteredRegions([]);
  };

  const handleRemoveRegion = (region: string) => {
    const newRegions = selectedRegions.filter(r => r !== region);
    onRestrictedRegionsChange(newRegions.join(","));
  };

  return (
    <div
      className={`p-4 bg-background-dark/20 rounded-lg border border-light/10`}
    >
      <div>
        <label className={`block text-sm font-bold mb-2`}>
          {t("serviceRestrictionsSection.restrictedRegions")}
        </label>
        <p className="text-xs text-gray-400 mb-2">
          {t("serviceRestrictionsSection.restrictedRegionsDesc")}
        </p>

        <FuzzySearchInput
          placeholder={t("serviceRestrictionsSection.searchForRegion")}
          value={regionSearchQuery}
          onSearch={handleRegionSearch}
          className="mb-2"
          debounceTime={50}
        />

        {filteredRegions.length > 0 && (
          <div className="mt-2 border border-light/10 rounded-lg overflow-hidden max-h-48 overflow-y-auto">
            {filteredRegions.map(region => (
              <div
                key={region}
                className="p-2 hover:bg-primary-light/10 cursor-pointer border-b border-light/5 last:border-b-0"
                onClick={() => handleSelectRegion(region)}
              >
                <div className="text-sm">{region}</div>
              </div>
            ))}
          </div>
        )}

        {selectedRegions.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {selectedRegions.map(region => (
              <div
                key={region}
                className="flex items-center gap-1 px-2 py-1 bg-primary/20 rounded text-xs"
              >
                <span>{region}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveRegion(region)}
                  className="hover:text-error"
                >
                  <div className="i-mdi:close-circle h-4 w-4"></div>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
