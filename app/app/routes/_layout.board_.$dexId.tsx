import { useEffect, useState } from "react";
import { useParams, Link } from "@remix-run/react";
import { Helmet } from "react-helmet-async";
import { Icon } from "@iconify/react";
import { useTranslation } from "~/i18n";
import { apiClient } from "../utils/apiClient";
import { type TimePeriod, getTimePeriodString } from "../types/leaderboard";

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
  description?: string | null;
  banner?: string | null;
  logo?: string | null;
  tokenAddress?: string | null;
  tokenChain?: string | null;
  tokenSymbol?: string;
  tokenName?: string;
  tokenPrice?: number;
  tokenMarketCap?: number;
  tokenImageUrl?: string;
  telegramLink?: string | null;
  discordLink?: string | null;
  xLink?: string | null;
  websiteUrl?: string | null;
}

interface DailyStats {
  date: string;
  perp_volume: number;
  perp_taker_volume: number;
  perp_maker_volume: number;
  realized_pnl: number;
  broker_fee: number;
  total_fee: number;
}

export default function DexDetailRoute() {
  const { t } = useTranslation();
  const { dexId } = useParams();
  const [dexData, setDexData] = useState<BrokerStats | null>(null);
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("weekly");

  const fetchDexData = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient<{
        data: {
          dex: {
            id: string;
            brokerId: string;
            brokerName: string;
            primaryLogo: string | null;
            dexUrl: string | null;
            description: string | null;
            banner: string | null;
            logo: string | null;
            tokenAddress: string | null;
            tokenChain: string | null;
            telegramLink: string | null;
            discordLink: string | null;
            xLink: string | null;
            websiteUrl: string | null;
          };
          aggregated: BrokerStats;
          daily: Array<{
            date: string;
            perp_volume: number;
            perp_taker_volume: number;
            perp_maker_volume: number;
            realized_pnl: number;
            broker_fee: number;
            total_fee: number;
          }>;
        };
      }>({
        endpoint: `/api/leaderboard/broker/${dexId}?period=${timePeriod}`,
      });

      const dexData = {
        ...response.data.aggregated,
        id: response.data.dex.id,
        primaryLogo: response.data.dex.primaryLogo,
        dexUrl: response.data.dex.dexUrl,
        description: response.data.dex.description,
        banner: response.data.dex.banner,
        logo: response.data.dex.logo,
        tokenAddress: response.data.dex.tokenAddress,
        tokenChain: response.data.dex.tokenChain,
        telegramLink: response.data.dex.telegramLink,
        discordLink: response.data.dex.discordLink,
        xLink: response.data.dex.xLink,
        websiteUrl: response.data.dex.websiteUrl,
      };

      setDexData(dexData);
      setDailyStats(
        response.data.daily.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        )
      );
    } catch (err) {
      console.error("Error fetching DEX data:", err);
      setError(t("board.dexDetailErrorLoadFailed"));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDexData();
  }, [dexId, timePeriod]);

  const formatVolume = (num: number) => {
    if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
    return num.toFixed(2);
  };

  const formatFee = (num: number) => {
    if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
    return num.toFixed(2);
  };

  const formatPnl = (num: number) => {
    const isNegative = num < 0;
    const abs = Math.abs(num);
    const formatted = formatVolume(abs);
    return {
      value: isNegative ? `-$${formatted}` : `+$${formatted}`,
      isNegative,
    };
  };

  const getGeckoTerminalUrl = () => {
    if (!dexData?.tokenAddress || !dexData?.tokenChain) return null;

    const chainMapping: Record<string, string> = {
      ethereum: "eth",
      polygon: "polygon_pos",
      arbitrum: "arbitrum",
      base: "base",
      bsc: "bsc",
      near: "near",
      solana: "solana",
      avalanche: "avax",
    };

    const geckoChain =
      chainMapping[dexData.tokenChain.toLowerCase()] ||
      dexData.tokenChain.toLowerCase();

    return `https://www.geckoterminal.com/${geckoChain}/tokens/${dexData.tokenAddress}?embed=1&info=1&swaps=0&grayscale=0&light_chart=0&chart_type=market_cap&resolution=4h`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 pb-12 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <Icon
              icon="svg-spinners:pulse-rings-multiple"
              width={48}
              className="text-primary"
            />
            <span className="ml-3 text-lg text-gray-300">
              {t("board.dexDetailLoading")}
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !dexData) {
    return (
      <div className="min-h-screen pt-24 pb-12 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <Icon
              icon="heroicons:exclamation-triangle"
              width={48}
              className="text-error mx-auto mb-4"
            />
            <h2 className="text-2xl font-bold text-white mb-2">
              {t("board.dexDetailNotFoundTitle")}
            </h2>
            <p className="text-gray-400 mb-6">
              {error || t("board.dexDetailNotFoundDescription")}
            </p>
            <Link
              to="/board"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-light text-white font-medium rounded-lg transition-colors"
            >
              <Icon icon="heroicons:arrow-left" width={20} />
              {t("board.backToBoard")}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const pnlFormatted = formatPnl(dexData.totalPnl);
  const timePeriodString = getTimePeriodString(timePeriod);
  const geckoUrl = getGeckoTerminalUrl();

  const pageTitle = t("board.dexDetailPageTitle", {
    brokerName: dexData.brokerName,
  });
  const pageDescription = t("board.dexDetailPageDescription", {
    brokerName: dexData.brokerName,
  });

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 md:px-8">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
      </Helmet>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 slide-fade-in">
          <div className="flex items-center gap-4 mb-6">
            <Link
              to="/board"
              className="inline-flex items-center gap-2 px-4 py-2 bg-background-card hover:bg-primary/20 text-gray-300 hover:text-white rounded-lg transition-colors"
            >
              <Icon icon="heroicons:arrow-left" width={20} />
              {t("board.backToBoard")}
            </Link>
          </div>

          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* DEX Info */}
            <div className="flex items-center gap-4">
              {dexData.logo ? (
                <img
                  src={dexData.logo}
                  alt={`${dexData.brokerName} logo`}
                  className="w-16 h-16 object-cover rounded-full"
                />
              ) : dexData.primaryLogo ? (
                <img
                  src={dexData.primaryLogo}
                  alt={`${dexData.brokerName} logo`}
                  className="w-16 h-16 object-cover rounded-full"
                />
              ) : (
                <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">
                    {dexData.brokerName.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}

              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white">
                  {dexData.brokerName}
                </h1>
                {dexData.description && (
                  <p className="text-gray-300 mt-2 max-w-2xl">
                    {dexData.description}
                  </p>
                )}
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex gap-3 ml-auto">
              <a
                href={dexData.dexUrl || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-light text-white font-medium rounded-lg transition-colors"
              >
                <Icon icon="mdi:chart-line" width={20} />
                {t("board.visitDex")}
              </a>
              {dexData.websiteUrl && (
                <a
                  href={dexData.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors"
                >
                  <Icon icon="mdi:web" width={20} />
                  {t("board.website")}
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Banner Image */}
        {dexData.banner && (
          <div className="w-full max-h-32 lg:max-h-36 mb-4 h-fit slide-fade-in-delayed">
            <img
              src={dexData.banner}
              alt={`${dexData.brokerName} banner`}
              className="w-full h-full max-h-32 lg:max-h-36 object-contain"
            />
          </div>
        )}

        {/* Time Period Selector */}
        <div className="mb-8 slide-fade-in-delayed">
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-400">
              {t("board.timePeriodLabel")}
            </span>
            {(["daily", "weekly", "30d", "90d"] as TimePeriod[]).map(period => (
              <button
                key={period}
                onClick={() => setTimePeriod(period)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  timePeriod === period
                    ? "bg-primary text-white"
                    : "bg-background-card text-gray-300 hover:bg-primary/20 hover:text-white"
                }`}
              >
                {getTimePeriodString(period)}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 slide-fade-in-delayed">
          {/* Volume */}
          <div className="bg-background-card border border-gray-600 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                <Icon
                  icon="mdi:chart-line"
                  width={24}
                  className="text-primary"
                />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">
                  {t("board.volume")}
                </h3>
                <p className="text-sm text-gray-400">({timePeriodString})</p>
              </div>
            </div>
            <div className="text-2xl font-bold text-white">
              ${formatVolume(dexData.totalVolume)}
            </div>
          </div>

          {/* Fees */}
          <div className="bg-background-card border border-gray-600 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-secondary/20 rounded-lg flex items-center justify-center">
                <Icon
                  icon="mdi:currency-usd"
                  width={24}
                  className="text-secondary"
                />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">
                  {t("board.fees")}
                </h3>
                <p className="text-sm text-gray-400">({timePeriodString})</p>
              </div>
            </div>
            <div className="text-2xl font-bold text-white">
              ${formatFee(dexData.totalFee)}
            </div>
          </div>

          {/* Revenue */}
          <div className="bg-background-card border border-gray-600 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                <Icon
                  icon="mdi:cash-multiple"
                  width={24}
                  className="text-green-500"
                />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">
                  {t("board.revenue")}
                </h3>
                <p className="text-sm text-gray-400">({timePeriodString})</p>
              </div>
            </div>
            <div className="text-2xl font-bold text-white">
              ${formatFee(dexData.totalBrokerFee)}
            </div>
          </div>

          {/* PnL */}
          {/* <div className="bg-background-card border border-gray-600 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-success/20 rounded-lg flex items-center justify-center">
                <Icon
                  icon="mdi:trending-up"
                  width={24}
                  className="text-success"
                />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">PnL</h3>
                <p className="text-sm text-gray-400">({timePeriodString})</p>
              </div>
            </div>
            <div
              className={`text-2xl font-bold ${
                pnlFormatted.isNegative ? "text-error" : "text-success"
              }`}
            >
              {pnlFormatted.value}
            </div>
          </div> */}
        </div>

        {/* GeckoTerminal Chart */}
        {geckoUrl && (
          <div className="mb-8 slide-fade-in-delayed">
            <div className="bg-background-card border border-gray-600 rounded-lg py-3 px-1 md:p-3 lg:p-6">
              <div className="flex items-center gap-3 mb-4">
                <Icon
                  icon="mdi:chart-timeline-variant"
                  width={24}
                  className="text-primary"
                />
                <h3 className="text-xl font-semibold text-white">
                  {t("board.tokenInformation")}
                </h3>
              </div>
              <div className="aspect-[3/4] sm:aspect-square md:aspect-[4/3] bg-gray-800 rounded-lg overflow-hidden">
                <iframe
                  height="100%"
                  width="100%"
                  id="geckoterminal-embed"
                  title="GeckoTerminal Embed"
                  src={geckoUrl}
                  frameBorder="0"
                  allow="clipboard-write"
                  allowFullScreen
                />
              </div>
            </div>
          </div>
        )}

        {/* Social Links */}
        {(dexData.telegramLink || dexData.discordLink || dexData.xLink) && (
          <div className="mb-8 slide-fade-in-delayed">
            <div className="bg-background-card border border-gray-600 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-4">
                {t("board.socialLinks")}
              </h3>
              <div className="flex flex-wrap gap-4">
                {dexData.telegramLink && (
                  <a
                    href={dexData.telegramLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    <Icon icon="mdi:telegram" width={20} />
                    {t("board.telegram")}
                  </a>
                )}
                {dexData.discordLink && (
                  <a
                    href={dexData.discordLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                  >
                    <Icon icon="mdi:discord" width={20} />
                    {t("board.discord")}
                  </a>
                )}
                {dexData.xLink && (
                  <a
                    href={dexData.xLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 300 300.251"
                      fill="white"
                    >
                      <path d="M178.57 127.15L290.27 0h-26.46l-97.03 110.38L89.34 0H0l117.13 166.93L0 300.25h26.46l102.4-116.59 81.8 116.59H300M36.01 19.54h40.65l187.13 262.13h-40.66" />
                    </svg>
                    @{dexData.xLink.split("/").pop()}
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Daily Stats Table */}
        {dailyStats.length > 0 && (
          <div className="slide-fade-in-delayed">
            <div className="bg-background-card border border-gray-600 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-4">
                {t("board.dailyPerformance")}
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-600">
                      <th className="text-left py-3 px-2 text-gray-400">
                        {t("board.tableDate")}
                      </th>
                      <th className="text-right py-3 px-2 text-gray-400">
                        {t("board.tableVolume")}
                      </th>
                      <th className="text-right py-3 px-2 text-gray-400">
                        {t("board.tableFees")}
                      </th>
                      <th className="text-right py-3 px-2 text-gray-400">
                        {t("board.tableRevenue")}
                      </th>
                      {/* <th className="text-right py-3 px-2 text-gray-400">
                        PnL
                      </th> */}
                    </tr>
                  </thead>
                  <tbody>
                    {dailyStats.map((stat, index) => {
                      // const pnl = formatPnl(stat.realized_pnl);
                      return (
                        <tr
                          key={index}
                          className="border-b border-gray-700 last:border-b-0"
                        >
                          <td className="py-3 px-2 text-white">
                            {new Date(stat.date).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-2 text-right text-white">
                            ${formatVolume(stat.perp_volume)}
                          </td>
                          <td className="py-3 px-2 text-right text-white">
                            ${formatFee(stat.total_fee)}
                          </td>
                          <td className="py-3 px-2 text-right text-white">
                            ${formatFee(stat.broker_fee)}
                          </td>
                          {/* <td
                            className={`py-3 px-2 text-right font-medium ${
                              pnl.isNegative ? "text-error" : "text-success"
                            }`}
                          >
                            {pnl.value}
                          </td> */}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
