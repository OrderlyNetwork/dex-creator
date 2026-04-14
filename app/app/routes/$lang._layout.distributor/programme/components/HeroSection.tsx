import type { MouseEvent } from "react";
import { useTranslation } from "~/i18n";
import { useInViewOnce } from "./useInViewOnce";
import { useDistributorCtaAction } from "./useDistributorCtaAction";

function scrollToLeaderboard(event: MouseEvent<HTMLAnchorElement>) {
  event.preventDefault();
  const el = document.getElementById("leaderboard");
  if (!el) return;
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;
  el.scrollIntoView({
    behavior: reduceMotion ? "auto" : "smooth",
    block: "start",
  });
}

export function HeroSection() {
  const { t } = useTranslation();
  const { ref, isInView } = useInViewOnce<HTMLElement>();
  const { handleCtaClick } = useDistributorCtaAction();

  return (
    <section ref={ref} className="vanguard-hero-section">
      <div className="vanguard-hero-radial" />
      <div className="vanguard-hero-grid" />
      <div className="vanguard-hero-content">
        {isInView && (
          <>
            <div className="vanguard-chip fade-up d1">
              <span className="vanguard-chip-dot" />
              {t("distributor.programme.heroBadge")}
            </div>
            <h1 className="vanguard-hero-title fade-up d2">
              {t("distributor.programme.heroTitlePrefix")}{" "}
              <span>{t("distributor.programme.heroTitleHighlight")}</span>
            </h1>
            <p className="vanguard-hero-subtitle fade-up d3">
              {t("distributor.programme.heroSubtitleLine1")}
              <br />
              {t("distributor.programme.heroSubtitleLine2")}
            </p>
            <div className="vanguard-hero-ctas fade-up d4">
              <button
                type="button"
                onClick={handleCtaClick}
                className="vanguard-btn vanguard-btn-primary"
              >
                {t("distributor.programme.heroPrimaryCta")}
              </button>
              <a
                href="#leaderboard"
                onClick={scrollToLeaderboard}
                className="vanguard-btn vanguard-btn-secondary"
              >
                {t("distributor.programme.heroSecondaryCta")}
              </a>
            </div>
          </>
        )}
      </div>
      <div className="vanguard-hero-bottom-fade" />
    </section>
  );
}
