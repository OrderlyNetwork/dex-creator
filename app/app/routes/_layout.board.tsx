import { useEffect, useMemo, useState } from "react";
import type { MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";
import { Icon } from "@iconify/react";
import { i18n, useTranslation } from "~/i18n";
import { apiClient } from "../utils/apiClient";
import DexCard from "../components/DexCard";
import Pagination from "../components/Pagination";
import type { TimePeriod } from "../types/leaderboard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/select";

export const meta: MetaFunction = () => [
  { title: "Leaderboard - Orderly One" },
  {
    name: "description",
    content:
      "Discover top performing DEXs built on Orderly Network. View trading volume, PnL, and broker fees across all platforms.",
  },
];

interface BrokerStats {
  id: string;
  brokerId: string;
  brokerName: string;
  primaryLogo: string | null;
  dexUrl: string | null;
  totalVolume: number;
  totalPnl: number;
  totalBrokerFee: number;
  totalFee: number;
  lastUpdated: string;
  description?: string;
  banner?: string;
  logo?: string;
  tokenAddress?: string;
  tokenChain?: string;
  tokenSymbol?: string;
  tokenName?: string;
  tokenPrice?: number;
  tokenMarketCap?: number;
  tokenImageUrl?: string;
  telegramLink?: string;
  discordLink?: string;
  xLink?: string;
  websiteUrl?: string;
}

interface LeaderboardResponse {
  data: BrokerStats[];
  meta: {
    sortBy: string;
    period: string;
    limit: number;
    offset: number;
    total: number;
  };
}

interface DexStats {
  total: {
    allTime: number;
    new: number;
  };
  graduated: {
    allTime: number;
    new: number;
  };
  demo: {
    allTime: number;
    new: number;
  };
  period: string;
}

type SortOption = "volume" | "pnl" | "fee";

const filterTabs = ["volume", "fee"];

export default function BoardRoute() {
  const { t } = useTranslation();
  const [leaderboard, setLeaderboard] = useState<BrokerStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>("volume");
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("30d");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);
  const [totalItems, setTotalItems] = useState(0);
  const [dexStats, setDexStats] = useState<DexStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  const periods = useMemo(() => {
    return [
      { label: t("board.period.daily"), value: "daily" },
      { label: t("board.period.weekly"), value: "weekly" },
      { label: t("board.period.30d"), value: "30d" },
      { label: t("board.period.90d"), value: "90d" },
    ];
  }, [t]);

  const fetchLeaderboard = async (
    sort: SortOption = "volume",
    period: TimePeriod = "30d",
    page: number = 1
  ) => {
    try {
      setIsLoading(true);
      const offset = (page - 1) * pageSize;
      const data = await apiClient<LeaderboardResponse>({
        endpoint: `/api/leaderboard?sort=${sort}&period=${period}&limit=${pageSize}&offset=${offset}`,
        method: "GET",
        showToastOnError: false,
      });

      setLeaderboard(data.data);
      setTotalItems(data.meta.total);
      setCurrentPage(page);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t("board.errorFetchFailed")
      );
      console.error("Error fetching leaderboard:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDexStats = async (period: TimePeriod = "30d") => {
    try {
      setStatsLoading(true);
      const stats = await apiClient<DexStats>({
        endpoint: `/api/stats?period=${period}`,
        method: "GET",
        showToastOnError: false,
      });
      setDexStats(stats);
    } catch (err) {
      console.error("Error fetching DEX stats:", err);
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard(sortBy, timePeriod, 1);
    fetchDexStats(timePeriod);
  }, [sortBy, timePeriod]);

  const handleSortChange = (newSort: SortOption) => {
    setSortBy(newSort);
    setCurrentPage(1);
  };

  const handleTimePeriodChange = (newPeriod: TimePeriod) => {
    setTimePeriod(newPeriod);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    fetchLeaderboard(sortBy, timePeriod, page);
  };

  const getSortLabel = (sort: SortOption) => {
    switch (sort) {
      case "volume":
        return t("board.sortVolume");
      case "pnl":
        return t("board.sortPnl");
      case "fee":
        return t("board.fees");
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 slide-fade-in">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            {t("board.title")}
          </h1>
          <p className="text-gray-300 text-lg md:text-xl mb-6">
            {t("board.subtitle")}
          </p>
        </div>

        {/* DEX Stats */}
        {dexStats && (
          <div className="mb-6 slide-fade-in-delayed">
            <div className="flex justify-center gap-6">
              <div className="bg-background-card rounded-lg border border-light/10 px-4 py-3 text-center">
                <div className="text-lg font-bold text-primary-light mb-1">
                  {statsLoading ? (
                    <Icon
                      icon="svg-spinners:pulse-rings-multiple"
                      width={16}
                      className="mx-auto"
                    />
                  ) : (
                    dexStats.total.allTime.toLocaleString()
                  )}
                </div>
                <div className="text-xs text-gray-300 mb-1">
                  {t("board.statsTotalDexs")}
                </div>
                <div className="text-xs text-primary-light">
                  +{dexStats.total.new.toLocaleString()}{" "}
                  {t("board.statsNewSuffix", { period: dexStats.period })}
                </div>
              </div>
              <div className="bg-background-card rounded-lg border border-light/10 px-4 py-3 text-center">
                <div className="text-lg font-bold text-green-400 mb-1">
                  {statsLoading ? (
                    <Icon
                      icon="svg-spinners:pulse-rings-multiple"
                      width={16}
                      className="mx-auto"
                    />
                  ) : (
                    dexStats.graduated.allTime.toLocaleString()
                  )}
                </div>
                <div className="text-xs text-gray-300 mb-1">
                  {t("board.statsGraduated")}
                </div>
                <div className="text-xs text-green-400/70">
                  +{dexStats.graduated.new.toLocaleString()}{" "}
                  {t("board.statsNewSuffix", { period: dexStats.period })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sort Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 slide-fade-in-delayed">
          <div className="flex flex-wrap gap-2">
            {(filterTabs as SortOption[]).map(sort => (
              <button
                key={sort}
                onClick={() => handleSortChange(sort)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  sortBy === sort
                    ? "bg-primary text-white"
                    : "bg-background-card text-gray-300 hover:bg-primary/20 hover:text-white"
                }`}
              >
                {getSortLabel(sort)}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {/* Time Period Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-300">
                {t("common.period")}:
              </span>
              {/* <select
                value={timePeriod}
                onChange={e =>
                  handleTimePeriodChange(e.target.value as TimePeriod)
                }
                className="px-3 py-2 bg-background-card border border-light/10 rounded-lg text-white text-sm focus:outline-none focus:border-primary transition-colors duration-200"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="30d">30 Days</option>
                <option value="90d">90 Days</option>
              </select> */}
              <Select
                value={timePeriod}
                onValueChange={value =>
                  handleTimePeriodChange(value as TimePeriod)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {periods.map(period => (
                    <SelectItem key={period.value} value={period.value}>
                      {period.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <button
              onClick={() => fetchLeaderboard(sortBy, timePeriod)}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-background-card hover:bg-primary/20 text-gray-300 hover:text-white rounded-full transition-all duration-200 disabled:opacity-50"
            >
              <Icon
                icon={
                  isLoading
                    ? "svg-spinners:pulse-rings-multiple"
                    : "heroicons:arrow-path"
                }
                width={16}
              />
              {t("common.refresh")}
            </button>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="text-center py-8 slide-fade-in">
            <div className="bg-error/10 border border-error/20 rounded-lg p-6 max-w-md mx-auto">
              <Icon
                icon="heroicons:exclamation-triangle"
                width={24}
                className="text-error mx-auto mb-3"
              />
              <p className="text-error font-medium mb-2">
                {t("board.errorLoadFailed")}
              </p>
              <p className="text-gray-400 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12 slide-fade-in">
            <Icon
              icon="svg-spinners:pulse-rings-multiple"
              width={48}
              className="text-primary mx-auto mb-4"
            />
            <p className="text-gray-300">{t("board.loading")}</p>
          </div>
        )}

        {!isLoading && leaderboard.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 slide-fade-in items-stretch">
            {leaderboard.map((broker, index) => {
              const globalRank = (currentPage - 1) * pageSize + index;
              return (
                <Link
                  key={broker.brokerId}
                  to={`/board/${broker.brokerId}`}
                  className="staggered-item block h-full"
                  style={{
                    animation: `slideFadeIn 0.25s ease ${index * 0.05}s forwards`,
                  }}
                >
                  <DexCard
                    broker={broker}
                    rank={globalRank}
                    timePeriod={timePeriod}
                  />
                </Link>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {!isLoading && leaderboard.length > 0 && (
          <Pagination
            currentPage={currentPage}
            pageSize={pageSize}
            totalItems={totalItems}
            onPageChange={handlePageChange}
            itemName={t("common.dexs")}
            showPageSizeSelector={false}
          />
        )}

        {/* Empty State */}
        {!isLoading && leaderboard.length === 0 && !error && (
          <div className="text-center py-12 slide-fade-in">
            <Icon
              icon="heroicons:chart-bar"
              width={48}
              className="text-gray-500 mx-auto mb-4"
            />
            <p className="text-gray-300 text-lg mb-2">
              {t("board.emptyTitle")}
            </p>
            <p className="text-gray-400">{t("board.emptyDescription")}</p>
          </div>
        )}

        {/* Info Section */}
        <div className="mt-12 bg-background-card rounded-lg border border-light/10 p-6 slide-fade-in">
          <h3 className="text-lg font-semibold text-white mb-4">
            {t("board.aboutTitle")}
          </h3>
          <div className="grid md:grid-cols-2 gap-6 text-sm text-gray-300">
            <div>
              <h4 className="font-medium text-white mb-2 underline">
                {t("common.howItWorks")}
              </h4>
              <p>{t("board.aboutHowItWorksDescription")}</p>
            </div>
            <div>
              <h4 className="font-medium text-white mb-2 underline">
                {t("board.aboutMetricsExplained")}
              </h4>
              <ul className="space-y-1">
                <li>
                  <strong>{t("board.aboutVolumeLabel")}</strong>{" "}
                  {t("board.aboutVolumeDescription")}
                </li>
                <li>
                  <strong>{t("board.aboutFeesLabel")}</strong>{" "}
                  {t("board.aboutFeesDescription")}
                </li>
                {/* <li>
                  <strong>PnL:</strong> Realized profit and loss across all
                  traders
                </li> */}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
