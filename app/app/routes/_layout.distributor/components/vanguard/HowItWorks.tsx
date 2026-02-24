import { useTranslation } from "~/i18n";

export function HowItWorks() {
  const { t } = useTranslation();
  const steps = [
    {
      id: "step1",
      icon: "/distributor/icon-create.svg",
      title: t("distributor.step1CreateProfile"),
      desc: t("distributor.step1Desc"),
    },
    {
      id: "step2",
      icon: "/distributor/icon-refer.svg",
      title: t("distributor.step2ReferBuilders"),
      desc: t("distributor.step2Desc"),
    },
    {
      id: "step3",
      icon: "/distributor/icon-earn.svg",
      title: t("distributor.step3EarnRevenueShare"),
      desc: t("distributor.step3Desc"),
    },
  ];

  return (
    <section className="py-16">
      <div className="flex flex-col gap-5 max-w-[1088px] mx-auto px-5 lg:px-0">
        <div className="mb-6 flex flex-col items-center text-center gap-2">
          <h2 className="text-[32px] font-semibold leading-[1.2]">
            {t("distributor.howItWorks")}
          </h2>
          <p className="text-base-contrast/54 text-lg">
            {t("distributor.signUpThreeSteps")}
          </p>
        </div>

        <div className="flex gap-6 max-lg:flex-col">
          {steps.map(step => (
            <div
              className="flex-1 flex flex-col gap-5 p-8 bg-purple-dark border border-line-6 rounded-[20px]"
              key={step.id}
            >
              <div className="w-20 h-20">
                <img src={step.icon} alt="" className="w-full h-full" />
              </div>
              <div className="flex flex-col gap-5">
                <h3 className="text-[32px] font-medium leading-[1.2]">
                  {step.title}
                </h3>
                <p className="text-sm text-base-contrast/54 leading-[1.4]">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
