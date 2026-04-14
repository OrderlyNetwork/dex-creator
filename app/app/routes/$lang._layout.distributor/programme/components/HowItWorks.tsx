import { useTranslation } from "~/i18n";
import { useInViewOnce } from "./useInViewOnce";

interface StepItem {
  iconClass: string;
  title: string;
  description: string;
}

export function HowItWorks() {
  const { t } = useTranslation();
  const { ref, isInView } = useInViewOnce<HTMLElement>();

  const steps: StepItem[] = [
    {
      iconClass: "i-mdi:account-plus-outline",
      title: t("distributor.programme.step1Title"),
      description: t("distributor.programme.step1Desc"),
    },
    {
      iconClass: "i-mdi:account-group-outline",
      title: t("distributor.programme.step2Title"),
      description: t("distributor.programme.step2Desc"),
    },
    {
      iconClass: "i-mdi:cash-multiple",
      title: t("distributor.programme.step3Title"),
      description: t("distributor.programme.step3Desc"),
    },
  ];

  return (
    <section ref={ref} className="vanguard-section section-pad">
      <div className="vanguard-content-wrap">
        {isInView && (
          <>
            <div className="vanguard-section-header fade-up">
              <p className="vanguard-section-label">
                {t("distributor.programme.howItWorksLabel")}
              </p>
              <h2 className="vanguard-section-heading">
                {t("distributor.programme.howItWorksHeading")}
              </h2>
            </div>
            <div className="vanguard-steps-grid">
              {steps.map((step, index) => (
                <article
                  key={step.title}
                  className={`vanguard-step-card fade-up d${index + 2}`}
                >
                  <span className="vanguard-step-number">{`0${index + 1}`}</span>
                  <div className="vanguard-step-icon-box">
                    <span className={`vanguard-step-icon ${step.iconClass}`} />
                  </div>
                  <h3 className="vanguard-step-title">{step.title}</h3>
                  <p className="vanguard-step-desc">{step.description}</p>
                </article>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
