import { useTranslation, Trans } from "~/i18n";
import { Button } from "./Button";

interface TradingViewLicenseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TradingViewLicenseModal({
  isOpen,
  onClose,
}: TradingViewLicenseModalProps) {
  const { t } = useTranslation();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center h-screen">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-background-dark/80 backdrop-blur-sm z-[1001]"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative z-[1002] w-full max-w-2xl p-6 rounded-xl bg-background-light border border-light/10 shadow-2xl slide-fade-in max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold">
            {t("tradingView.licenseModal.title")}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Close modal"
          >
            <div className="i-mdi:close h-5 w-5"></div>
          </button>
        </div>

        <div className="space-y-6">
          {/* Free License Notice */}
          <div className="bg-success/10 rounded-lg border border-success/20 p-4">
            <div className="flex items-start gap-3">
              <div className="i-mdi:check-circle text-success h-5 w-5 mt-0.5 flex-shrink-0"></div>
              <div>
                <h4 className="text-base font-bold mb-1 text-success">
                  {t("tradingView.licenseAck.goodNews")}
                </h4>
                <p className="text-xs text-gray-300">
                  {t("tradingView.licenseModal.freeLicenseDesc")}
                </p>
              </div>
            </div>
          </div>

          {/* What You Need */}
          <div>
            <h4 className="text-base font-bold mb-3">
              {t("tradingView.licenseAck.whatYouNeed")}
            </h4>
            <ol className="text-sm text-gray-300 space-y-2 list-decimal list-inside">
              <li>
                <Trans
                  i18nKey="tradingView.licenseModal.visitTradingViewPage"
                  components={[
                    <a
                      key="0"
                      href="https://www.tradingview.com/advanced-charts/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-light hover:underline"
                    />,
                  ]}
                />
              </li>
              <li>{t("tradingView.licenseModal.clickGetLibrary")}</li>
              <li>{t("tradingView.licenseModal.fillOutForm")}</li>
              <li>{t("tradingView.licenseAck.waitForApproval")}</li>
            </ol>
          </div>

          {/* Where to Click Image */}
          <div>
            <h4 className="text-base font-bold mb-3">
              {t("tradingView.licenseModal.whereToClick")}
            </h4>
            <div className="bg-background-dark/50 rounded-lg p-4 border border-light/10">
              <img
                src="/advanced-charts.webp"
                alt="TradingView Advanced Charts page showing where to click to request a license"
                className="w-full rounded border border-light/20"
              />
              <p className="text-xs text-gray-400 mt-2 text-center">
                {t("tradingView.licenseModal.lookForGetLibrary")}
              </p>
            </div>
          </div>

          {/* Application Details */}
          <div>
            <h4 className="text-base font-bold mb-3">
              {t("tradingView.licenseModal.applicationFormDetails")}
            </h4>
            <div className="bg-background-dark/50 rounded-lg p-4 border border-light/10 space-y-3">
              <div>
                <span className="text-xs font-medium text-primary-light">
                  {t("tradingView.licenseModal.websiteUrl")}
                </span>
                <p className="text-xs text-gray-300 mt-1">
                  {t("tradingView.licenseModal.websiteUrlDesc")}
                </p>
              </div>

              <div>
                <span className="text-xs font-medium text-primary-light">
                  {t("tradingView.licenseModal.githubProfile")}:
                </span>
                <p className="text-xs text-gray-300 mt-1">
                  <Trans
                    i18nKey="tradingView.licenseModal.githubProfileDesc"
                    components={[
                      <a
                        key="0"
                        href="https://github.com/signup"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-light hover:underline"
                      />,
                    ]}
                  />
                </p>
              </div>

              <div>
                <span className="text-xs font-medium text-primary-light">
                  {t("tradingView.licenseModal.companyProfile")}
                </span>
                <p className="text-xs text-gray-300 mt-1">
                  {t("tradingView.licenseModal.companyProfileValue")}
                </p>
              </div>

              <div>
                <span className="text-xs font-medium text-primary-light">
                  {t("tradingView.licenseModal.ownDataFeed")}
                </span>
                <p className="text-xs text-gray-300 mt-1">
                  {t("tradingView.licenseModal.ownDataFeedValue")}
                </p>
              </div>

              <div>
                <span className="text-xs font-medium text-primary-light">
                  {t("tradingView.licenseModal.reasonForRequest")}
                </span>
                <p className="text-xs text-gray-300 mt-1">
                  {t("tradingView.licenseModal.reasonForRequestDesc")}
                </p>
              </div>
            </div>
          </div>

          {/* Important Notes */}
          <div className="bg-warning/10 rounded-lg border border-warning/20 p-4">
            <div className="flex items-start gap-3">
              <div className="i-mdi:information-outline text-warning h-5 w-5 mt-0.5 flex-shrink-0"></div>
              <div>
                <h4 className="text-base font-bold mb-2 text-warning">
                  {t("tradingView.importantNotes")}
                </h4>
                <ul className="text-xs text-gray-300 space-y-1 list-disc list-inside">
                  <li>{t("tradingView.licenseAck.ackNote2")}</li>
                  <li>{t("tradingView.licenseModal.note2")}</li>
                  <li>{t("tradingView.licenseModal.note3")}</li>
                  <li>{t("tradingView.licenseAck.ackNote4")}</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex justify-center pt-2">
            <Button
              as="a"
              href="https://www.tradingview.com/advanced-charts/"
              target="_blank"
              rel="noopener noreferrer"
              variant="primary"
            >
              <span className="flex items-center gap-2">
                {t("tradingView.licenseModal.applyForLicense")}
                <div className="i-mdi:open-in-new h-4 w-4"></div>
              </span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
