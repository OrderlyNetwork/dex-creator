import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useTranslation, i18n } from "~/i18n";
import { get } from "../utils/apiClient";
import { Button } from "./Button";
import Pagination from "./Pagination";
import { generateDeploymentUrl } from "../utils/deploymentUrl";

const copyToClipboard = async (text: string, label: string) => {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(i18n.t("allDexesList.labelCopiedToClipboard", { label }));
  } catch (error) {
    console.error("Failed to copy to clipboard:", error);
    toast.error(i18n.t("allDexesList.failedToCopyLabel", { label }));
  }
};

interface Dex {
  id: string;
  brokerName: string;
  brokerId: string;
  repoUrl: string | null;
  customDomain?: string | null;
  customDomainOverride?: string | null;
  createdAt: string;
  themeCSS?: string | null;
  user: {
    address: string;
  };
}

interface DexesResponse {
  dexes: Dex[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
  };
}

interface AllDexesListProps {
  token: string;
  onCustomDomainOverrideUpdate: (
    dexId: string,
    domainOverride: string
  ) => Promise<void>;
  onRedeployment: (dexId: string, brokerName: string) => void;
  isUpdatingCustomDomainOverride: boolean;
  redeployingDexes: Set<string>;
}

export default function AllDexesList({
  token,
  onCustomDomainOverrideUpdate,
  onRedeployment,
  isUpdatingCustomDomainOverride,
  redeployingDexes,
}: AllDexesListProps) {
  const { t } = useTranslation();
  const [allDexes, setAllDexes] = useState<Dex[]>([]);
  const [loadingDexes, setLoadingDexes] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalDexes, setTotalDexes] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [expandedThemes, setExpandedThemes] = useState<Set<string>>(new Set());
  const [customDomainOverrideDexId, setCustomDomainOverrideDexId] =
    useState("");
  const [customDomainOverride, setCustomDomainOverride] = useState("");

  const toggleThemeVisibility = (dexId: string) => {
    setExpandedThemes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(dexId)) {
        newSet.delete(dexId);
      } else {
        newSet.add(dexId);
      }
      return newSet;
    });
  };

  const loadAllDexes = async (
    page?: number,
    size?: number,
    search?: string
  ) => {
    if (!token) {
      return;
    }

    const targetPage = page ?? currentPage;
    const targetSize = size ?? pageSize;
    const targetSearch = search ?? searchTerm;
    const isSearch = !!targetSearch;
    const isInitialLoad = targetPage === 1 && targetSearch === "";

    if (isSearch && !isInitialLoad) {
      setSearchLoading(true);
    } else {
      setLoadingDexes(true);
    }

    try {
      const offset = (targetPage - 1) * targetSize;
      const searchParam = targetSearch
        ? `&search=${encodeURIComponent(targetSearch)}`
        : "";
      const response = await get<DexesResponse>(
        `api/admin/dexes?limit=${targetSize}&offset=${offset}${searchParam}`,
        token
      );
      setAllDexes(response.dexes);
      setTotalDexes(response.pagination.total);
      setCurrentPage(targetPage);
      setPageSize(targetSize);
      setSearchTerm(targetSearch);
    } catch (error) {
      console.error("Error loading DEXs:", error);
      toast.error(t("allDexesList.failedToLoadDexes"));
    } finally {
      if (isSearch) {
        setSearchLoading(false);
      } else {
        setLoadingDexes(false);
      }
    }
  };

  const handleSearch = (query: string) => {
    setSearchInput(query);
  };

  useEffect(() => {
    if (!token) {
      return;
    }

    const timeoutId = setTimeout(() => {
      loadAllDexes(1, pageSize, searchTerm);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, pageSize, token]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setSearchTerm(searchInput);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchInput]);

  const handleCustomDomainOverride = async (
    dexId: string,
    domainOverride: string
  ) => {
    await onCustomDomainOverrideUpdate(dexId, domainOverride);
    await loadAllDexes();
  };

  return (
    <div className="bg-light/5 backdrop-blur-sm rounded-xl p-4 md:p-6 border border-light/10 md:col-span-2">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-medium">
          {t("allDexesList.browseAllDexes")}
        </h2>
        <button
          onClick={() => {
            loadAllDexes(currentPage, pageSize, searchTerm);
          }}
          disabled={loadingDexes}
          className="p-1 rounded hover:bg-dark/50"
          title={t("allDexesList.refreshDexList")}
        >
          <div
            className={`i-mdi:refresh h-5 w-5 ${loadingDexes ? "animate-spin" : ""} `}
          ></div>
        </button>
      </div>
      <p className="text-gray-400 text-sm mb-4">
        {t("allDexesList.comprehensiveListDesc")}
      </p>

      {/* Search Input */}
      <div className="mb-4">
        <div className="relative">
          <input
            type="text"
            placeholder={t("allDexesList.searchPlaceholder")}
            value={searchInput}
            onChange={e => handleSearch(e.target.value)}
            className="w-full bg-dark border border-light/20 rounded px-4 py-2 text-sm focus:border-primary-light outline-none placeholder:text-gray-500"
          />
          {searchInput && (
            <button
              onClick={() => handleSearch("")}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 p-1"
              title={t("allDexesList.clearSearch")}
            >
              <div className="i-mdi:close h-4 w-4"></div>
            </button>
          )}
        </div>
      </div>

      {loadingDexes ? (
        <div className="text-center py-4">
          <div className="i-svg-spinners:pulse-rings h-8 w-8 mx-auto text-primary-light mb-2"></div>
          <p className="text-sm text-gray-400">
            {t("allDexesList.loadingDexes")}
          </p>
        </div>
      ) : allDexes.length === 0 ? (
        <p className="text-gray-400 text-sm italic">
          {t("allDexesList.noDexesFound")}
        </p>
      ) : (
        <div className="relative space-y-4 max-h-[600px] overflow-y-auto">
          {/* Search Loading Overlay */}
          {searchLoading && (
            <div className="absolute inset-0 bg-dark/50 backdrop-blur-sm rounded-lg z-10 flex items-center justify-center min-h-[200px]">
              <div className="text-center p-4">
                <div className="i-svg-spinners:pulse-rings h-6 w-6 mx-auto text-primary-light mb-2"></div>
                <p className="text-xs text-gray-300">
                  {t("allDexesList.searching")}
                </p>
              </div>
            </div>
          )}
          {allDexes.map(dex => (
            <div
              key={dex.id}
              className="bg-dark/30 p-3 rounded-lg border border-light/10"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium text-primary-light">
                  {dex.brokerName || t("allDexesList.unnamedDex")} (ID:{" "}
                  {dex.id.substring(0, 8)}...)
                </h3>
                <button
                  onClick={() =>
                    copyToClipboard(dex.id, t("allDexesList.dexIdLabel"))
                  }
                  className="text-gray-400 hover:text-primary-light p-1 rounded"
                  title={t("allDexesList.copyDexId")}
                >
                  <div className="i-mdi:content-copy h-4 w-4"></div>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <strong>{t("allDexesList.brokerIdLabel")}:</strong>{" "}
                    {dex.brokerId}
                  </div>
                  <button
                    onClick={() =>
                      copyToClipboard(
                        dex.brokerId,
                        t("allDexesList.brokerIdLabel")
                      )
                    }
                    className="text-gray-400 hover:text-primary-light p-1 rounded ml-2"
                    title={t("allDexesList.copyBrokerId")}
                  >
                    <div className="i-mdi:content-copy h-3 w-3"></div>
                  </button>
                </div>

                {dex.repoUrl && (
                  <div className="md:col-span-2 flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <strong>{t("allDexesList.repoUrlHeading")}:</strong>{" "}
                      <a
                        href={dex.repoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-light hover:underline break-all"
                      >
                        {dex.repoUrl}
                      </a>
                    </div>
                    <button
                      onClick={() =>
                        copyToClipboard(
                          dex.repoUrl!,
                          t("allDexesList.repoUrlLabel")
                        )
                      }
                      className="text-gray-400 hover:text-primary-light p-1 rounded ml-2 flex-shrink-0"
                      title={t("allDexesList.copyRepoUrl")}
                    >
                      <div className="i-mdi:content-copy h-3 w-3"></div>
                    </button>
                  </div>
                )}

                {dex.customDomain && (
                  <div className="md:col-span-2 flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <strong>{t("allDexesList.customDomainHeading")}:</strong>{" "}
                      <a
                        href={`https://${dex.customDomain}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-warning hover:underline break-all"
                      >
                        {dex.customDomain}
                      </a>
                    </div>
                    <button
                      onClick={() =>
                        copyToClipboard(
                          `https://${dex.customDomain}`,
                          t("allDexesList.customDomainUrlLabel")
                        )
                      }
                      className="text-gray-400 hover:text-primary-light p-1 rounded ml-2 flex-shrink-0"
                      title={t("allDexesList.copyCustomDomainUrl")}
                    >
                      <div className="i-mdi:content-copy h-3 w-3"></div>
                    </button>
                  </div>
                )}

                {/* Custom Domain Override Section */}
                <div className="md:col-span-2">
                  <div className="flex items-center justify-between mb-2">
                    <strong className="text-xs">
                      {t("allDexesList.customDomainOverride")}:
                    </strong>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="example.com"
                        value={
                          customDomainOverrideDexId === dex.id
                            ? customDomainOverride
                            : dex.customDomainOverride || ""
                        }
                        onChange={e => {
                          if (customDomainOverrideDexId !== dex.id) {
                            setCustomDomainOverrideDexId(dex.id);
                            setCustomDomainOverride(
                              dex.customDomainOverride || ""
                            );
                          }
                          setCustomDomainOverride(e.target.value);
                        }}
                        className="text-xs bg-dark/50 border border-light/20 rounded px-2 py-1 text-white placeholder-gray-400 focus:border-primary focus:outline-none min-w-0 flex-1"
                        disabled={isUpdatingCustomDomainOverride}
                      />
                      <Button
                        onClick={() =>
                          handleCustomDomainOverride(
                            dex.id,
                            customDomainOverride
                          )
                        }
                        disabled={
                          isUpdatingCustomDomainOverride ||
                          customDomainOverrideDexId !== dex.id
                        }
                        variant="primary"
                        size="sm"
                        className="text-xs px-2 py-1 flex items-center gap-1"
                      >
                        {isUpdatingCustomDomainOverride &&
                        customDomainOverrideDexId === dex.id ? (
                          <>
                            <div className="i-svg-spinners:pulse-rings h-3 w-3"></div>
                            {t("allDexesList.updating")}
                          </>
                        ) : (
                          <>
                            <div className="i-mdi:check h-3 w-3"></div>
                            {t("allDexesList.update")}
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                  {dex.customDomainOverride && (
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <strong>{t("allDexesList.overrideUrlHeading")}:</strong>{" "}
                        <a
                          href={dex.customDomainOverride}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary-light hover:underline break-all"
                        >
                          {dex.customDomainOverride}
                        </a>
                      </div>
                      <button
                        onClick={() =>
                          copyToClipboard(
                            dex.customDomainOverride!,
                            t("allDexesList.overrideUrlLabel")
                          )
                        }
                        className="text-gray-400 hover:text-primary-light p-1 rounded ml-2 flex-shrink-0"
                        title={t("allDexesList.copyOverrideUrl")}
                      >
                        <div className="i-mdi:content-copy h-3 w-3"></div>
                      </button>
                    </div>
                  )}
                </div>

                {dex.repoUrl && (
                  <div className="md:col-span-2 flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <strong>{t("allDexesList.deploymentUrlHeading")}:</strong>{" "}
                      <a
                        href={generateDeploymentUrl(dex.repoUrl)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-success hover:underline break-all"
                      >
                        {generateDeploymentUrl(dex.repoUrl).replace(
                          "https://",
                          ""
                        )}
                      </a>
                    </div>
                    <button
                      onClick={() =>
                        copyToClipboard(
                          generateDeploymentUrl(dex.repoUrl!),
                          t("allDexesList.deploymentUrlLabel")
                        )
                      }
                      className="text-gray-400 hover:text-primary-light p-1 rounded ml-2 flex-shrink-0"
                      title={t("allDexesList.copyDeploymentUrl")}
                    >
                      <div className="i-mdi:content-copy h-3 w-3"></div>
                    </button>
                  </div>
                )}
              </div>

              {/* Redeployment Button - only show if DEX has a repository */}
              {dex.repoUrl && (
                <div className="mt-3 pt-3 border-t border-light/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <strong className="text-xs">
                        {t("allDexesList.actions")}:
                      </strong>
                    </div>
                    <Button
                      onClick={() => onRedeployment(dex.id, dex.brokerName)}
                      disabled={redeployingDexes.has(dex.id)}
                      variant="primary"
                      size="sm"
                      className="text-xs px-3 py-1 flex items-center gap-2"
                    >
                      {redeployingDexes.has(dex.id) ? (
                        <>
                          <div className="i-svg-spinners:pulse-rings h-3 w-3"></div>
                          {t("allDexesList.deploying")}
                        </>
                      ) : (
                        <>
                          <div className="i-mdi:rocket-launch h-3 w-3"></div>
                          {t("allDexesList.redeploy")}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {/* Theme Section */}
              {dex.themeCSS && (
                <div className="mt-3 pt-3 border-t border-light/10">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <strong className="text-xs">
                        {t("allDexesList.cssTheme")}:
                      </strong>
                      <button
                        onClick={() => toggleThemeVisibility(dex.id)}
                        className="text-gray-400 hover:text-primary-light p-1 rounded"
                        title={
                          expandedThemes.has(dex.id)
                            ? t("allDexesList.hideTheme")
                            : t("allDexesList.showTheme")
                        }
                      >
                        <div
                          className={`h-3 w-3 transition-transform ${
                            expandedThemes.has(dex.id)
                              ? "i-mdi:chevron-up"
                              : "i-mdi:chevron-down"
                          }`}
                        ></div>
                      </button>
                    </div>
                    <button
                      onClick={() =>
                        copyToClipboard(
                          dex.themeCSS!,
                          t("allDexesList.cssThemeLabel")
                        )
                      }
                      className="text-gray-400 hover:text-primary-light p-1 rounded"
                      title={t("allDexesList.copyCssTheme")}
                    >
                      <div className="i-mdi:content-copy h-3 w-3"></div>
                    </button>
                  </div>

                  {expandedThemes.has(dex.id) && (
                    <div className="bg-dark/50 rounded p-2 max-h-40 overflow-y-auto">
                      <pre className="text-xs text-gray-300 whitespace-pre-wrap break-all">
                        {dex.themeCSS}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {!loadingDexes && allDexes.length > 0 && (
        <Pagination
          currentPage={currentPage}
          pageSize={pageSize}
          totalItems={totalDexes}
          onPageChange={page => loadAllDexes(page, pageSize, searchTerm)}
          onPageSizeChange={size => loadAllDexes(1, size, searchTerm)}
          itemName={t("allDexesList.itemName")}
        />
      )}
    </div>
  );
}
