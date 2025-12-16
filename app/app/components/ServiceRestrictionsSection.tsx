import { useState, useMemo } from "react";
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
  whitelistedIps,
  onWhitelistedIpsChange,
}: ServiceRestrictionsSectionProps) {
  const [regionSearchQuery, setRegionSearchQuery] = useState("");
  const [filteredRegions, setFilteredRegions] = useState<string[]>([]);
  // const [ipInput, setIpInput] = useState("");
  // const [ipError, setIpError] = useState<string | null>(null);

  const selectedRegions = useMemo(() => {
    if (!restrictedRegions) return [];
    return restrictedRegions
      .split(",")
      .map(r => r.trim())
      .filter(Boolean);
  }, [restrictedRegions]);

  // const whitelistedIpRanges = useMemo(() => {
  //   if (!whitelistedIps) return [];
  //   return whitelistedIps
  //     .split(",")
  //     .map(ip => ip.trim())
  //     .filter(Boolean);
  // }, [whitelistedIps]);

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

  // const validateIpRange = (ipRange: string): string | null => {
  //   if (!ipRange.trim()) return null;

  //   const trimmed = ipRange.trim();
  //   const cidrPattern = /^(\d{1,3}\.){3}\d{1,3}(\/\d{1,2})?$/;
  //   const singleIpPattern = /^(\d{1,3}\.){3}\d{1,3}$/;

  //   if (!cidrPattern.test(trimmed) && !singleIpPattern.test(trimmed)) {
  //     return "Invalid IP range format. Use CIDR notation (e.g., 192.168.1.0/24) or single IP";
  //   }

  //   try {
  //     const testIp = trimmed.includes("/") ? trimmed.split("/")[0] : trimmed;
  //     const testRange = trimmed.includes("/") ? trimmed : `${trimmed}/32`;
  //     if (!ipRangeCheck(testIp, testRange)) {
  //       return "Invalid IP range";
  //     }
  //   } catch {
  //     return "Invalid IP range format";
  //   }

  //   return null;
  // };

  // const handleAddIpRange = () => {
  //   if (!ipInput.trim()) return;

  //   const error = validateIpRange(ipInput);
  //   if (error) {
  //     setIpError(error);
  //     return;
  //   }

  //   const trimmed = ipInput.trim();
  //   if (whitelistedIpRanges.includes(trimmed)) {
  //     setIpError("This IP range is already whitelisted");
  //     return;
  //   }

  //   const newIps = [...whitelistedIpRanges, trimmed];
  //   onWhitelistedIpsChange(newIps.join(","));
  //   setIpInput("");
  //   setIpError(null);
  // };

  // const handleRemoveIpRange = (ipRange: string) => {
  //   const newIps = whitelistedIpRanges.filter(ip => ip !== ipRange);
  //   onWhitelistedIpsChange(newIps.join(","));
  // };

  return (
    <div
      className={`p-4 bg-background-dark/20 rounded-lg border border-light/10`}
    >
      <div>
        <label className={`block text-sm font-bold mb-2`}>
          Restricted Regions
        </label>
        <p className="text-xs text-gray-400 mb-2">
          Select regions that should be restricted from accessing your DEX.
        </p>

        <FuzzySearchInput
          placeholder="Search for a region..."
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

      {/* <div>
              <label className={`block text-sm font-medium mb-2`}>
                Whitelisted IP Ranges
              </label>
              <p className="text-xs text-gray-400 mb-2">
                Add IP ranges (CIDR notation) that should bypass region
                restrictions. Example: 192.168.1.0/24 or 10.0.0.1/32
              </p>

              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={ipInput}
                  onChange={e => {
                    setIpInput(e.target.value);
                    setIpError(null);
                  }}
                  onKeyDown={e => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddIpRange();
                    }
                  }}
                  placeholder="192.168.1.0/24"
                  className="flex-1 bg-dark rounded px-4 py-2 text-sm border border-light/10 focus:border-primary-light outline-none placeholder:text-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <button
                  type="button"
                  onClick={handleAddIpRange}
                  className="px-4 py-2 bg-primary/20 hover:bg-primary/30 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add
                </button>
              </div>

              {ipError && (
                <div className="text-xs text-error mb-2 flex items-center">
                  <span className="i-mdi:alert-circle mr-1"></span>
                  {ipError}
                </div>
              )}

              {whitelistedIpRanges.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {whitelistedIpRanges.map(ipRange => (
                    <div
                      key={ipRange}
                      className="flex items-center gap-1 px-2 py-1 bg-success/20 rounded text-xs"
                    >
                      <span className="font-mono">{ipRange}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveIpRange(ipRange)}
                        className="hover:text-error"
                      >
                        <div className="i-mdi:close-circle h-4 w-4"></div>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div> */}
    </div>
  );
}
