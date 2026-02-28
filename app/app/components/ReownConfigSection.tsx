import React from "react";
import FormInput from "./FormInput";
import { Card } from "./Card";
import { Trans, useTranslation } from "~/i18n";

export interface ReownConfigProps {
  walletConnectProjectId: string;
  handleInputChange: (
    field: string
  ) => (e: React.ChangeEvent<HTMLInputElement>) => void;
  idPrefix?: string;
}

const ReownConfigSection: React.FC<ReownConfigProps> = ({
  walletConnectProjectId,
  handleInputChange,
  idPrefix = "",
}) => {
  const { t } = useTranslation();

  return (
    <>
      <Card className="mb-4 p-4 slide-fade-in" variant="default">
        <div className="flex items-start gap-3">
          <div className="i-mdi:wallet-outline text-primary-light h-5 w-5 mt-0.5 flex-shrink-0"></div>
          <div>
            <p className="text-sm text-primary-light font-medium mb-2">
              {t("reownConfigSection.enhancedWalletConnectivity")}
            </p>
            <p className="text-sm text-gray-300 mb-3">
              <Trans
                i18nKey="reownConfigSection.whatIsReown"
                components={[
                  <span key="0" className="text-primary-light font-medium" />,
                ]}
              />
            </p>

            <div className="space-y-3">
              <div>
                <h4 className="text-base font-bold text-secondary-light mb-1">
                  {t("reownConfigSection.keyBenefits")}:
                </h4>
                <ul className="text-sm text-gray-300 list-disc pl-4 space-y-1">
                  <li>
                    <Trans
                      i18nKey="reownConfigSection.mobileWalletSupport"
                      components={[<strong key="0" />]}
                    />
                  </li>
                  <li>
                    <Trans
                      i18nKey="reownConfigSection.crossPlatformAccess"
                      components={[<strong key="0" />]}
                    />
                  </li>
                  <li>
                    <Trans
                      i18nKey="reownConfigSection.universalCompatibility"
                      components={[<strong key="0" />]}
                    />
                  </li>
                  <li>
                    <Trans
                      i18nKey="reownConfigSection.betterUx"
                      components={[<strong key="0" />]}
                    />
                  </li>
                  <li>
                    <Trans
                      i18nKey="reownConfigSection.secureConnections"
                      components={[<strong key="0" />]}
                    />
                  </li>
                </ul>
              </div>

              <div className="bg-background-dark/50 p-3 rounded-lg border border-secondary-light/10">
                <h4 className="text-base font-bold text-warning mb-1">
                  {t("reownConfigSection.whyThisMatters")}
                </h4>
                <p className="text-sm text-gray-400">
                  {t("reownConfigSection.whyThisMattersDesc")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <FormInput
        id={`${idPrefix}walletConnectProjectId`}
        label={t("reownConfigSection.reownProjectId")}
        value={walletConnectProjectId}
        onChange={handleInputChange("walletConnectProjectId")}
        placeholder={t("reownConfigSection.placeholderProjectId")}
        helpText={
          <>
            <div className="space-y-3">
              <div>
                <strong className="text-primary-light">
                  {t("reownConfigSection.howToGetProjectId")}
                </strong>
                <ol className="list-decimal pl-4 mt-1 space-y-1 text-sm">
                  <li>
                    <Trans
                      i18nKey="reownConfigSection.step1CreateAccount"
                      components={[
                        <a
                          key="0"
                          href="https://dashboard.reown.com"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary-light hover:underline"
                        />,
                      ]}
                    />
                  </li>
                  <li>{t("reownConfigSection.step2SetupWizard")}</li>
                  <li>{t("reownConfigSection.step3CopyId")}</li>
                </ol>
              </div>

              <div className="bg-background-dark/30 p-3 rounded-lg border border-primary-light/10">
                <h4 className="text-base font-bold text-primary-light mb-1">
                  {t("reownConfigSection.integrationNotes")}
                </h4>
                <ul className="text-sm text-gray-400 space-y-1">
                  <li>{t("reownConfigSection.note1")}</li>
                  <li>{t("reownConfigSection.note2")}</li>
                  <li>{t("reownConfigSection.note3")}</li>
                  <li>{t("reownConfigSection.note4")}</li>
                </ul>
              </div>

              <div className="bg-warning/10 p-3 rounded-lg border border-warning/20">
                <h4 className="text-base font-bold text-warning mb-1">
                  {t("reownConfigSection.domainAllowlistRequired")}
                </h4>
                <p className="text-sm text-gray-300 mb-2">
                  {t("reownConfigSection.domainAllowlistDesc")}
                </p>
                <div className="space-y-2">
                  <p className="text-sm text-gray-400">
                    <strong>
                      {t("reownConfigSection.howToConfigureDomains")}
                    </strong>
                  </p>
                  <ol className="list-decimal pl-4 space-y-1 text-sm text-gray-400">
                    <li>
                      <Trans
                        i18nKey="reownConfigSection.domainStep1"
                        components={[
                          <code
                            key="0"
                            className="bg-background-dark px-1 rounded"
                          />,
                        ]}
                      />
                    </li>
                    <li>{t("reownConfigSection.domainStep2")}</li>
                    <li>{t("reownConfigSection.domainStep3")}</li>
                    <li>
                      <Trans
                        i18nKey="reownConfigSection.domainStep4"
                        components={[
                          <code
                            key="0"
                            className="bg-background-dark px-1 rounded"
                          />,
                        ]}
                      />
                    </li>
                  </ol>
                  <div className="mt-2 p-2 bg-background-dark/50 rounded border border-gray-600/30">
                    <p className="text-xs text-gray-400">
                      <Trans
                        i18nKey="reownConfigSection.proTip"
                        components={[
                          <code
                            key="0"
                            className="bg-background-dark px-1 rounded"
                          />,
                        ]}
                      />
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        }
      />
    </>
  );
};

export default ReownConfigSection;
