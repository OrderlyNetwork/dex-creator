import { useState } from "react";
import { useTranslation } from "~/i18n";
import ImagePaste from "./ImagePaste";
import { Button } from "./Button";
import { Card } from "./Card";
import { SharePnLDialogWidget } from "@orderly.network/ui-share";
import { OrderlyAppProvider } from "@orderly.network/react-app";
import { WalletConnectorProvider } from "@orderly.network/wallet-connector";

interface PnLPostersSectionProps {
  pnlPosters: (Blob | null)[];
  onChange: (posters: (Blob | null)[]) => void;
  idPrefix?: string;
}

export default function PnLPostersSection({
  pnlPosters,
  onChange,
  idPrefix = "",
}: PnLPostersSectionProps) {
  const { t } = useTranslation();
  const [showPreview, setShowPreview] = useState(false);

  const handlePosterChange = (index: number) => (blob: Blob | null) => {
    const newPosters = [...pnlPosters];
    newPosters[index] = blob;
    onChange(newPosters);
  };

  const addPoster = () => {
    if (pnlPosters.length < 8) {
      onChange([...pnlPosters, null]);
    }
  };

  const removePoster = (index: number) => {
    const newPosters = pnlPosters.filter((_, i) => i !== index);
    onChange(newPosters);
  };

  const getPosterImageType = () => "pnlPoster" as const;

  // Convert blobs to object URLs for preview widget
  const posterUrls = pnlPosters
    .filter(Boolean)
    .map(blob => (blob ? URL.createObjectURL(blob) : null))
    .filter(Boolean) as string[];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-md font-medium">
            {t("pnlPostersSection.title")}{" "}
            <span className="text-gray-400 text-sm font-normal">
              ({t("pnlPostersSection.optional")})
            </span>
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            {t("pnlPostersSection.description")}
          </p>
        </div>
        {pnlPosters.length < 8 && (
          <Button
            type="button"
            onClick={addPoster}
            variant="secondary"
            size="sm"
            className="shrink-0"
          >
            <span className="flex items-center gap-1.5">
              <div className="i-mdi:plus h-4 w-4"></div>
              {t("pnlPostersSection.addPoster")}
            </span>
          </Button>
        )}
      </div>

      {pnlPosters.length === 0 ? (
        <Card variant="default" className="p-6 text-center">
          <div className="i-mdi:image-multiple-outline h-12 w-12 mx-auto text-gray-500 mb-3"></div>
          <p className="text-sm text-gray-400 mb-3">
            {t("pnlPostersSection.noPostersYet")}
          </p>
          <Button type="button" onClick={addPoster} variant="primary" size="sm">
            <span className="flex items-center gap-1.5">
              <div className="i-mdi:plus h-4 w-4"></div>
              {t("pnlPostersSection.addFirstPoster")}
            </span>
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pnlPosters.map((poster, index) => (
            <div key={index} className="relative">
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-gray-200">
                  {t("pnlPostersSection.poster")} {index + 1}
                </label>
                <button
                  type="button"
                  onClick={() => removePoster(index)}
                  className="text-xs text-error hover:text-error/70 transition-colors"
                >
                  {t("pnlPostersSection.remove")}
                </button>
              </div>
              <ImagePaste
                id={`${idPrefix}pnlPoster${index}`}
                label=""
                value={poster || undefined}
                onChange={handlePosterChange(index)}
                imageType={getPosterImageType()}
                helpText={t("pnlPostersSection.helpTextAspectRatio")}
              />
            </div>
          ))}
        </div>
      )}

      {pnlPosters.length > 0 && pnlPosters.length < 8 && (
        <div className="text-center">
          <Button
            type="button"
            onClick={addPoster}
            variant="secondary"
            size="sm"
          >
            <span className="flex items-center gap-1.5">
              <div className="i-mdi:plus h-4 w-4"></div>
              {t("pnlPostersSection.addAnotherPoster", {
                count: pnlPosters.length,
              })}
            </span>
          </Button>
        </div>
      )}

      <Card variant="default" className="p-4 text-xs text-gray-400">
        <div className="space-y-3">
          <div>
            <span className="font-medium text-primary-light">
              {t("pnlPostersSection.aboutPnLPosters")}:
            </span>{" "}
            {t("pnlPostersSection.aboutPnLPostersDesc")}
          </div>

          <div className="bg-background-light/30 rounded-lg p-3 border border-primary-light/20">
            <div className="font-medium text-primary-light mb-2">
              {t("pnlPostersSection.designGuidelines")}:
            </div>
            <ul className="space-y-1.5 text-xs">
              <li className="flex items-start gap-2">
                <div className="i-mdi:check-circle text-green-400 h-3 w-3 mt-0.5 flex-shrink-0"></div>
                <span>{t("pnlPostersSection.darkBackgroundArea")}</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="i-mdi:check-circle text-green-400 h-3 w-3 mt-0.5 flex-shrink-0"></div>
                <span>{t("pnlPostersSection.textReadability")}</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="i-mdi:check-circle text-green-400 h-3 w-3 mt-0.5 flex-shrink-0"></div>
                <span>{t("pnlPostersSection.visualBalance")}</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="i-mdi:check-circle text-green-400 h-3 w-3 mt-0.5 flex-shrink-0"></div>
                <span>{t("pnlPostersSection.format")}</span>
              </li>
            </ul>
          </div>

          <div className="text-xs text-gray-500">
            {t("pnlPostersSection.customBackgroundsNote")}
          </div>
        </div>
      </Card>

      {/* Preview button and widget */}
      <div className="border-t border-gray-600/30 pt-4">
        <Button
          type="button"
          onClick={() => setShowPreview(!showPreview)}
          variant="secondary"
          size="sm"
        >
          <span className="flex items-center gap-1.5">
            <div
              className={`h-4 w-4 ${showPreview ? "i-mdi:eye-off-outline" : "i-mdi:eye-outline"}`}
            ></div>
            {showPreview
              ? t("common.hide")
              : t("pnlPostersSection.preview")}{" "}
            {t("pnlPostersSection.pnlSharing")}
          </span>
        </Button>

        {showPreview && (
          <div className="mt-4 slide-fade-in">
            <WalletConnectorProvider>
              <OrderlyAppProvider
                brokerId="orderly"
                brokerName="Orderly"
                networkId="testnet"
              >
                <div className="border border-primary-light/20 rounded-lg p-4 bg-background-light/50">
                  <p className="text-xs text-gray-400 mb-3">
                    {t("pnlPostersSection.previewWidgetDescription")}
                  </p>
                  <form
                    onSubmit={e => {
                      e.preventDefault();
                      e.stopPropagation();
                      return false;
                    }}
                    action="#"
                    method="get"
                  >
                    <SharePnLDialogWidget
                      pnl={{
                        entity: {
                          symbol: "PERP_ETH_USDC",
                          roi: 1.22 * 100,
                          side: "LONG",
                          openPrice: 2518.74,
                          openTime: 1725345164501,
                          markPrice: 2518.81,
                          quantity: 0.0794,
                        },
                        leverage: 10,
                        backgroundImages: posterUrls,
                      }}
                    />
                  </form>
                </div>
              </OrderlyAppProvider>
            </WalletConnectorProvider>
          </div>
        )}
      </div>
    </div>
  );
}
