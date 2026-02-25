import { Button } from "~/components/Button";
import { Card } from "~/components/Card";
import { useTranslation } from "~/i18n";

interface AdvancedReferralManagementProps {
  hasValidKey: boolean;
  onOpenAdminLogin: () => void;
  hideFirstFeature?: boolean;
}

export default function AdvancedReferralManagement({
  hasValidKey,
  onOpenAdminLogin,
  hideFirstFeature = false,
}: AdvancedReferralManagementProps) {
  const { t } = useTranslation();
  return (
    <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20">
      <div className="flex gap-4 items-start">
        <div className="bg-primary/20 p-3 rounded-full flex-shrink-0">
          <div className="i-mdi:tools text-primary w-6 h-6"></div>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-medium mb-2">
            {t("referral.advanced.title")}
          </h3>
          <p className="text-gray-300 mb-4">
            {t("referral.advanced.description")}
          </p>

          <div className="bg-background-dark/50 p-4 rounded-lg border border-secondary-light/10 mb-4">
            <h4 className="font-semibold mb-3 text-sm text-secondary-light">
              {t("referral.advanced.featuresTitle")}
            </h4>
            <ul className="space-y-2 text-sm text-gray-400">
              {!hideFirstFeature && (
                <li className="flex items-start gap-2">
                  <div className="i-mdi:ticket-percent text-secondary w-4 h-4 flex-shrink-0 mt-0.5"></div>
                  <span>{t("referral.advanced.feature1")}</span>
                </li>
              )}
              <li className="flex items-start gap-2">
                <div className="i-mdi:chart-box text-secondary w-4 h-4 flex-shrink-0 mt-0.5"></div>
                <span>{t("referral.advanced.feature2")}</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="i-mdi:account-group text-secondary w-4 h-4 flex-shrink-0 mt-0.5"></div>
                <span>{t("referral.advanced.feature3")}</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="i-mdi:cog-box text-secondary w-4 h-4 flex-shrink-0 mt-0.5"></div>
                <span>{t("referral.advanced.feature4")}</span>
              </li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="primary"
              onClick={() =>
                window.open("https://admin.orderly.network/", "_blank")
              }
              className="flex items-center gap-2"
            >
              <div className="i-mdi:open-in-new w-4 h-4"></div>
              {t("referral.advanced.openAdmin")}
            </Button>

            <Button
              variant="secondary"
              onClick={onOpenAdminLogin}
              disabled={!hasValidKey}
              className="flex items-center gap-2"
            >
              <div className="i-mdi:key w-4 h-4"></div>
              {t("referral.advanced.getCredentials")}
            </Button>
          </div>

          <div className="mt-3 text-xs text-gray-400 flex items-start gap-1.5">
            <div className="i-mdi:information-outline w-4 h-4 flex-shrink-0 mt-0.5"></div>
            <p>{t("referral.advanced.credentialsHint")}</p>
          </div>
        </div>
      </div>
    </Card>
  );
}
