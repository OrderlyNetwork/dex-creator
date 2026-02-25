import { useState, useEffect } from "react";
import { Card } from "../../components/Card";
import { Button } from "../../components/Button";
import {
  getAutoReferralInfo,
  updateAutoReferral,
  type AutoReferralSettings,
  type AutoReferralInfo,
} from "../../utils/orderly";
import { toast } from "react-toastify";
import { useTranslation } from "~/i18n";

interface SingleLevelSettingsProps {
  hasValidKey: boolean;
  accountId: string | null;
  orderlyKey: Uint8Array | null;
  onLoadComplete?: () => void;
  isMultiLevelEnabled: boolean;
}

export default function SingleLevelSettings({
  hasValidKey,
  accountId,
  orderlyKey,
  onLoadComplete,
  isMultiLevelEnabled,
}: SingleLevelSettingsProps) {
  const { t } = useTranslation();
  const [isLoadingReferralInfo, setIsLoadingReferralInfo] = useState(false);
  const [isSavingReferral, setIsSavingReferral] = useState(false);
  const [referralInfo, setReferralInfo] = useState<AutoReferralInfo | null>(
    null
  );

  const [requiredTradingVolume, setRequiredTradingVolume] = useState(10000);
  const [maxRebate, setMaxRebate] = useState(20);
  const [sliderPosition, setSliderPosition] = useState(50);
  const [description, setDescription] = useState("");
  const [isEnabled, setIsEnabled] = useState(true);
  const [maxRebateError, setMaxRebateError] = useState<string | null>(null);

  const stepSize = maxRebate > 0 ? 100 / maxRebate : 1;
  const referrerRebate = Math.round((maxRebate * sliderPosition) / 100);
  const refereeRebate = maxRebate - referrerRebate;

  const validateMaxRebate = (value: number): string | null => {
    if (value <= 0) {
      return t("referral.singleLevel.maxRebateMin");
    }
    if (value > 100) {
      return t("referral.singleLevel.maxRebateMax");
    }
    return null;
  };

  const handleMaxRebateChange = (value: number) => {
    setMaxRebate(value);
    const error = validateMaxRebate(value);
    setMaxRebateError(error);
  };

  useEffect(() => {
    if (hasValidKey && accountId && orderlyKey) {
      loadReferralInfo();
    }
  }, [hasValidKey, accountId, orderlyKey]);

  const loadReferralInfo = async () => {
    if (!hasValidKey || !accountId || !orderlyKey) return;

    setIsLoadingReferralInfo(true);
    try {
      const info = await getAutoReferralInfo(accountId, orderlyKey);

      if (!info) {
        setReferralInfo(null);
        setRequiredTradingVolume(10000);
        setMaxRebate(20);
        setMaxRebateError(null);
        setSliderPosition(50);
        setDescription("");
        setIsEnabled(false);
        if (onLoadComplete) onLoadComplete();
        return;
      }

      setReferralInfo(info);
      setRequiredTradingVolume(info.required_trading_volume);
      const maxRebateValue = info.max_rebate * 100;
      setMaxRebate(maxRebateValue);
      setMaxRebateError(null);

      const referrerRebateValue = info.referrer_rebate * 100;
      const sliderPos =
        maxRebateValue > 0 ? (referrerRebateValue / maxRebateValue) * 100 : 50;
      setSliderPosition(Math.round(sliderPos));

      setDescription(info.description);
      setIsEnabled(info.enable);
      if (onLoadComplete) onLoadComplete();
    } catch (error) {
      // If multi-level referral is enabled, skip toast if permission denied
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      //TODO: use error code
      const shouldSkipToast =
        errorMessage.includes(
          "Permission denied. Multilevel referral is already enabled."
        ) ||
        errorMessage.includes(
          "You have exceeded the rate limit, please try again in 1 seconds."
        );

      if (shouldSkipToast) {
        console.warn(
          "Skipping auto referral info toast due to permission error:",
          errorMessage,
          error
        );
      } else {
        console.error("Failed to load referral info:", error);
        toast.error(t("referral.singleLevel.loadFailed"));
      }
    } finally {
      setIsLoadingReferralInfo(false);
    }
  };

  const handleSaveReferralSettings = async () => {
    if (isMultiLevelEnabled) {
      toast.error(t("referral.singleLevel.cannotModifyWhenMlr"));
      return;
    }

    if (!hasValidKey || !accountId || !orderlyKey) {
      toast.error(t("referral.singleLevel.keyRequiredSave"));
      return;
    }

    const maxRebateValidationError = validateMaxRebate(maxRebate);
    if (maxRebateValidationError) {
      setMaxRebateError(maxRebateValidationError);
      toast.error(t("referral.singleLevel.fixValidation"));
      return;
    }

    setIsSavingReferral(true);

    try {
      const settings: AutoReferralSettings = {
        required_trading_volume: requiredTradingVolume,
        max_rebate: maxRebate / 100,
        referrer_rebate: referrerRebate / 100,
        referee_rebate: refereeRebate / 100,
        enable: isEnabled,
        description: description,
      };

      await updateAutoReferral(accountId, orderlyKey, settings);
      toast.success(t("referral.singleLevel.saved"));

      await loadReferralInfo();
    } catch (error) {
      console.error("Failed to save referral settings:", error);
      toast.error(t("referral.singleLevel.saveFailed"));
    } finally {
      setIsSavingReferral(false);
    }
  };

  const isDisabled = isMultiLevelEnabled;

  return (
    <>
      {/* Multi-Level Referral Activated Banner */}
      {isMultiLevelEnabled && <MLRActivatedBanner />}

      {/* Single-level referral settings section */}
      <Card
        className={`bg-[#161726] border border-[1px] border-[#FFFFFF]/[0.12] ${isDisabled ? "opacity-30" : ""}`}
      >
        <h2 className="text-xl font-medium mb-4">
          {t("referral.singleLevel.configTitle")}
        </h2>
        <p className="text-gray-300 mb-6">
          {t("referral.singleLevel.configIntro")}
        </p>

        {isLoadingReferralInfo ? (
          <div className="flex items-center justify-center py-8">
            <div className="i-svg-spinners:pulse-rings-multiple w-8 h-8 text-primary"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Enable Toggle - Top of form */}
            <div className="flex items-center justify-between p-4 bg-background-dark/30 rounded-lg border border-light/10">
              <div className="flex-1 pr-4">
                <h3 className="text-sm font-medium mb-1">
                  {t("referral.singleLevel.autoProgram.title")}
                </h3>
                <p className="text-xs text-gray-400">
                  {t("referral.singleLevel.autoProgram.hint")}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsEnabled(!isEnabled)}
                disabled={isDisabled}
                className={`relative inline-flex h-6 w-12 flex-shrink-0 items-center rounded-full transition-colors ${
                  isEnabled ? "bg-primary" : "bg-gray-600"
                } ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isEnabled ? "translate-x-7" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {/* Form Fields */}
            <div
              className={`space-y-6 ${!isEnabled || isDisabled ? "opacity-60" : ""}`}
            >
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {t("referral.singleLevel.requiredVolumeLabel")}
                  </label>
                  <input
                    type="number"
                    value={requiredTradingVolume}
                    onChange={e =>
                      setRequiredTradingVolume(Number(e.target.value))
                    }
                    className="w-full px-3 py-2 rounded-lg bg-background-dark border border-light/10 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    min="0"
                    step="1000"
                    disabled={!isEnabled || isDisabled}
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    {t("referral.singleLevel.requiredVolumeHint")}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    {t("referral.singleLevel.maxRebateLabel")}
                  </label>
                  <input
                    type="number"
                    value={maxRebate}
                    onChange={e =>
                      handleMaxRebateChange(Number(e.target.value))
                    }
                    className={`w-full px-3 py-2 rounded-lg bg-background-dark border text-white disabled:opacity-50 disabled:cursor-not-allowed ${
                      maxRebateError
                        ? "border-error focus:border-error"
                        : "border-light/10 focus:border-primary"
                    }`}
                    min="0"
                    max="100"
                    step="0.1"
                    disabled={!isEnabled || isDisabled}
                  />
                  {maxRebateError ? (
                    <p className="text-xs text-error mt-1">{maxRebateError}</p>
                  ) : (
                    <p className="text-xs text-gray-400 mt-1">
                      {t("referral.singleLevel.maxRebateHint")}
                    </p>
                  )}
                </div>
              </div>

              {/* Rebate Split Slider */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-sm font-medium text-gray-300">
                      {t("referral.singleLevel.referrerRebate")}
                    </h4>
                    <p className="text-lg font-bold">{referrerRebate}%</p>
                  </div>
                  <div className="text-right">
                    <h4 className="text-sm font-medium text-gray-300">
                      {t("referral.singleLevel.refereeRebate")}
                    </h4>
                    <p className="text-lg font-bold">{refereeRebate}%</p>
                  </div>
                </div>

                <div className="relative">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step={stepSize}
                    value={sliderPosition}
                    onChange={e => setSliderPosition(Number(e.target.value))}
                    disabled={!isEnabled || isDisabled}
                    className="w-full h-2 bg-gradient-to-r from-secondary to-primary rounded-lg appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed slider"
                  />
                  <style>{`
                    .slider::-webkit-slider-thumb {
                      appearance: none;
                      width: 20px;
                      height: 20px;
                      border-radius: 50%;
                      background: #ffffff;
                      cursor: pointer;
                      border: 2px solid rgb(176, 132, 233);
                      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
                    }
                    .slider::-moz-range-thumb {
                      width: 20px;
                      height: 20px;
                      border-radius: 50%;
                      background: #ffffff;
                      cursor: pointer;
                      border: 2px solid rgb(176, 132, 233);
                      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
                    }
                  `}</style>
                </div>

                <p className="text-xs text-gray-400 text-center">
                  {t("referral.singleLevel.rebateSplitHint", { maxRebate })}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  {t("referral.singleLevel.descriptionLabel")}
                </label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-background-dark border border-light/10 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  rows={3}
                  placeholder={t("referral.singleLevel.descriptionPlaceholder")}
                  disabled={!isEnabled || isDisabled}
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleSaveReferralSettings}
                disabled={isSavingReferral || !!maxRebateError || isDisabled}
                className="flex items-center gap-2"
              >
                {isSavingReferral ? (
                  <>
                    <div className="i-svg-spinners:pulse-rings-multiple w-4 h-4"></div>
                    {t("referral.saving")}
                  </>
                ) : (
                  <>
                    <div className="i-mdi:content-save w-4 h-4"></div>
                    {t("referral.singleLevel.saveButton")}
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Current Settings Display */}
      {referralInfo && (
        <Card className={isDisabled ? "opacity-30" : ""}>
          <h3 className="text-lg font-medium mb-4">
            {t("referral.singleLevel.currentSettings")}
          </h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">
                  {t("referral.singleLevel.tradingVolumeRequired")}
                </span>
                <span>
                  {referralInfo.required_trading_volume.toLocaleString()} USDC
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">
                  {t("referral.singleLevel.maxRebateDisplay")}
                </span>
                <span>{(referralInfo.max_rebate * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">
                  {t("referral.singleLevel.referrerRebateDisplay")}
                </span>
                <span>{(referralInfo.referrer_rebate * 100).toFixed(1)}%</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">
                  {t("referral.singleLevel.refereeRebateDisplay")}
                </span>
                <span>{(referralInfo.referee_rebate * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">
                  {t("referral.singleLevel.status")}
                </span>
                <span
                  className={
                    referralInfo.enable ? "text-success" : "text-warning"
                  }
                >
                  {referralInfo.enable
                    ? t("referral.singleLevel.statusEnabled")
                    : t("referral.singleLevel.statusDisabled")}
                </span>
              </div>
            </div>
          </div>
          {referralInfo.description && (
            <div className="mt-4 pt-4 border-t border-light/10">
              <span className="text-gray-400 text-sm">
                {t("referral.singleLevel.descriptionLabel")}:
              </span>
              <p className="text-sm mt-1">{referralInfo.description}</p>
            </div>
          )}
        </Card>
      )}
    </>
  );
}

function MLRActivatedBanner() {
  const { t } = useTranslation();
  return (
    <div className="flex items-center gap-[4px] rounded-[8px] p-3 bg-[#D9AB52]/20 mb-6">
      <span className="flex-shrink-0 flex items-center justify-center w-5 h-5">
        <svg
          width="17"
          height="17"
          viewBox="0 0 17 17"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="block mx-auto my-auto"
        >
          <path
            d="M8.33333 0C3.73083 0 0 3.73083 0 8.33333C0 12.9358 3.73083 16.6667 8.33333 16.6667C12.9358 16.6667 16.6667 12.9358 16.6667 8.33333C16.6667 3.73083 12.9358 0 8.33333 0ZM8.33333 4.16667C8.79333 4.16667 9.16667 4.54 9.16667 5V9.16667C9.16667 9.62667 8.79333 10 8.33333 10C7.87333 10 7.5 9.62667 7.5 9.16667V5C7.5 4.54 7.87333 4.16667 8.33333 4.16667ZM8.33333 10.8333C8.79333 10.8333 9.16667 11.2067 9.16667 11.6667C9.16667 12.1267 8.79333 12.5 8.33333 12.5C7.87333 12.5 7.5 12.1267 7.5 11.6667C7.5 11.2067 7.87333 10.8333 8.33333 10.8333Z"
            fill="#D9AB52"
          />
        </svg>
      </span>
      <p className="flex-1 text-[12px] font-medium leading-[15px] tracking-[0.36px] text-[#D9AB52]">
        {t("referral.singleLevel.mlrActivatedBanner")}
      </p>
    </div>
  );
}
