import { FC } from "react";
import { useTranslation, Trans } from "~/i18n";

export const BaseFeeExplanation: FC = () => {
  const { t } = useTranslation();
  return (
    <div className="bg-primary/10 rounded-lg p-4 mb-6 border border-primary/20">
      <h3 className="text-md font-medium mb-3 flex items-center">
        <div className="i-mdi:finance text-primary w-5 h-5 mr-2"></div>
        {t("baseFeeExplanation.title")}
      </h3>

      <div className="text-sm text-gray-300 mb-4">
        <p className="mb-3">
          <span className="font-medium text-white">
            {t("baseFeeExplanation.baseFee")}:
          </span>{" "}
          {t("baseFeeExplanation.baseFeeIntro")}
        </p>

        <div className="bg-background-dark/50 rounded-lg overflow-hidden mb-4">
          <div className="grid grid-cols-4 text-center border-b border-light/10 text-xs md:text-sm">
            <div className="p-2 font-medium bg-background-dark/70">
              {t("baseFeeExplanation.tier")}
            </div>
            <div className="p-2 font-medium bg-background-dark/70">
              {t("baseFeeExplanation.volumeRequirement")}
            </div>
            <div className="p-2 font-medium bg-background-dark/70">
              {t("baseFeeExplanation.stakingRequirement")}
            </div>
            <div className="p-2 font-medium bg-background-dark/70">
              {t("baseFeeExplanation.orderlyBaseTakerFee")}
            </div>
          </div>

          <div className="grid grid-cols-4 text-center border-b border-light/10 text-xs md:text-sm">
            <div className="p-2 flex flex-col justify-center">
              <span className="font-medium">
                {t("baseFeeExplanation.public")}
              </span>
            </div>
            <div className="p-2">{t("baseFeeExplanation.noRequirement")}</div>
            <div className="p-2">{t("baseFeeExplanation.dash")}</div>
            <div className="p-2">3.00</div>
          </div>

          <div className="grid grid-cols-4 text-center border-b border-light/10 text-xs md:text-sm">
            <div className="p-2 flex flex-col justify-center">
              <span className="font-medium text-gray-100">
                {t("baseFeeExplanation.silver")}
              </span>
            </div>
            <div className="p-2">
              {t("baseFeeExplanation.vol30m")}
              <br />
              <span className="text-gray-400">
                {t("baseFeeExplanation.or")}
              </span>
            </div>
            <div className="p-2">{t("baseFeeExplanation.stake100k")}</div>
            <div className="p-2">2.75</div>
          </div>

          <div className="grid grid-cols-4 text-center border-b border-light/10 text-xs md:text-sm">
            <div className="p-2 flex flex-col justify-center">
              <span className="font-medium text-warning">
                {t("baseFeeExplanation.gold")}
              </span>
            </div>
            <div className="p-2">
              {t("baseFeeExplanation.vol90m")}
              <br />
              <span className="text-gray-400">
                {t("baseFeeExplanation.or")}
              </span>
            </div>
            <div className="p-2">{t("baseFeeExplanation.stake250k")}</div>
            <div className="p-2">2.50</div>
          </div>

          <div className="grid grid-cols-4 text-center border-b border-light/10 text-xs md:text-sm">
            <div className="p-2 flex flex-col justify-center">
              <span className="font-medium text-blue-300">
                {t("baseFeeExplanation.platinum")}
              </span>
            </div>
            <div className="p-2">
              {t("baseFeeExplanation.vol1b")}
              <br />
              <span className="text-gray-400">
                {t("baseFeeExplanation.or")}
              </span>
            </div>
            <div className="p-2">{t("baseFeeExplanation.stake2m")}</div>
            <div className="p-2">2.00</div>
          </div>

          <div className="grid grid-cols-4 text-center text-xs md:text-sm">
            <div className="p-2 flex flex-col justify-center">
              <span className="font-medium text-cyan-300">
                {t("baseFeeExplanation.diamond")}
              </span>
            </div>
            <div className="p-2">
              {t("baseFeeExplanation.vol10b")}
              <br />
              <span className="text-gray-400">
                {t("baseFeeExplanation.or")}
              </span>
            </div>
            <div className="p-2">{t("baseFeeExplanation.stake7m")}</div>
            <div className="p-2">1.00</div>
          </div>
        </div>

        <div className="flex justify-between items-center mb-3">
          <p className="font-medium text-white">
            {t("baseFeeExplanation.whatDoesThisMean")}
          </p>
          <a
            href="https://orderly.network/docs/build-on-omnichain/user-flows/builder-staking-programme"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-light hover:underline text-xs flex items-center"
          >
            {t("baseFeeExplanation.viewDocumentation")}
            <span className="i-mdi:open-in-new w-3 h-3 ml-1"></span>
          </a>
        </div>

        <p className="mb-3">{t("baseFeeExplanation.customFeeDesc")}</p>

        <ul className="pl-5 list-disc space-y-1 mb-3">
          <li>{t("baseFeeExplanation.baseFeeRetainedDesc")}</li>
          <li>{t("baseFeeExplanation.yourRevenue")}</li>
        </ul>

        <div className="flex items-center gap-2">
          <span className="i-mdi:lightbulb text-warning w-4 h-4 flex-shrink-0"></span>
          <span>{t("baseFeeExplanation.stakingTip")}</span>
        </div>

        <div className="mt-4 flex justify-center">
          <a
            href="https://app.orderly.network/"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-primary hover:bg-primary-light transition-colors px-4 py-2 rounded-full text-white font-medium flex items-center gap-2"
          >
            <span className="i-mdi:trending-up w-4 h-4"></span>
            {t("baseFeeExplanation.stakeOrderCta")}
            <span className="i-mdi:open-in-new w-3.5 h-3.5"></span>
          </a>
        </div>

        <div className="mt-4 bg-warning/10 p-3 rounded-lg">
          <div className="flex items-start gap-2 text-sm">
            <div className="i-mdi:alert-circle text-warning w-5 h-5 flex-shrink-0"></div>
            <p>
              <Trans
                i18nKey="baseFeeExplanation.importantWalletNote"
                components={[
                  <span key="0" className="font-medium text-warning" />,
                  <span key="1" className="font-medium" />,
                ]}
              />
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
