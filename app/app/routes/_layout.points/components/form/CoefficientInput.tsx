import {
  PointCampaignFormErrors,
  PointCampaignFormValues,
} from "~/types/points";
import { PointFormInput } from "../PointFormInput";
import { useTranslation } from "~/i18n";

type CoefficientInputProps = {
  values: PointCampaignFormValues;
  setValue: (field: keyof PointCampaignFormValues, value: string) => void;
  readonly: boolean;
  errors: PointCampaignFormErrors;
};

export function CoefficientInput(props: CoefficientInputProps) {
  const { values, setValue, readonly, errors } = props;
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-base font-semibold text-base-contrast-80 leading-6 tracking-[0.48px]">
        {t("points.coefficient.title")}
      </h2>

      {/* Trading volume and PNL row */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <PointFormInput
            type="number"
            label={t("points.coefficient.tradingVolume.label")}
            value={values.volume_boost}
            onChange={e => setValue("volume_boost", e.target.value)}
            helpText={t("points.coefficient.tradingVolume.help", {
              volumeBoost: values.volume_boost || 0.1,
            })}
            disabled={readonly}
            error={!!errors.volume_boost}
            errorMessage={errors.volume_boost}
          />
        </div>
        <div className="flex-1">
          <PointFormInput
            type="number"
            label={t("points.coefficient.pnl.label")}
            tooltip={t("points.coefficient.pnl.tooltip")}
            value={values.pnl_boost}
            onChange={e => setValue("pnl_boost", e.target.value)}
            helpText={t("points.coefficient.pnl.help", {
              pnlBoost: values.pnl_boost || 1,
            })}
            disabled={readonly}
            error={!!errors.pnl_boost}
            errorMessage={errors.pnl_boost}
          />
        </div>
      </div>

      {/* L1 and L2 Referral rate row */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <PointFormInput
            type="number"
            label={t("points.coefficient.l1.label")}
            tooltip={t("points.coefficient.l1.tooltip")}
            value={values.l1_referral_boost}
            onChange={e => setValue("l1_referral_boost", e.target.value)}
            helpText={t("points.coefficient.l1.help", {
              l1ReferralBoost: values.l1_referral_boost || 10,
            })}
            disabled={readonly}
            error={!!errors.l1_referral_boost}
            errorMessage={errors.l1_referral_boost}
          />
        </div>
        <div className="flex-1">
          <PointFormInput
            type="number"
            label={t("points.coefficient.l2.label")}
            tooltip={t("points.coefficient.l2.tooltip")}
            value={values.l2_referral_boost}
            onChange={e => setValue("l2_referral_boost", e.target.value)}
            helpText={t("points.coefficient.l2.help", {
              l2ReferralBoost: values.l2_referral_boost || 5,
            })}
            disabled={readonly}
            error={!!errors.l2_referral_boost}
            errorMessage={errors.l2_referral_boost}
          />
        </div>
      </div>
    </div>
  );
}
