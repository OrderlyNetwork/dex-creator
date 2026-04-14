import { useMemo, useState } from "react";
import { useTranslation } from "~/i18n";
import {
  PROGRAMME_CONFIG,
  TIERS,
  type TierName,
  formatCompactCurrency,
  formatCurrency,
} from "./constants";
import { useInViewOnce } from "./useInViewOnce";

export function RevenueSimulator() {
  const { t } = useTranslation();
  const { ref, isInView } = useInViewOnce<HTMLElement>();
  const [dailyVolM, setDailyVolM] = useState<number>(
    PROGRAMME_CONFIG.SLIDER_DEFAULT
  );
  const [showAssumptions, setShowAssumptions] = useState<boolean>(false);
  const [distTierIndex, setDistTierIndex] = useState<number>(
    PROGRAMME_CONFIG.DEFAULT_DISTRIBUTOR_TIER_INDEX
  );
  const [builderTierIndex, setBuilderTierIndex] = useState<number>(
    PROGRAMME_CONFIG.DEFAULT_BUILDER_TIER_INDEX
  );
  const [takerRatio, setTakerRatio] = useState<number>(
    PROGRAMME_CONFIG.DEFAULT_TAKER_RATIO
  );

  const tierLabelMap: Record<TierName, string> = useMemo(
    () => ({
      Public: t("distributor.public"),
      Silver: t("distributor.silver"),
      Gold: t("distributor.gold"),
      Platinum: t("distributor.platinum"),
      Diamond: t("distributor.diamond"),
    }),
    [t]
  );

  const calculator = useMemo(() => {
    const distributorBps = TIERS[distTierIndex].takerBps;
    const builderBps = TIERS[builderTierIndex].takerBps;
    const isSameTier = distTierIndex === builderTierIndex;
    const dailyVolume = dailyVolM * 1_000_000;
    const dailyTakerVolume = dailyVolume * (takerRatio / 100);

    const spread = isSameTier
      ? PROGRAMME_CONFIG.MIN_SPREAD_BPS
      : Math.max(PROGRAMME_CONFIG.MIN_SPREAD_BPS, builderBps - distributorBps);

    const dailyRevenue = isSameTier
      ? dailyVolume * (PROGRAMME_CONFIG.MIN_SPREAD_BPS / 10000)
      : dailyTakerVolume * (spread / 10000);

    return {
      spread,
      isSameTier,
      dailyRevenue,
      monthlyRevenue: dailyRevenue * 30,
      annualRevenue: dailyRevenue * 365,
    };
  }, [builderTierIndex, dailyVolM, distTierIndex, takerRatio]);

  const volumeSliderPercent =
    ((dailyVolM - PROGRAMME_CONFIG.SLIDER_MIN) /
      (PROGRAMME_CONFIG.SLIDER_MAX - PROGRAMME_CONFIG.SLIDER_MIN)) *
    100;

  return (
    <section id="calculator" ref={ref} className="vanguard-section section-pad">
      <div className="vanguard-content-wrap vanguard-calculator-wrap">
        {isInView && (
          <>
            <header className="vanguard-section-header fade-up">
              <p className="vanguard-section-label">
                {t("distributor.programme.calculatorLabel")}
              </p>
              <h2 className="vanguard-section-heading">
                {t("distributor.programme.calculatorHeading")}
              </h2>
            </header>

            <div className="vanguard-calculator-card fade-up d2">
              <div className="vanguard-calculator-layout">
                <div className="vanguard-calculator-left">
                  <label className="vanguard-input-label">
                    {t("distributor.programme.totalDailyVolumeLabel")}
                  </label>
                  <div className="vanguard-volume-value-wrap">
                    <span className="vanguard-volume-value">
                      {`$${formatCompactCurrency(dailyVolM * 1_000_000).replace("$", "")}`}
                    </span>
                    <span className="vanguard-volume-suffix">
                      {t("distributor.programme.perDay")}
                    </span>
                  </div>

                  <input
                    type="range"
                    min={PROGRAMME_CONFIG.SLIDER_MIN}
                    max={PROGRAMME_CONFIG.SLIDER_MAX}
                    step={1}
                    value={dailyVolM}
                    onChange={event => setDailyVolM(Number(event.target.value))}
                    className="vanguard-range-slider"
                    style={{
                      background: `linear-gradient(to right, var(--purple-200) ${volumeSliderPercent}%, rgba(103, 0, 206, 0.15) ${volumeSliderPercent}%)`,
                    }}
                  />

                  <div className="vanguard-slider-scale">
                    <span>$1M</span>
                    <span>$500M</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowAssumptions(!showAssumptions)}
                    className="vanguard-assumption-toggle"
                  >
                    <span
                      className={`vanguard-inline-icon ${showAssumptions ? "i-mdi:chevron-up" : "i-mdi:chevron-down"}`}
                    />
                    {showAssumptions
                      ? t("distributor.programme.hideAssumptions")
                      : t("distributor.programme.showAssumptions")}
                  </button>

                  {showAssumptions && (
                    <div className="vanguard-assumption-panel">
                      <div className="vanguard-assumption-group">
                        <p className="vanguard-assumption-label">
                          {t("distributor.programme.yourTier")}
                        </p>
                        <div className="vanguard-tier-pill-wrap">
                          {TIERS.map((tier, index) => (
                            <button
                              type="button"
                              key={tier.name}
                              onClick={() => {
                                setDistTierIndex(index);
                                if (builderTierIndex > index) {
                                  setBuilderTierIndex(index);
                                }
                              }}
                              className={`vanguard-tier-pill ${distTierIndex === index ? "is-active" : ""}`}
                            >
                              {tierLabelMap[tier.name]}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="vanguard-assumption-group">
                        <p className="vanguard-assumption-label">
                          {t("distributor.programme.builderTier")}
                        </p>
                        <div className="vanguard-tier-pill-wrap">
                          {TIERS.filter(
                            (_, index) => index <= distTierIndex
                          ).map((tier, index) => (
                            <button
                              type="button"
                              key={tier.name}
                              onClick={() => setBuilderTierIndex(index)}
                              className={`vanguard-tier-pill is-green ${builderTierIndex === index ? "is-active" : ""}`}
                            >
                              {tierLabelMap[tier.name]}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="vanguard-assumption-group">
                        <p className="vanguard-assumption-label">
                          {t("distributor.programme.takerRatio", {
                            ratio: takerRatio,
                          })}
                        </p>
                        <input
                          type="range"
                          min={10}
                          max={100}
                          step={5}
                          value={takerRatio}
                          onChange={event =>
                            setTakerRatio(Number(event.target.value))
                          }
                          className="vanguard-range-slider"
                          style={{
                            background: `linear-gradient(to right, var(--purple-200) ${takerRatio}%, rgba(103, 0, 206, 0.15) ${takerRatio}%)`,
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="vanguard-calculator-right">
                  <p className="vanguard-right-title">
                    {t("distributor.programme.estimatedMonthlyEarnings")}
                  </p>
                  <p className="vanguard-right-main-value">
                    {formatCurrency(calculator.monthlyRevenue)}
                  </p>
                  <p className="vanguard-right-subtitle">
                    {t("distributor.programme.paidDailyInUsdc")}
                  </p>

                  <div className="vanguard-right-mini-grid">
                    <div className="vanguard-right-mini-card">
                      <p className="vanguard-right-mini-label">
                        {t("distributor.programme.daily")}
                      </p>
                      <p className="vanguard-right-mini-value">
                        {formatCurrency(calculator.dailyRevenue)}
                      </p>
                    </div>
                    <div className="vanguard-right-mini-card">
                      <p className="vanguard-right-mini-label">
                        {t("distributor.programme.annual")}
                      </p>
                      <p className="vanguard-right-mini-value">
                        {formatCurrency(calculator.annualRevenue)}
                      </p>
                    </div>
                  </div>

                  <p className="vanguard-spread-note">
                    {t("distributor.programme.spreadNote", {
                      spread: calculator.spread.toFixed(2),
                      suffix: calculator.isSameTier
                        ? t("distributor.programme.sameTierSuffix")
                        : t("distributor.programme.takerVolumeSuffix"),
                    })}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
