import {
  PointCampaignFormErrors,
  PointCampaignFormValues,
} from "~/types/points";
import { PointFormInput } from "../PointFormInput";

type CoefficientInputProps = {
  values: PointCampaignFormValues;
  setValue: (field: keyof PointCampaignFormValues, value: string) => void;
  readonly: boolean;
  errors: PointCampaignFormErrors;
};

export function CoefficientInput(props: CoefficientInputProps) {
  const { values, setValue, readonly, errors } = props;
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-base font-semibold text-base-contrast-80 leading-6 tracking-[0.48px]">
        Coefficient
      </h2>

      {/* Trading volume and PNL row */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <PointFormInput
            type="number"
            label="Trading volume"
            value={values.volume_boost}
            onChange={e => setValue("volume_boost", e.target.value)}
            helpText={`Trading points = perp_volume × ${values.volume_boost || 0.1}`}
            disabled={readonly}
            error={!!errors.volume_boost}
            errorMessage={errors.volume_boost}
          />
        </div>
        <div className="flex-1">
          <PointFormInput
            type="number"
            label="PNL"
            tooltip="The profit or loss of each trade will be recorded in absolute value."
            value={values.pnl_boost}
            onChange={e => setValue("pnl_boost", e.target.value)}
            helpText={`PNL points = |PNL| × ${values.pnl_boost || 1}`}
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
            label="L1 Referral rate(%)"
            tooltip="Points earned from the first-level invitee's invitees"
            value={values.l1_referral_boost}
            onChange={e => setValue("l1_referral_boost", e.target.value)}
            helpText={`The first-level invitee's rebate inviter ${values.l1_referral_boost || 10}% of their points`}
            disabled={readonly}
            error={!!errors.l1_referral_boost}
            errorMessage={errors.l1_referral_boost}
          />
        </div>
        <div className="flex-1">
          <PointFormInput
            type="number"
            label="L2 Referral rate(%)"
            tooltip="Second-level referral rate percentage"
            value={values.l2_referral_boost}
            onChange={e => setValue("l2_referral_boost", e.target.value)}
            helpText={`The second-level invitee's rebate inviter ${values.l2_referral_boost || 5}% of their points`}
            disabled={readonly}
            error={!!errors.l2_referral_boost}
            errorMessage={errors.l2_referral_boost}
          />
        </div>
      </div>
    </div>
  );
}
