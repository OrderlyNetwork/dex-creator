import { Trans, useTranslation } from "~/i18n";
import { Card } from "./Card";
import { Button } from "./Button";
import WorkflowStatus from "./WorkflowStatus";

interface DexData {
  id: string;
  repoUrl?: string | null;
  customDomain?: string | null;
}

interface DexCreationStatusProps {
  dexData: DexData | null;
  deploymentUrl: string | null;
  deploymentConfirmed: boolean;
  isForking: boolean;
  handleRetryForking: () => void;
  handleSuccessfulDeployment: (url: string, isNewDeployment: boolean) => void;
}

export default function DexCreationStatus({
  dexData,
  deploymentUrl,
  deploymentConfirmed,
  isForking,
  handleRetryForking,
  handleSuccessfulDeployment,
}: DexCreationStatusProps) {
  const { t } = useTranslation();
  if (!dexData) return null;

  if (dexData.repoUrl) {
    return (
      <Card variant="success" className="mb-6" id="dex-creation-status">
        <h3 className="text-lg font-bold mb-2">
          {t("dexCreationStatus.title")}
        </h3>
        <p className="text-sm text-gray-300 mb-4">
          {t("dexCreationStatus.intro")}
        </p>

        <div className="mb-4 p-3 bg-primary/10 rounded-lg border border-primary/20">
          <h4 className="text-base font-bold mb-2 flex items-center">
            <div className="i-mdi:code-tags text-primary-light mr-2 h-5 w-5"></div>
            {t("dexCreationStatus.step1Title")}
          </h4>
          <p className="text-sm text-gray-300 mb-2">
            {t("dexCreationStatus.step1Desc")}
          </p>
          <a
            href={dexData.repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-light hover:underline break-all mb-1 flex items-center text-sm"
          >
            <span className="break-all">{dexData.repoUrl}</span>
            <div className="i-mdi:open-in-new h-4 w-4 ml-1 flex-shrink-0"></div>
          </a>
          <p className="text-xs text-gray-400 italic">
            ({t("dexCreationStatus.repoNote")})
          </p>
        </div>

        {deploymentUrl && deploymentConfirmed ? (
          <div className="mb-4 p-3 bg-success/10 rounded-lg border border-success/20 slide-fade-in">
            <h4 className="text-base font-bold mb-2 flex items-center">
              <div className="i-mdi:check-circle text-success mr-2 h-5 w-5"></div>
              {t("dexCreationStatus.step2Live")}
            </h4>
            <p className="text-sm text-gray-300 mb-3">
              {t("dexCreationStatus.congratulations")}
            </p>
            <a
              href={
                dexData.customDomain
                  ? `https://${dexData.customDomain}`
                  : deploymentUrl
              }
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary/20 hover:bg-primary/30 rounded text-primary-light transition-colors"
            >
              <span className="break-all">
                {dexData.customDomain ? dexData.customDomain : deploymentUrl}
              </span>
              <div className="i-mdi:open-in-new h-4 w-4"></div>
            </a>

            {dexData.customDomain && (
              <div className="mt-2 text-xs text-gray-400 flex items-start gap-1">
                <div className="i-mdi:information-outline h-3.5 w-3.5 mt-0.5 flex-shrink-0"></div>
                <span>{t("dexCreationStatus.customDomainNote")}</span>
              </div>
            )}

            {dexData.customDomain && (
              <div className="mt-2 text-xs text-warning flex items-start gap-1">
                <div className="i-mdi:alert-circle-outline h-3.5 w-3.5 mt-0.5 flex-shrink-0"></div>
                <span>{t("dexCreationStatus.domainChangeNote")}</span>
              </div>
            )}

            <div className="mt-4 pt-3 border-t border-light/10">
              <h5 className="text-sm font-bold mb-2 flex items-center">
                <div className="i-mdi:information-outline text-primary-light mr-2 h-4 w-4"></div>
                {t("dexCreationStatus.makingChanges")}
              </h5>
              <p className="text-xs text-gray-300 mb-2">
                {t("dexCreationStatus.changesDesc")}
              </p>
              <ul className="text-xs text-gray-300 list-disc ml-5 space-y-1">
                <li>{t("dexCreationStatus.changesSaved")}</li>
                <li>{t("dexCreationStatus.workflowRuns")}</li>
                <li>{t("dexCreationStatus.changesLive")}</li>
                <li>{t("dexCreationStatus.takes2to5Minutes")}</li>
              </ul>
              <p className="text-xs text-gray-400 mt-2 italic">
                {t("dexCreationStatus.trackProgress")}
              </p>
            </div>
          </div>
        ) : (
          <div className="mb-4 p-3 bg-warning/10 rounded-lg border border-warning/20">
            <h4 className="text-base font-bold mb-2 flex items-center">
              <div className="i-mdi:progress-clock text-warning mr-2 h-5 w-5"></div>
              {t("dexCreationStatus.step2Building")}
            </h4>
            <p className="text-sm text-gray-300 mb-2">
              {t("dexCreationStatus.buildingDesc")}
            </p>
            <p className="text-xs text-gray-400 mb-3">
              {t("dexCreationStatus.seeLinkWhenComplete")}
            </p>

            <div className="mt-3 pt-3 border-t border-light/10">
              <h5 className="text-sm font-bold mb-2 flex items-center">
                <div className="i-mdi:information-outline text-warning mr-2 h-4 w-4"></div>
                {t("dexCreationStatus.aboutFutureUpdates")}
              </h5>
              <p className="text-xs text-gray-300">
                {t("dexCreationStatus.futureUpdatesDesc")}
              </p>
            </div>
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-light/10">
          <h4 className="text-base font-bold mb-3">
            {t("dexCreationStatus.updatesDeploymentStatus")}
          </h4>
          <p className="text-xs text-gray-400 mb-3">
            {t("dexCreationStatus.statusDesc")}
          </p>
          <WorkflowStatus
            dexId={dexData.id}
            workflowName={t("dexCreationStatus.deployWorkflowName")}
            onSuccessfulDeployment={handleSuccessfulDeployment}
          />
        </div>
      </Card>
    );
  }

  if (dexData.id && !dexData.repoUrl) {
    return (
      <Card variant="error" className="mb-6" id="dex-creation-status">
        <p className="text-sm text-gray-300 mb-2">
          <Trans
            i18nKey="dexCreationStatus.repoErrorNote"
            components={[<span key="0" className="text-red-300 font-medium" />]}
          />
        </p>
        <p className="text-sm text-gray-300 mb-4">
          {t("dexCreationStatus.retryNote")}
        </p>
        <Button
          onClick={handleRetryForking}
          disabled={isForking}
          variant="danger"
          size="sm"
          isLoading={isForking}
          loadingText={t("dexCreationStatus.retrying")}
        >
          {t("dexCreationStatus.retryRepoCreation")}
        </Button>
      </Card>
    );
  }

  return null;
}
