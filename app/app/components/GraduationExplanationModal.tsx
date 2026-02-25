import { Button } from "./Button";
import { useTranslation } from "~/i18n";

interface GraduationExplanationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GraduationExplanationModal({
  isOpen,
  onClose,
}: GraduationExplanationModalProps) {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center h-screen p-4">
      <div className="absolute inset-0 bg-background-dark/90 backdrop-blur-sm z-[1001]"></div>

      <div className="relative z-[1002] max-w-2xl w-full max-h-[90vh] rounded-xl bg-background-light border border-primary/20 shadow-2xl slide-fade-in overflow-hidden flex flex-col">
        <div className="flex-shrink-0 p-8 pb-0">
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-primary/20 p-3 rounded-full">
              <div className="i-mdi:rocket-launch text-primary w-8 h-8"></div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">
                {t("graduationExplanationModal.title")}
              </h2>
            </div>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-8">
          <div className="space-y-6 mb-8">
            <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-6 border border-primary/20">
              <h3 className="text-lg font-semibold text-primary-light mb-3 flex items-center">
                <div className="i-mdi:lightning-bolt h-5 w-5 mr-2"></div>
                {t("graduationExplanationModal.whatIsGraduationTitle")}
              </h3>
              <p className="text-gray-300 mb-4">
                {t("graduationExplanationModal.whatIsGraduationDescription")}
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-background-dark/50 rounded-lg p-4">
                  <h4 className="font-semibold text-success mb-2 flex items-center">
                    <div className="i-mdi:cash-multiple h-4 w-4 mr-2"></div>
                    {t("graduationExplanationModal.earnRevenueTitle")}
                  </h4>
                  <p className="text-sm text-gray-300">
                    {t("graduationExplanationModal.earnRevenueDescription")}
                  </p>
                </div>
                <div className="bg-background-dark/50 rounded-lg p-4">
                  <h4 className="font-semibold text-primary-light mb-2 flex items-center">
                    <div className="i-mdi:account-key h-4 w-4 mr-2"></div>
                    {t("graduationExplanationModal.uniqueBrokerIdTitle")}
                  </h4>
                  <p className="text-sm text-gray-300">
                    {t("graduationExplanationModal.uniqueBrokerIdDescription")}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-warning/10 rounded-lg p-6 border border-warning/20">
              <h3 className="text-lg font-semibold text-warning mb-3 flex items-center">
                <div className="i-mdi:alert-circle h-5 w-5 mr-2"></div>
                {t("graduationExplanationModal.whyGraduateNowTitle")}
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="bg-warning/20 p-1 rounded-full mt-0.5">
                    <div className="i-mdi:chart-line h-4 w-4 text-warning"></div>
                  </div>
                  <div>
                    <p className="text-gray-300 font-medium">
                      {t("graduationExplanationModal.startEarningTitle")}
                    </p>
                    <p className="text-sm text-gray-400">
                      {t("graduationExplanationModal.startEarningDescription")}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-warning/20 p-1 rounded-full mt-0.5">
                    <div className="i-mdi:shield-check h-4 w-4 text-warning"></div>
                  </div>
                  <div>
                    <p className="text-gray-300 font-medium">
                      {t("graduationExplanationModal.enhancedFeaturesTitle")}
                    </p>
                    <p className="text-sm text-gray-400">
                      {t(
                        "graduationExplanationModal.enhancedFeaturesDescription"
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-info/10 rounded-lg p-6 border border-info/20">
              <h3 className="text-lg font-semibold text-info mb-3 flex items-center">
                <div className="i-mdi:information-outline h-5 w-5 mr-2"></div>
                {t("graduationExplanationModal.howItWorksTitle")}
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="bg-info/20 text-info rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                    1
                  </div>
                  <p className="text-gray-300">
                    {t("graduationExplanationModal.step1")}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-info/20 text-info rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                    2
                  </div>
                  <p className="text-gray-300">
                    {t("graduationExplanationModal.step2")}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-info/20 text-info rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                    3
                  </div>
                  <p className="text-gray-300">
                    {t("graduationExplanationModal.step3")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-shrink-0 py-4 px-8">
          <div className="flex flex-col sm:flex-row gap-3 justify-end">
            <Button
              variant="secondary"
              onClick={onClose}
              className="w-full sm:w-auto"
            >
              <span className="flex items-center gap-2">
                <div className="i-mdi:close h-4 w-4"></div>
                {t("graduationExplanationModal.maybeLater")}
              </span>
            </Button>
            <Button
              as="a"
              href="/dex/graduation"
              variant="primary"
              className="w-full sm:w-auto"
              onClick={onClose}
            >
              <span className="flex items-center gap-2">
                <div className="i-mdi:rocket-launch h-4 w-4"></div>
                {t("graduationExplanationModal.graduateNow")}
              </span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
