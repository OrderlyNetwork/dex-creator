import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "~/i18n";
import { toast } from "react-toastify";
import { get, post } from "../utils/apiClient";
import { Button } from "./Button";
import { Card } from "./Card";
import { DexData } from "../types/dex";

interface DexUpgradeProps {
  dexData: DexData | null;
  token: string | null;
}

interface UpgradeStatus {
  hasUpdates: boolean;
  behindBy: number;
  commits?: Array<{
    sha: string;
    message: string;
    author: string;
    date: string;
  }>;
}

export default function DexUpgrade({ dexData, token }: DexUpgradeProps) {
  const { t } = useTranslation();
  const [upgradeStatus, setUpgradeStatus] = useState<UpgradeStatus | null>(
    null
  );
  const [isUpgrading, setIsUpgrading] = useState(false);

  const filteredUpgradeCommits = useMemo(() => {
    if (!upgradeStatus?.commits || upgradeStatus.commits.length === 0) {
      return [];
    }

    const featCommits = upgradeStatus.commits.filter(c =>
      c.message.toLowerCase().startsWith("feat:")
    );
    const fixCommits = upgradeStatus.commits.filter(c =>
      c.message.toLowerCase().startsWith("fix:")
    );

    let displayCommits = [...featCommits];

    if (displayCommits.length < 5) {
      displayCommits = [...displayCommits, ...fixCommits].slice(0, 5);
    }

    if (displayCommits.length < 5) {
      displayCommits = upgradeStatus.commits.slice(0, 5);
    }

    return displayCommits;
  }, [upgradeStatus]);

  useEffect(() => {
    if (dexData && dexData.id && dexData.repoUrl && token) {
      const checkUpgradeStatus = async () => {
        try {
          const response = await get<UpgradeStatus>(
            `api/dex/${dexData.id}/upgrade-status`,
            token,
            {
              showToastOnError: false,
            }
          );
          setUpgradeStatus(response);
        } catch (error) {
          console.error("Error checking upgrade status:", error);
        }
      };

      checkUpgradeStatus();
    }
  }, [dexData, token]);

  const handleUpgrade = async () => {
    if (!dexData || !dexData.id) {
      toast.error(t("dexUpgrade.noDexData"));
      return;
    }

    setIsUpgrading(true);

    try {
      await post<{ message: string; success: boolean }>(
        `api/dex/${dexData.id}/upgrade`,
        {},
        token
      );

      toast.success(t("dexUpgrade.successToast"));

      setUpgradeStatus(null);
    } catch (error) {
      console.error("Error upgrading DEX:", error);
      toast.error(t("dexUpgrade.failedToast"));
    } finally {
      setIsUpgrading(false);
    }
  };

  if (!upgradeStatus || !upgradeStatus.hasUpdates || !dexData) {
    return null;
  }

  return (
    <Card className="my-6 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 slide-fade-in">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 bg-blue-500/20 p-2 rounded-full">
            <div className="i-mdi:arrow-up-circle text-blue-400 w-6 h-6"></div>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-1 flex items-center gap-2">
              {t("dexUpgrade.title")}
              <span className="text-xs bg-blue-500/30 text-blue-300 px-2 py-0.5 rounded-full">
                {t("dexUpgrade.new")}
              </span>
            </h3>
            <p className="text-gray-300 text-sm mb-2">{t("dexUpgrade.desc")}</p>
            {filteredUpgradeCommits.length > 0 && (
              <div className="mt-2 space-y-1">
                <p className="text-xs text-gray-400 font-medium mb-1">
                  {t("dexUpgrade.whatsNew")}:
                </p>
                {filteredUpgradeCommits.map((commit, idx) => (
                  <div
                    key={idx}
                    className="text-xs text-gray-400 flex items-start gap-1"
                  >
                    <div className="i-mdi:check-circle h-4 w-4 flex-shrink-0 text-blue-400"></div>
                    <span className="line-clamp-1">{commit.message}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <Button
          onClick={handleUpgrade}
          disabled={isUpgrading}
          className="whitespace-nowrap flex-shrink-0"
          variant="primary"
        >
          {isUpgrading ? (
            <>
              <div className="i-svg-spinners:pulse-rings-multiple h-4 w-4 mr-2"></div>
              {t("dexUpgrade.upgrading")}
            </>
          ) : (
            <>
              <div className="i-mdi:rocket-launch h-4 w-4 mr-2"></div>
              {t("dexUpgrade.upgradeDex")}
            </>
          )}
        </Button>
      </div>
    </Card>
  );
}
