import { useState } from "react";
import { useTranslation } from "~/i18n";
import { Button } from "./Button";

interface TradingViewLicenseAcknowledgmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAcknowledge: () => void;
  onViewGuide: () => void;
}

export default function TradingViewLicenseAcknowledgmentModal({
  isOpen,
  onClose,
  onAcknowledge,
  onViewGuide,
}: TradingViewLicenseAcknowledgmentModalProps) {
  const { t } = useTranslation();
  const [isChecked, setIsChecked] = useState(false);

  if (!isOpen) return null;

  const handleAcknowledge = () => {
    if (isChecked) {
      onAcknowledge();
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center h-screen md:p-4">
      <div
        className="absolute inset-0 bg-background-dark/80 backdrop-blur-sm z-[1001]"
        onClick={onClose}
      ></div>

      <div className="relative z-[1002] w-full h-full md:h-auto md:max-w-2xl md:max-h-[90vh] overflow-y-auto p-6 md:rounded-xl bg-background-light border-0 md:border md:border-primary-light/20 shadow-2xl slide-fade-in">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold gradient-text">
            {t("tradingViewLicenseAckModal.title")}
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
          <div className="bg-red-900/30 rounded-lg border border-red-500/30 p-4">
            <div className="flex items-start gap-3">
              <div className="i-mdi:alert text-red-400 h-6 w-6 mt-0.5 flex-shrink-0"></div>
              <div>
                <h4 className="text-base font-bold mb-2 text-red-400">
                  {t("tradingViewLicenseAckModal.customDomainRequirement")}
                </h4>
                <p className="text-sm text-gray-300">
                  {t("tradingViewLicenseAckModal.customDomainRequirementDesc")}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-success/10 rounded-lg border border-success/20 p-4">
            <div className="flex items-start gap-3">
              <div className="i-mdi:check-circle text-success h-5 w-5 mt-0.5 flex-shrink-0"></div>
              <div>
                <h4 className="text-base font-bold mb-1 text-success">
                  {t("tradingViewLicenseAckModal.goodNews")}
                </h4>
                <p className="text-sm text-gray-300">
                  {t("tradingViewLicenseAckModal.goodNewsDesc")}
                </p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-base font-bold mb-3">
              {t("tradingViewLicenseAckModal.whatYouNeed")}
            </h4>
            <ol className="text-sm text-gray-300 space-y-2 list-decimal list-inside">
              <li>
                {t("tradingViewLicenseAckModal.visitPagePrefix")}{" "}
                <a
                  href="https://www.tradingview.com/advanced-charts/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-light hover:underline inline-flex items-center"
                >
                  {t("tradingViewLicenseAckModal.visitPageLink")}
                  <div className="i-mdi:open-in-new h-3.5 w-3.5 ml-1"></div>
                </a>
              </li>
              <li>{t("tradingViewLicenseAckModal.clickGetLibrary")}</li>
              <li>{t("tradingViewLicenseAckModal.fillOutForm")}</li>
              <li>{t("tradingViewLicenseAckModal.waitForApproval")}</li>
            </ol>
          </div>

          <div className="bg-info/10 rounded-lg border border-info/20 p-4">
            <div className="flex items-start gap-3">
              <div className="i-mdi:information-outline text-info h-5 w-5 mt-0.5 flex-shrink-0"></div>
              <div>
                <h4 className="text-base font-bold mb-2 text-info">
                  {t("tradingViewLicenseAckModal.importantNotes")}
                </h4>
                <ul className="text-sm text-gray-300 space-y-1.5 list-disc list-inside">
                  <li>{t("tradingViewLicenseAckModal.ackNote1")}</li>
                  <li>{t("tradingViewLicenseAckModal.ackNote2")}</li>
                  <li>{t("tradingViewLicenseAckModal.ackNote3")}</li>
                  <li>{t("tradingViewLicenseAckModal.ackNote4")}</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Need Help Section */}
          <div className="bg-background-dark/50 rounded-lg border border-light/10 p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold mb-1">
                  {t("tradingViewLicenseAckModal.needHelp")}
                </h4>
                <p className="text-xs text-gray-400">
                  {t("tradingViewLicenseAckModal.needHelpDesc")}
                </p>
              </div>
              <Button onClick={onViewGuide} variant="secondary" size="sm">
                <span className="flex items-center gap-1">
                  <div className="i-mdi:book-open-variant h-4 w-4"></div>
                  {t("tradingViewLicenseAckModal.viewGuide")}
                </span>
              </Button>
            </div>
          </div>

          {/* Acknowledgment Checkbox */}
          <div className="bg-background-dark/50 rounded-lg border border-warning/20 p-4">
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={isChecked}
                onChange={e => setIsChecked(e.target.checked)}
                className="mt-1 h-5 w-5 rounded border-warning/30 bg-background-dark text-primary-light focus:ring-2 focus:ring-primary-light/50 cursor-pointer"
              />
              <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
                {t("tradingViewLicenseAckModal.acknowledgmentText")}
              </span>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="secondary" onClick={onClose}>
              {t("tradingViewLicenseAckModal.cancel")}
            </Button>
            <Button
              variant="primary"
              onClick={handleAcknowledge}
              disabled={!isChecked}
            >
              <span className="flex items-center gap-2">
                {t("tradingViewLicenseAckModal.iHaveRead")}
                <div className="i-mdi:check h-4 w-4"></div>
              </span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
