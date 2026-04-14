import { useTranslation } from "~/i18n";
import { useDistributorCtaAction } from "./useDistributorCtaAction";
import { useInViewOnce } from "./useInViewOnce";

export function CtaSection() {
  const { t } = useTranslation();
  const { ref, isInView } = useInViewOnce<HTMLElement>();
  const { handleCtaClick } = useDistributorCtaAction();

  return (
    <section
      ref={ref}
      className="vanguard-section section-pad vanguard-final-cta-section"
    >
      <div className="vanguard-final-cta-radial" />
      <div className="vanguard-content-wrap vanguard-final-cta-wrap">
        {isInView && (
          <>
            <header className="vanguard-section-header fade-up">
              <h2 className="vanguard-section-heading">
                {t("distributor.programme.finalCtaHeading")}
              </h2>
              <p className="vanguard-section-subheading">
                {t("distributor.programme.finalCtaSubtitle")}
              </p>
            </header>

            <div className="vanguard-benefits-grid fade-up d2">
              <article className="vanguard-benefit-card">
                <div className="vanguard-benefit-icon-wrap">
                  <span className="vanguard-benefit-icon i-mdi:cash-remove" />
                </div>
                <h3>{t("distributor.programme.benefitNoCostTitle")}</h3>
                <p>{t("distributor.programme.benefitNoCostDesc")}</p>
              </article>

              <article className="vanguard-benefit-card">
                <div className="vanguard-benefit-icon-wrap">
                  <span className="vanguard-benefit-icon i-mdi:cash-fast" />
                </div>
                <h3>{t("distributor.programme.benefitDailyPayoutTitle")}</h3>
                <p>{t("distributor.programme.benefitDailyPayoutDesc")}</p>
              </article>

              <article className="vanguard-benefit-card">
                <div className="vanguard-benefit-icon-wrap">
                  <span className="vanguard-benefit-icon i-mdi:infinity" />
                </div>
                <h3>{t("distributor.programme.benefitPermanentTitle")}</h3>
                <p>{t("distributor.programme.benefitPermanentDesc")}</p>
              </article>
            </div>

            <div className="vanguard-final-cta-button-wrap fade-up d3">
              <button
                type="button"
                onClick={handleCtaClick}
                className="vanguard-btn vanguard-btn-primary vanguard-btn-lg"
              >
                {t("distributor.programme.finalCtaButton")}
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
