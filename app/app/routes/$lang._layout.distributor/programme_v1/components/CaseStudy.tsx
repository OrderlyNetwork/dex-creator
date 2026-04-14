import { useTranslation } from "~/i18n";

export function CaseStudy() {
  const { t } = useTranslation();
  return (
    <section className="py-16">
      <div className="flex flex-col items-center gap-11 max-w-[1088px] mx-auto px-5 lg:px-0">
        <div className="flex flex-col justify-center items-center gap-4 text-center w-full">
          <span className="text-purple-light text-lg">
            {t("distributor.caseStudy")}
          </span>
          <h2 className="text-[32px] font-semibold leading-[1.2] text-base-contrast">
            {t("distributor.inbumTitle")}
          </h2>
        </div>

        <div className="flex items-stretch gap-5 w-full max-lg:flex-col">
          <div className="flex-1 flex flex-col justify-center items-center gap-5 h-[400px] border border-line-6 rounded-[20px] relative overflow-hidden min-h-[400px] max-lg:min-h-[300px]">
            {/* Backgrounds using absolute positioning */}
            <div className="absolute inset-0 bg-[linear-gradient(180deg,#261249_0%,#6F45B8_100%)] opacity-12 z-[1]"></div>
            <div className="absolute inset-0 bg-[url('/distributor/case-study-bg.png')] bg-cover bg-center opacity-25 z-[2]"></div>

            <img
              src="/distributor/inbum.png"
              alt="Inbum DEX"
              className="max-w-[240px] h-auto relative z-[3]"
            />
            <span className="text-xl text-base-contrast/54 relative z-[3]">
              {t("distributor.byInbum")}
            </span>
          </div>

          <div className="flex-1 flex flex-col gap-5">
            <div className="flex gap-5 flex-1 max-lg:flex-col">
              <div className="flex-1 flex p-6 bg-purple-dark border border-line-6 rounded-[20px] min-h-[140px]">
                <div className="flex flex-col justify-center gap-2 w-full h-full">
                  <div className="flex flex-col gap-2">
                    <span className="text-[40px] font-semibold leading-[1.2]">
                      {t("distributor.tenMins")}
                    </span>
                    <span className="text-lg text-purple-light">
                      {t("distributor.launchedDexWithOrderly")}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex-1 flex p-6 bg-purple-dark border border-line-6 rounded-[20px] min-h-[140px]">
                <div className="flex flex-col justify-center gap-2 w-full h-full">
                  <div className="flex flex-col gap-2">
                    <span className="text-[40px] font-semibold leading-[1.2]">
                      $46B
                    </span>
                    <span className="text-lg text-purple-light">
                      {t("distributor.volume90d")}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-5 flex-1 max-lg:flex-col">
              <div className="flex-1 flex p-6 bg-purple-dark border border-line-6 rounded-[20px] min-h-[140px]">
                <div className="flex flex-col justify-center gap-2 w-full h-full">
                  <div className="flex flex-col gap-2">
                    <span className="text-[40px] font-semibold leading-[1.2]">
                      $1.25M+
                    </span>
                    <span className="text-lg text-purple-light">
                      {t("distributor.netProfit90d")}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex-1 flex p-6 bg-purple-dark border border-line-6 rounded-[20px] min-h-[140px]">
                <div className="flex flex-col justify-center gap-2 w-full h-full">
                  <div className="flex flex-col gap-2">
                    <span className="text-[40px] font-semibold leading-[1.2]">
                      {t("distributor.eightFigure")}
                    </span>
                    <span className="text-lg text-purple-light">
                      {t("distributor.acquiredByGate")}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
