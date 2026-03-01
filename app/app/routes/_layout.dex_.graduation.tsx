import type { MetaFunction } from "@remix-run/node";
import { GraduationForm } from "../components/GraduationForm";
import { useAuth } from "../context/useAuth";
import { useDex } from "../context/DexContext";
import { Card } from "../components/Card";
import WalletConnect from "../components/WalletConnect";
import { useState } from "react";
import { Trans, useTranslation } from "~/i18n";
import { FeeConfigWithCalculator } from "../components/FeeConfigWithCalculator";
import { BaseFeeExplanation } from "../components/BaseFeeExplanation";
import { BackDexDashboard } from "../components/BackDexDashboard";

export const meta: MetaFunction = () => [
  { title: "Graduate Your DEX - Orderly One" },
  {
    name: "description",
    content:
      "Graduate your DEX to enable revenue generation. Configure fees and start earning from trading activity.",
  },
];

export default function GraduationRoute() {
  const { t } = useTranslation();
  const { isAuthenticated, isLoading } = useAuth();
  const { refreshDexData } = useDex();
  const [noDexSetup, setNoDexSetup] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] mt-26 pb-52">
        <div className="i-svg-spinners:three-dots text-4xl text-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-3xl mt-26 pb-52">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <BackDexDashboard />
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-bold mb-4">{t("graduation.title")}</h1>
            <p className="text-gray-300 max-w-2xl">
              {t("graduation.subtitle")}
            </p>
          </div>
        </div>
      </div>

      {/* Warning card when no DEX is set up */}
      {noDexSetup && isAuthenticated && (
        <div className="max-w-3xl mx-auto mb-8">
          <Card className="border border-warning/20 bg-warning/5 mb-8">
            <div className="flex gap-4 items-start">
              <div className="bg-warning/20 p-2 rounded-full flex-shrink-0">
                <div className="i-mdi:alert-circle text-warning w-6 h-6"></div>
              </div>
              <div>
                <h3 className="text-lg font-medium text-warning">
                  {t("graduation.dexSetupRequired.title")}
                </h3>
                <p className="text-gray-300 mt-1 mb-3">
                  {t("graduation.dexSetupRequired.description")}
                </p>
                <a
                  href="/"
                  className="inline-flex items-center px-4 py-2 rounded-full bg-warning/10 text-warning hover:bg-warning/20 transition-colors"
                >
                  <div className="i-mdi:rocket-launch w-4 h-4 mr-2"></div>
                  {t("graduation.dexSetupRequired.createDex")}
                  <div className="i-mdi:arrow-right w-4 h-4 ml-2"></div>
                </a>
              </div>
            </div>
          </Card>

          {/* Even without a DEX, show the fee explanation and calculator */}
          <Card className="mb-8">
            <h2 className="text-xl font-medium mb-4">
              {t("graduation.previewRevenue.title")}
            </h2>
            <p className="text-gray-300 mb-6">
              {t("graduation.previewRevenue.description")}
            </p>

            <BaseFeeExplanation />

            <FeeConfigWithCalculator
              makerFee={3}
              takerFee={6}
              readOnly={true}
              defaultOpenCalculator={true}
            />
          </Card>
        </div>
      )}

      {/* Show wallet connect if not authenticated */}
      {!isAuthenticated ? (
        <div className="w-full max-w-3xl mx-auto px-4 py-6 md:py-10">
          <div className="text-center">
            <Card>
              <h2 className="text-lg md:text-xl font-medium mb-3 md:mb-4">
                {t("common.authenticationRequired")}
              </h2>
              <p className="mb-4 md:mb-6 text-sm md:text-base text-gray-300">
                {t("graduation.authRequired.description")}
              </p>
              <div className="flex justify-center">
                <WalletConnect />
              </div>
            </Card>
          </div>
        </div>
      ) : (
        <>
          <GraduationForm
            onNoDexSetup={() => setNoDexSetup(true)}
            onGraduationSuccess={refreshDexData}
          />

          <div className="mt-16 max-w-2xl mx-auto bg-light/5 rounded-xl p-6">
            <h2 className="text-xl font-bold mb-4">
              {t("graduation.benefits.title")}
            </h2>
            <div className="space-y-4">
              <div className="flex gap-4 items-start">
                <div className="bg-primary/20 p-2 rounded-full">
                  <div className="i-mdi:cash-multiple text-primary w-6 h-6"></div>
                </div>
                <div>
                  <h3 className="text-lg font-medium">
                    {t("graduation.benefits.feeRevenue.title")}
                  </h3>
                  <p className="text-gray-300">
                    {t("graduation.benefits.feeRevenue.description")}
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="bg-primary/20 p-2 rounded-full">
                  <div className="i-mdi:card-account-details text-primary w-6 h-6"></div>
                </div>
                <div>
                  <h3 className="text-lg font-medium">
                    {t("graduation.benefits.uniqueBrokerId.title")}
                  </h3>
                  <p className="text-gray-300">
                    {t("graduation.benefits.uniqueBrokerId.description")}
                  </p>
                </div>
              </div>

              {/* New benefit about staking tiers */}
              <div className="flex gap-4 items-start">
                <div className="bg-warning/20 p-2 rounded-full">
                  <div className="i-mdi:finance text-warning w-6 h-6"></div>
                </div>
                <div>
                  <h3 className="text-lg font-medium">
                    {t("graduation.benefits.builderStaking.title")}
                  </h3>
                  <p className="text-gray-300">
                    {t("graduation.benefits.builderStaking.description")}
                  </p>
                  <a
                    href="https://app.orderly.network/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 text-primary-light hover:text-primary inline-flex items-center text-sm"
                  >
                    {t("graduation.benefits.builderStaking.stakeLink")}
                    <div className="i-mdi:arrow-right ml-1 w-4 h-4"></div>
                  </a>
                  <div className="flex gap-2 mt-1">
                    <a
                      href="https://orderly.network/docs/build-on-omnichain/user-flows/builder-staking-programme"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-light hover:text-primary inline-flex items-center text-sm"
                    >
                      <div className="i-mdi:file-document-outline w-4 h-4 mr-1"></div>
                      {t("graduation.benefits.builderStaking.viewDetails")}
                    </a>
                  </div>
                  <div className="mt-2 bg-warning/10 p-2 rounded text-xs flex items-start gap-1.5">
                    <div className="i-mdi:alert-circle-outline text-warning w-4 h-4 flex-shrink-0 mt-0.5"></div>
                    <p className="text-gray-300">
                      <Trans
                        i18nKey="graduation.benefits.builderStaking.sameWalletNote"
                        components={{ 0: <span className="font-medium" /> }}
                      />
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="bg-success/20 p-2 rounded-full">
                  <div className="i-mdi:shield-check text-success w-6 h-6"></div>
                </div>
                <div>
                  <h3 className="text-lg font-medium">
                    {t("graduation.benefits.enhancedSupport.title")}
                  </h3>
                  <p className="text-gray-300">
                    {t("graduation.benefits.enhancedSupport.description")}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-light/10">
              <div className="flex items-start gap-3 text-sm">
                <div className="i-mdi:information-outline text-info w-5 h-5 flex-shrink-0 mt-0.5"></div>
                <p className="text-gray-400">
                  <span className="text-white font-medium">
                    {t("graduation.feeStructure.title")}:
                  </span>{" "}
                  {t("graduation.feeStructure.description")}
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
