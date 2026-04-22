import { useTranslation } from "~/i18n";
import { useInViewOnce } from "./useInViewOnce";

export function BoostedDistributorSection() {
  const { t } = useTranslation();
  const { ref, isInView } = useInViewOnce<HTMLElement>();

  return (
    <section
      ref={ref}
      className="vanguard-section section-pad vanguard-boosted-section"
    >
      <div className="vanguard-boosted-radial" />
      <div className="vanguard-content-wrap vanguard-boosted-wrap">
        {isInView && (
          <>
            <header className="vanguard-section-header fade-up">
              <p className="vanguard-section-label vanguard-section-label-green">
                {t("distributor.programme.boostedLabel")}
              </p>
              <h2 className="vanguard-section-heading">
                {t("distributor.programme.boostedHeading")}
              </h2>
              <p className="vanguard-section-subheading">
                {t("distributor.programme.boostedSubtitle")}
              </p>
            </header>

            <div className="vanguard-boosted-cta-wrap fade-up d2">
              <a
                href="https://forms.gle/qARKWqC7X66TJAKy9"
                target="_blank"
                rel="noopener noreferrer"
                className="vanguard-btn vanguard-btn-primary vanguard-btn-lg"
              >
                {t("distributor.programme.boostedCtaButton")}
              </a>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
