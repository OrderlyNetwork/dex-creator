import { type TimePeriod, getTimePeriodString } from "../types/leaderboard";

interface DexCardProps {
  broker: {
    id: string;
    brokerId: string;
    brokerName: string;
    dexUrl: string | null;
    totalVolume?: number;
    totalPnl?: number;
    totalBrokerFee?: number;
    totalFee?: number;
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
  };
  rank?: number;
  timePeriod?: TimePeriod;
}

const sanitizeHref = (rawUrl: string | null | undefined): string => {
  if (!rawUrl) return "#";

  try {
    let url: URL;

    // Try parsing as absolute URL first
    try {
      url = new URL(rawUrl);
    } catch {
      // Fallback: treat as relative URL in browser environments
      if (typeof window === "undefined") {
        return "#";
      }
      url = new URL(rawUrl, window.location.origin);
    }

    const allowedProtocols = new Set(["http:", "https:"]);
    if (!allowedProtocols.has(url.protocol)) {
      return "#";
    }

    return url.toString();
  } catch {
    return "#";
  }
};

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

const getRankIcon = (index: number) => {
  switch (index) {
    case 0:
      return "🥇";
    case 1:
      return "🥈";
    case 2:
      return "🥉";
    default:
      return `#${index + 1}`;
  }
};

export default function DexCard({ broker, rank, timePeriod }: DexCardProps) {
  // const pnlFormatted = broker.totalPnl ? formatPnl(broker.totalPnl) : null;
  const timePeriodString = timePeriod ? getTimePeriodString(timePeriod) : null;

  return (
    <div className="bg-gray-800 border border-gray-600 rounded-lg overflow-hidden transition-transform duration-200 hover:scale-105 hover:shadow-lg hover:shadow-primary/20 flex flex-col h-full">
      {/* Banner at the top */}
      {broker.banner && (
        <div className="w-full max-h-32 bg-gray-700 h-fit">
          <img
            src={broker.banner}
            alt="Banner preview"
            className="w-full h-full max-h-32 object-contain"
          />
        </div>
      )}

      {/* Card content */}
      <div className="p-4 flex flex-col flex-1 justify-between">
        {/* Top Section - Header and Description */}
        <div>
          <div className="flex items-start gap-3">
            {/* Logo */}
            {broker.logo ? (
              <img
                src={broker.logo}
                alt="Logo preview"
                className="w-12 h-12 object-cover rounded-full flex-shrink-0"
              />
            ) : (
              <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-white">
                  {broker.brokerName.charAt(0).toUpperCase()}
                </span>
              </div>
            )}

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                {rank !== undefined && (
                  <span className="text-sm font-semibold text-white">
                    {getRankIcon(rank)}
                  </span>
                )}
                <h4 className="font-bold text-lg text-white">
                  {broker.brokerName}
                </h4>
              </div>

              {broker.description && (
                <p className="text-sm text-gray-300 mt-1 line-clamp-2">
                  {broker.description}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Middle Section - Stats */}
        <div className="my-4">
          {/* Stats - only show if we have volume/PnL data */}
          {broker.totalVolume !== undefined &&
            broker.totalPnl !== undefined &&
            timePeriodString && (
              <div className="flex flex-wrap gap-3">
                <div className="flex-1">
                  <div className="text-xs text-gray-400">
                    Volume ({timePeriodString})
                  </div>
                  <div className="font-medium text-white">
                    ${formatVolume(broker.totalVolume)}
                  </div>
                </div>
                {broker.totalFee !== undefined && (
                  <div className="flex-1">
                    <div className="text-xs text-gray-400">
                      Fees ({timePeriodString})
                    </div>
                    <div className="font-medium text-white">
                      ${formatFee(broker.totalFee)}
                    </div>
                  </div>
                )}
                {/* <div className="flex-1">
                  <div className="text-xs text-gray-400">
                    PnL ({timePeriodString})
                  </div>
                  <div
                    className={`font-medium ${
                      pnlFormatted?.isNegative ? "text-error" : "text-success"
                    }`}
                  >
                    {pnlFormatted?.value}
                  </div>
                </div> */}
              </div>
            )}
        </div>

        {/* Bottom Section - Buttons, Social Links, and Token Info */}
        <div className="space-y-3">
          {/* CTA Buttons */}
          <div className="flex gap-2">
            {/* DEX Link CTA Button */}
            <a
              href={sanitizeHref(broker.dexUrl)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              className="inline-flex items-center justify-center gap-2 p-2 bg-primary hover:bg-primary-light text-white text-sm font-medium rounded-lg transition-colors flex-1"
            >
              <div className="i-mdi:chart-line min-h-4 min-w-4"></div>
              Visit DEX
            </a>

            {/* Website Link CTA Button */}
            {broker.websiteUrl && (
              <a
                href={sanitizeHref(broker.websiteUrl)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={e => e.stopPropagation()}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium rounded-lg transition-colors flex-1 justify-center"
              >
                <div className="i-mdi:web min-h-4 min-w-4"></div>
                Website
              </a>
            )}
          </div>

          {/* Social Media Links */}
          {(broker.telegramLink || broker.discordLink || broker.xLink) && (
            <div className="flex items-center gap-3">
              {broker.telegramLink && (
                <a
                  href={broker.telegramLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={e => e.stopPropagation()}
                  className="text-gray-400 hover:text-primary transition-colors"
                  title="Telegram"
                >
                  <div className="i-mdi:telegram h-5 w-5"></div>
                </a>
              )}
              {broker.discordLink && (
                <a
                  href={broker.discordLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={e => e.stopPropagation()}
                  className="text-gray-400 hover:text-primary transition-colors"
                  title="Discord"
                >
                  <div className="i-mdi:discord h-5 w-5"></div>
                </a>
              )}
              {broker.xLink && (
                <a
                  href={broker.xLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={e => e.stopPropagation()}
                  className="text-gray-400 hover:text-primary transition-colors"
                  title="X (Twitter)"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 16 17"
                    fill="currentColor"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M12.2174 2.20898H14.4663L9.55298 7.82465L15.3332 15.4663H10.8073L7.26253 10.8317L3.20647 15.4663H0.956125L6.21146 9.45971L0.666504 2.20898H5.30724L8.51143 6.44521L12.2174 2.20898ZM11.428 14.1202H12.6742L4.6301 3.48441H3.29281L11.428 14.1202Z"></path>
                  </svg>
                </a>
              )}
            </div>
          )}

          {/* Token Information */}
          {broker.tokenSymbol && broker.tokenPrice && (
            <div className="p-3 bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-lg border border-gray-600">
              <div className="flex items-center gap-3">
                {broker.tokenImageUrl && (
                  <img
                    src={broker.tokenImageUrl}
                    alt={broker.tokenName || broker.tokenSymbol}
                    className="w-8 h-8 rounded-full"
                  />
                )}
                <div className="flex-1">
                  <div className="text-sm text-gray-300">
                    Token: ${broker.tokenSymbol}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    Price: $
                    {new Intl.NumberFormat("en-US", {
                      maximumSignificantDigits: 4,
                    }).format(broker.tokenPrice)}
                    {broker.tokenMarketCap && (
                      <span className="ml-2">
                        • Market Cap: $
                        {new Intl.NumberFormat("en-US", {
                          notation: "compact",
                          maximumSignificantDigits: 4,
                        }).format(broker.tokenMarketCap)}
                      </span>
                    )}
                  </div>
                  {/* GeckoTerminal Link */}
                  {broker.tokenAddress && broker.tokenChain && (
                    <a
                      href={`https://www.geckoterminal.com/${broker.tokenChain}/tokens/${broker.tokenAddress}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={e => e.stopPropagation()}
                      className="text-xs text-primary hover:text-primary-light inline-flex items-center gap-1 mt-1"
                    >
                      View on GeckoTerminal
                      <div className="i-mdi:open-in-new h-3 w-3"></div>
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <div />
        <div />
      </div>
    </div>
  );
}
