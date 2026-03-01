import { useState, useEffect } from "react";
import { useTranslation, Trans } from "~/i18n";
import { Button } from "./Button";

interface SwapFeeConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (feeBps: number) => void;
  currentFeeBps: number | null;
}

export default function SwapFeeConfigModal({
  isOpen,
  onClose,
  onSave,
  currentFeeBps,
}: SwapFeeConfigModalProps) {
  const { t } = useTranslation();
  const [feeBps, setFeeBps] = useState<string>(
    currentFeeBps !== null ? String(currentFeeBps) : ""
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setFeeBps(currentFeeBps !== null ? String(currentFeeBps) : "");
      setError(null);
    }
  }, [isOpen, currentFeeBps]);

  const parsedFee = feeBps.trim() !== "" ? parseInt(feeBps, 10) : null;
  const feePercentage = parsedFee !== null ? parsedFee / 100 : null;
  const userEarnings =
    feePercentage !== null ? (feePercentage * 0.7).toFixed(3) : null;
  const woofiShare =
    feePercentage !== null ? (feePercentage * 0.3).toFixed(3) : null;

  const handleSave = () => {
    if (feeBps.trim() === "") {
      setError(t("swapFeeConfigModal.feeRequired"));
      return;
    }

    const parsed = parseInt(feeBps, 10);
    if (isNaN(parsed)) {
      setError(t("swapFeeConfigModal.enterValidNumber"));
      return;
    }

    if (parsed < 0 || parsed > 100) {
      setError(t("swapFeeConfigModal.feeMustBeBetween"));
      return;
    }

    onSave(parsed);
    onClose();
  };

  const handleInputChange = (value: string) => {
    setFeeBps(value);
    setError(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center h-screen md:p-4">
      <div
        className="absolute inset-0 bg-background-dark/80 backdrop-blur-sm z-[1001]"
        onClick={onClose}
      ></div>

      <div className="relative z-[1002] w-full h-full md:h-auto md:max-w-2xl md:max-h-[90vh] overflow-y-auto p-6 md:rounded-xl bg-background-light border-0 md:border md:border-primary-light/20 shadow-2xl slide-fade-in">
        <div className="text-center mb-6">
          <div className="bg-blue-500/20 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <div className="i-mdi:swap-horizontal text-blue-400 w-8 h-8"></div>
          </div>
          <h2 className="text-xl font-bold mb-2 gradient-text">
            {t("swapFeeConfigModal.configureSwapFee")}
          </h2>
          <p className="text-gray-300 text-sm">
            {t("swapFeeConfigModal.setupFeeDesc")}
          </p>
        </div>

        <div className="space-y-4 mb-6">
          <div className="space-y-2">
            <label htmlFor="swapFeeBps" className="block text-sm font-medium">
              {t("swapFeeConfigModal.swapFeeBps")}
              <span className="text-danger ml-1">*</span>
            </label>
            <input
              type="number"
              id="swapFeeBps"
              value={feeBps}
              onChange={e => handleInputChange(e.target.value)}
              placeholder={t("swapFeeConfigModal.placeholder")}
              min="0"
              max="100"
              step="1"
              className={`w-full px-3 py-2 bg-background-card border rounded-lg text-sm focus:ring-1 ${
                error
                  ? "border-danger focus:border-danger focus:ring-danger/50"
                  : "border-light/10 focus:border-primary/50 focus:ring-primary/50"
              }`}
            />
            <p className="text-xs text-gray-400">
              {t("swapFeeConfigModal.enterFeeHelp")}
            </p>
            {error && (
              <p className="text-xs text-danger flex items-center gap-1">
                <div className="i-mdi:alert-circle w-3 h-3"></div>
                {error}
              </p>
            )}
          </div>

          {parsedFee !== null && !error && (
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 slide-fade-in">
              <div className="text-sm font-medium text-primary-light mb-2">
                {t("swapFeeConfigModal.feeBreakdown")}:
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-300">
                    {t("swapFeeConfigModal.totalSwapFee")}:
                  </span>
                  <span className="font-mono text-white">{feePercentage}%</span>
                </div>
                <div className="border-t border-light/10 my-2"></div>
                <div className="flex justify-between">
                  <span className="text-gray-300">
                    {t("swapFeeConfigModal.yourEarnings")}:
                  </span>
                  <span className="font-mono text-success">
                    {userEarnings}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">
                    {t("swapFeeConfigModal.woofiShare")}:
                  </span>
                  <span className="font-mono text-gray-400">{woofiShare}%</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-4">
          <div className="flex items-start gap-3">
            <div className="i-mdi:information-outline h-5 w-5 text-blue-300 mt-0.5"></div>
            <div>
              <h4 className="text-sm font-bold text-blue-300 mb-2">
                {t("swapFeeConfigModal.aboutSwapIntegration")}
              </h4>
              <div className="text-xs text-gray-300 space-y-2">
                <p>
                  <Trans
                    i18nKey="swapFeeConfigModal.swapPoweredByWoofi"
                    components={[
                      <span key="0" className="font-semibold text-primary" />,
                    ]}
                  />
                </p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>
                    <Trans
                      i18nKey="swapFeeConfigModal.evmOnly"
                      components={[
                        <span
                          key="0"
                          className="font-semibold text-blue-300"
                        />,
                      ]}
                    />
                  </li>
                  <li>
                    <Trans
                      i18nKey="swapFeeConfigModal.fixedBlockchainSupport"
                      components={[
                        <span
                          key="0"
                          className="font-semibold text-blue-300"
                        />,
                      ]}
                    />
                  </li>
                  <li>
                    <Trans
                      i18nKey="swapFeeConfigModal.feeSplit"
                      components={[
                        <span
                          key="0"
                          className="font-semibold text-blue-300"
                        />,
                        <span key="1" className="font-medium text-success" />,
                        <span key="2" className="font-medium text-primary" />,
                      ]}
                    />
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Graduation and Fee Claiming Information */}
        <div className="bg-warning/10 border border-warning/20 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <div className="i-mdi:alert-outline h-5 w-5 text-warning mt-0.5 flex-shrink-0"></div>
            <div>
              <h4 className="text-sm font-medium text-warning mb-2">
                {t("swapFeeConfigModal.importantGraduation")}
              </h4>
              <div className="text-xs text-gray-300 space-y-2">
                <p>
                  <Trans
                    i18nKey="swapFeeConfigModal.graduationRequired"
                    components={[
                      <span key="0" className="font-semibold text-warning" />,
                    ]}
                  />
                </p>
                <p>
                  <Trans
                    i18nKey="swapFeeConfigModal.manualFeeClaiming"
                    components={[
                      <span key="0" className="font-semibold text-warning" />,
                      <span key="1" className="font-semibold text-warning" />,
                    ]}
                  />
                </p>
                <p>
                  <Trans
                    i18nKey="swapFeeConfigModal.eoaWalletOnly"
                    components={[
                      <span key="0" className="font-semibold text-warning" />,
                      <span key="1" className="font-semibold text-warning" />,
                    ]}
                  />
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={onClose}>
            {t("common.cancel")}
          </Button>
          <Button variant="primary" onClick={handleSave}>
            {t("swapFeeConfigModal.saveConfiguration")}
          </Button>
        </div>
      </div>
    </div>
  );
}
