import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "~/i18n";
import {
  PROGRAMME_CONFIG,
  anonymizeDistributor,
  formatCompactCurrency,
  formatCurrency,
} from "./constants";
import { useInViewOnce } from "./useInViewOnce";

interface DistributorStatsRecord {
  distributorName: string;
  revenueShare30d: number;
  inviteeVolume30d: number;
  graduatedInvitees: number;
}

const parseStatsRecord = (raw: unknown): DistributorStatsRecord | null => {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const source = raw as Record<string, unknown>;
  const revenueShare30d = Number(source["30D Revenue Share"]);
  const inviteeVolume30d = Number(source["30D Invitee Volume"]);
  const graduatedInvitees = Number(source["Number of Graduated Invitees"]);

  if (
    Number.isNaN(revenueShare30d) ||
    Number.isNaN(inviteeVolume30d) ||
    Number.isNaN(graduatedInvitees)
  ) {
    return null;
  }

  return {
    distributorName: String(source["Distributor Name"] ?? ""),
    revenueShare30d,
    inviteeVolume30d,
    graduatedInvitees,
  };
};

export function RevenueTable() {
  const { t } = useTranslation();
  const { ref, isInView } = useInViewOnce<HTMLElement>();
  const [records, setRecords] = useState<DistributorStatsRecord[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    const loadLeaderboard = async () => {
      try {
        setLoading(true);
        const response = await fetch(PROGRAMME_CONFIG.API_URL, {
          headers: {
            accept: "application/json",
            "X-API-KEY": PROGRAMME_CONFIG.API_KEY,
          },
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Failed to fetch distributor leaderboard");
        }

        const payload = await response.json();
        if (!Array.isArray(payload)) {
          throw new Error("Invalid leaderboard payload");
        }

        const parsed = payload
          .map(parseStatsRecord)
          .filter((item): item is DistributorStatsRecord => item !== null)
          .filter(item => item.revenueShare30d > 0)
          .sort((left, right) => right.revenueShare30d - left.revenueShare30d);

        if (!controller.signal.aborted) {
          setRecords(parsed);
          setHasError(false);
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error("Leaderboard request failed:", error);
          setHasError(true);
          setRecords(null);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    void loadLeaderboard();

    return () => controller.abort();
  }, []);

  const stats = useMemo(() => {
    if (!records || records.length === 0) {
      return null;
    }

    const totalVolume = records.reduce(
      (sum, item) => sum + item.inviteeVolume30d,
      0
    );
    const totalRevenue = records.reduce(
      (sum, item) => sum + item.revenueShare30d,
      0
    );

    return [
      {
        label: t("distributor.programme.activeDistributors"),
        value: String(records.length),
        iconClass: "i-mdi:account-group-outline",
      },
      {
        label: t("distributor.programme.volumeReferred30d"),
        value: formatCompactCurrency(totalVolume),
        iconClass: "i-mdi:trending-up",
      },
      {
        label: t("distributor.programme.revenuePaid30d"),
        value: formatCompactCurrency(totalRevenue),
        iconClass: "i-mdi:wallet-outline",
      },
    ];
  }, [records, t]);

  const leaderboardRows = useMemo(() => {
    if (!records?.length) {
      return [];
    }
    return records.filter(
      item =>
        item.revenueShare30d >= PROGRAMME_CONFIG.LEADERBOARD_MIN_EARNINGS_USD
    );
  }, [records]);

  return (
    <section
      id="leaderboard"
      ref={ref}
      className="vanguard-section section-pad vanguard-leaderboard-bg"
    >
      <div className="vanguard-content-wrap">
        {isInView && (
          <>
            <header className="vanguard-section-header fade-up">
              <h2 className="vanguard-section-heading">
                {t("distributor.programme.leaderboardHeading")}
              </h2>
              <p className="vanguard-section-subheading">
                {t("distributor.programme.leaderboardSubtitle")}
              </p>
            </header>

            {stats && (
              <div className="vanguard-stats-grid fade-up d2">
                {stats.map(item => (
                  <div key={item.label} className="vanguard-stats-card">
                    <span className={`vanguard-stats-icon ${item.iconClass}`} />
                    <p className="vanguard-stats-label">{item.label}</p>
                    <p className="vanguard-stats-value">{item.value}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="vanguard-table-shell fade-up d3">
              {loading && (
                <div className="vanguard-table-loading">
                  <div className="vanguard-table-loading-bar" />
                  <p>{t("distributor.programme.loadingLeaderboard")}</p>
                </div>
              )}

              {!loading && hasError && (
                <div className="vanguard-table-empty">
                  {t("distributor.programme.failedLeaderboard")}
                </div>
              )}

              {!loading &&
                !hasError &&
                records &&
                records.length > 0 &&
                leaderboardRows.length > 0 && (
                  <div className="vanguard-table-scroll">
                    <table className="vanguard-lb-table">
                      <thead>
                        <tr>
                          <th className="text-center">
                            {t("distributor.programme.rank")}
                          </th>
                          <th>{t("distributor.programme.distributor")}</th>
                          <th className="text-right">
                            {t("distributor.programme.volume30d")}
                          </th>
                          <th className="text-right">
                            {t("distributor.programme.earnings30d")}
                          </th>
                          <th className="text-right">
                            {t("distributor.programme.builders")}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {leaderboardRows
                          .slice(0, PROGRAMME_CONFIG.LEADERBOARD_LIMIT)
                          .map((record, index) => {
                            const rank = index + 1;
                            const isTopThree = rank <= 3;
                            const alias = anonymizeDistributor(index);

                            return (
                              <tr key={`${record.distributorName}-${rank}`}>
                                <td
                                  className={`text-center vanguard-rank-cell ${isTopThree ? "is-top" : ""}`}
                                >
                                  {rank}
                                </td>
                                <td>
                                  <div className="vanguard-alias-wrap">
                                    <span
                                      className={`vanguard-alias-icon ${isTopThree ? "is-top" : ""}`}
                                    >
                                      {alias
                                        .split("-")
                                        .map(fragment => fragment[0])
                                        .join("")}
                                    </span>
                                    <span>{alias}</span>
                                  </div>
                                </td>
                                <td className="text-right vanguard-mono-text">
                                  {formatCompactCurrency(
                                    record.inviteeVolume30d
                                  )}
                                </td>
                                <td className="text-right vanguard-mono-text vanguard-green-text">
                                  {formatCurrency(record.revenueShare30d)}
                                </td>
                                <td className="text-right vanguard-mono-text">
                                  {record.graduatedInvitees}
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                )}

              {!loading &&
                !hasError &&
                records &&
                records.length > 0 &&
                leaderboardRows.length === 0 && (
                  <div className="vanguard-table-empty">
                    {t("distributor.programme.emptyLeaderboard")}
                  </div>
                )}

              {!loading && !hasError && records?.length === 0 && (
                <div className="vanguard-table-empty">
                  {t("distributor.programme.emptyLeaderboard")}
                </div>
              )}
            </div>

            <div className="vanguard-footnote fade-up d4 vanguard-footnote-lines">
              <p>{t("distributor.programme.leaderboardFootnoteLine1")}</p>
              <p>{t("distributor.programme.leaderboardFootnoteLine2")}</p>
              <p>{t("distributor.programme.leaderboardFootnoteLine3")}</p>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
