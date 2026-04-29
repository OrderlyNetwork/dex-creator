import { FC, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import clsx from "clsx";
import { useTranslation, Trans } from "~/i18n";

const tierRows = [
  {
    tierKey: "distributor.public",
    tier: "public",
    tierClass: "text-gray-100",
    badge: "/dex/graduation/tier-public.png",
    staking: "< 100K $ORDER",
    volume: "< $30M",
    cryptoMaker: "0",
    rwaMaker: "0",
    cryptoTaker: "3.00",
    rwaTaker: "5.00",
  },
  {
    tierKey: "distributor.silver",
    tier: "silver",
    tierClass: "text-gray-100",
    badge: "/dex/graduation/tier-silver.png",
    staking: "100K $ORDER",
    volume: ">= $30M",
    cryptoMaker: "-0.05",
    rwaMaker: "-0.15",
    cryptoTaker: "2.75",
    rwaTaker: "4.75",
  },
  {
    tierKey: "distributor.gold",
    tier: "gold",
    tierClass: "text-warning",
    badge: "/dex/graduation/tier-gold.png",
    staking: "250K $ORDER",
    volume: ">= $90M",
    cryptoMaker: "-0.10",
    rwaMaker: "-0.25",
    cryptoTaker: "2.50",
    rwaTaker: "4.50",
  },
  {
    tierKey: "distributor.platinum",
    tier: "platinum",
    tierClass: "text-blue-300",
    badge: "/dex/graduation/tier-platinum.png",
    staking: "2M $ORDER",
    volume: ">= $1B",
    cryptoMaker: "-0.15",
    rwaMaker: "-0.35",
    cryptoTaker: "2.00",
    rwaTaker: "4.00",
  },
  {
    tierKey: "distributor.diamond",
    tier: "diamond",
    tierClass: "text-cyan-300",
    badge: "/dex/graduation/tier-diamond.png",
    staking: "7M $ORDER",
    volume: ">= $10B",
    cryptoMaker: "-0.20",
    rwaMaker: "-0.50",
    cryptoTaker: "1.00",
    rwaTaker: "3.00",
  },
];

interface BaseFeeExplanationProps {
  currentTier?: string;
  variant?: "card" | "button";
  buttonLabel?: string;
}

export const BaseFeeExplanation: FC<BaseFeeExplanationProps> = ({
  currentTier,
  variant = "card",
  buttonLabel,
}) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const normalizedCurrentTier = currentTier?.toLowerCase();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const modal = isOpen ? (
    <div className="fixed inset-0 z-[1000] flex h-screen items-center justify-center p-4">
      <button
        type="button"
        aria-label={t("common.close")}
        className="absolute inset-0 z-[1001] bg-background-dark/80 backdrop-blur-sm"
        onClick={() => setIsOpen(false)}
      />

      <div className="relative z-[1002] max-h-[90vh] w-full max-w-6xl overflow-y-auto rounded-xl border border-primary-light/20 bg-background-light p-5 text-left shadow-2xl slide-fade-in md:p-6">
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="absolute right-4 top-4 text-gray-400 hover:text-white"
          aria-label={t("common.close")}
        >
          <div className="i-mdi:close h-6 w-6" />
        </button>

        <div className="mb-6 pr-8">
          <div className="mb-4">
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary-light">
              <span className="i-mdi:chart-line w-4 h-4" />
              {t("baseFeeExplanation.baseFee")}
            </div>
            <h2 className="text-2xl font-semibold text-white">
              {t("baseFeeExplanation.title")}
            </h2>
          </div>

          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <p className="max-w-3xl text-sm leading-6 text-gray-300">
              <Trans
                i18nKey="baseFeeExplanation.baseFeeIntro"
                components={[
                  <a
                    key="0"
                    href="https://orderly.network/docs/introduction/trade-on-orderly/trading-basics/trading-fees#builder-staking-programme"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-light hover:underline"
                  />,
                ]}
              />
            </p>
            <a
              href="https://app.orderly.network/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-light md:ml-auto md:flex-shrink-0"
            >
              <span className="i-mdi:trending-up h-4 w-4" />
              {t("baseFeeExplanation.stakeOrderCta")}
              <span className="i-mdi:open-in-new h-3.5 w-3.5" />
            </a>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-light/10 bg-background-dark/50">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-light/10 bg-background-dark/80 text-xs uppercase tracking-wide text-gray-400">
                  <th className="px-4 py-3 font-semibold">
                    {t("baseFeeExplanation.tier")}
                  </th>
                  <th className="px-4 py-3 font-semibold">
                    {t("baseFeeExplanation.stakingRequirement")}
                  </th>
                  <th className="px-4 py-3 font-semibold">
                    {t("baseFeeExplanation.volumeRequirement")}
                  </th>
                  <th className="px-4 py-3 font-semibold">
                    {t("baseFeeExplanation.cryptoMakerRebate")} (bps)
                  </th>
                  <th className="px-4 py-3 font-semibold">
                    {t("baseFeeExplanation.rwaMakerRebate")} (bps)
                  </th>
                  <th className="px-4 py-3 font-semibold">
                    {t("baseFeeExplanation.cryptoTakerFee")} (bps)
                  </th>
                  <th className="px-4 py-3 font-semibold">
                    {t("baseFeeExplanation.rwaTakerFee")} (bps)
                  </th>
                </tr>
              </thead>
              <tbody>
                {tierRows.map(row => {
                  const isCurrentTier = row.tier === normalizedCurrentTier;

                  return (
                    <tr
                      key={row.tierKey}
                      className={clsx(
                        "border-b border-light/10 last:border-b-0",
                        isCurrentTier &&
                          "bg-primary/10 outline outline-1 -outline-offset-1 outline-primary-light/40"
                      )}
                    >
                      <td className="px-4 py-3 font-semibold">
                        <span className="flex items-center gap-2">
                          <img
                            src={row.badge}
                            alt=""
                            className="h-7 w-7 flex-shrink-0 object-contain"
                          />
                          <span className={row.tierClass}>
                            {t(row.tierKey as never)}
                          </span>
                          {isCurrentTier && (
                            <span className="rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary-light">
                              {t("baseFeeExplanation.currentTierTag")}
                            </span>
                          )}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-300">{row.staking}</td>
                      <td className="px-4 py-3 text-gray-300">{row.volume}</td>
                      <td className="px-4 py-3 text-success">
                        {row.cryptoMaker}
                      </td>
                      <td className="px-4 py-3 text-success">{row.rwaMaker}</td>
                      <td className="px-4 py-3 text-info">{row.cryptoTaker}</td>
                      <td className="px-4 py-3 text-info">{row.rwaTaker}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-6 rounded-lg border border-light/10 bg-background-card/70 p-4">
          <p className="text-sm font-semibold text-white">
            {t("baseFeeExplanation.whatDoesThisMean")}
          </p>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-gray-300">
            <li className="flex items-start gap-2">
              <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary-light" />
              <span>{t("baseFeeExplanation.customFeeDesc")}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-success" />
              <span className="font-medium text-success">
                {t("baseFeeExplanation.yourRevenue")}
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-info" />
              <span>{t("baseFeeExplanation.stakingTip")}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-warning" />
              <span>
                <Trans
                  i18nKey="baseFeeExplanation.importantWalletNote"
                  components={[
                    <span key="0" className="font-medium text-warning" />,
                    <span key="1" className="font-medium" />,
                  ]}
                />
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <>
      {variant === "button" ? (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-primary-light/30 bg-primary/10 px-3 py-2 text-sm font-medium text-primary-light transition-colors hover:bg-primary/20"
        >
          <span className="i-mdi:table-eye w-4 h-4" />
          {buttonLabel ?? t("distributor.learnMore")}
        </button>
      ) : (
        <div className="bg-primary/10 rounded-lg p-4 border border-primary/20 text-left">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-3">
              <div className="i-mdi:finance text-primary w-5 h-5 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-md font-medium text-white">
                  {t("baseFeeExplanation.title")}
                </h3>
                <p className="mt-1 text-sm text-gray-300">
                  <Trans
                    i18nKey="baseFeeExplanation.baseFeeIntro"
                    components={[
                      <a
                        key="0"
                        href="https://orderly.network/docs/introduction/trade-on-orderly/trading-basics/trading-fees#builder-staking-programme"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-light hover:underline"
                      />,
                    ]}
                  />
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-light md:flex-shrink-0"
            >
              <span className="i-mdi:table-eye w-4 h-4" />
              {t("distributor.learnMore")}
            </button>
          </div>
        </div>
      )}

      {isMounted && modal ? createPortal(modal, document.body) : null}
    </>
  );
};
