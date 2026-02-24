import {
  PointCampaignFormErrors,
  PointCampaignFormValues,
} from "~/types/points";
import { PointFormInput } from "../PointFormInput";
import { DatePicker } from "@orderly.network/ui";
import { cn } from "~/utils/css";
import { FormLabel } from "../FormLabel";
import { Tooltip } from "~/components/tooltip";
import { TooltipIcon } from "~/icons/TooltipIcon";
import { Switch } from "~/components/switch";
import { useTranslation } from "~/i18n";

type PointsBasicInputProps = {
  values: PointCampaignFormValues;
  setValue: <K extends keyof PointCampaignFormValues>(
    field: K,
    value: PointCampaignFormValues[K]
  ) => void;
  readonly: boolean;
  errors: PointCampaignFormErrors;
  stages?: number;
  disabledStartDate: boolean;
  minStartTime: Date;
};

export function PointsBasicInput(props: PointsBasicInputProps) {
  const {
    values,
    setValue,
    readonly,
    errors,
    stages,
    disabledStartDate,
    minStartTime,
  } = props;

  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-base font-semibold text-base-contrast-80 leading-6 tracking-[0.48px]">
        {t("points.basic.title")}
      </h2>

      {/* Campaign Title and Stages row */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <PointFormInput
            label={t("points.basic.campaignTitle.label")}
            placeholder={t("points.basic.campaignTitle.placeholder")}
            value={values.stage_name}
            onChange={e => setValue("stage_name", e.target.value)}
            disabled={readonly}
            error={!!errors.stage_name}
            errorMessage={errors.stage_name}
          />
        </div>
        <div className="flex-1">
          <PointFormInput
            label={t("points.basic.stages.label")}
            tooltip={t("points.basic.stages.tooltip")}
            value={stages?.toString() || ""}
            disabled
          />
        </div>
      </div>

      {/* Description */}
      <div>
        <PointFormInput
          label={t("points.basic.description.label")}
          placeholder={t("points.basic.description.placeholder")}
          type="textarea"
          value={values.stage_description}
          onChange={e => setValue("stage_description", e.target.value)}
          disabled={readonly}
          error={!!errors.stage_description}
          errorMessage={errors.stage_description}
        />
      </div>

      {/* Start Date and End Date row */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className={cn(disabledStartDate && "cursor-not-allowed")}>
            <FormLabel label="Start Date (UTC)" className="h-5" />
            <DatePicker
              value={values.start_date}
              onChange={date => setValue("start_date", date)}
              disabled={{ before: minStartTime }}
              className={cn(
                "w-full border bg-base-8 focus:ring-0 rounded-[6px]",
                errors.start_date
                  ? "border-error focus:border-error"
                  : "border-transparent",
                disabledStartDate && "pointer-events-none"
              )}
              placeholder={t("points.basic.startDate.placeholder")}
            />
            {errors.start_date ? (
              <div className="flex items-center gap-1 mt-1 pl-1">
                <div className="w-1 h-1 rounded-full bg-error"></div>
                <p className="text-xs text-error leading-[18px] tracking-[0.36px]">
                  {errors.start_date}
                </p>
              </div>
            ) : (
              <div className="flex items-center gap-1 mt-1 pl-1">
                <div className="w-1 h-1 rounded-full bg-base-contrast-54"></div>
                <p className="text-xs text-base-contrast-54 leading-[18px] tracking-[0.36px]">
                  {t("points.basic.startDate.help")}
                </p>
              </div>
            )}
          </div>
        </div>
        <div className="flex-1">
          <div className={cn(readonly && "cursor-not-allowed")}>
            <div className="flex items-center justify-between gap-1 mb-1 md:mb-2 flex-wrap">
              <FormLabel
                label={t("points.basic.endDate.label")}
                className="mb-0 md:mb-0"
              />
              <div className="flex items-center gap-1">
                <Tooltip
                  delayDuration={300}
                  align="center"
                  sideOffset={4}
                  className="max-w-[276px]"
                  content={t("points.basic.endDate.tooltip")}
                >
                  <TooltipIcon />
                </Tooltip>
                <span className="text-xs font-semibold text-base-contrast-54 whitespace-nowrap">
                  {t("points.basic.endDate.recurring")}
                </span>
                <Switch
                  checked={values.is_continuous}
                  onCheckedChange={value => setValue("is_continuous", value)}
                  disabled={readonly}
                />
              </div>
            </div>

            {values.is_continuous ? (
              <PointFormInput
                value={t("points.basic.endDate.recurring")}
                classNames={{ root: "mb-0" }}
                disabled
              />
            ) : (
              <DatePicker
                value={values.end_date}
                onChange={date => setValue("end_date", date)}
                disabled={{ before: values.start_date || minStartTime }}
                className={cn(
                  "w-full border bg-base-8 focus:ring-0 rounded-[6px]",
                  errors.end_date
                    ? "border-error focus:border-error"
                    : "border-transparent",
                  readonly && "pointer-events-none"
                )}
                placeholder={t("points.basic.endDate.placeholder")}
              />
            )}
            {!values.is_continuous && (
              <>
                {errors.end_date ? (
                  <div className="flex items-center gap-1 mt-1 pl-1">
                    <div className="w-1 h-1 rounded-full bg-error"></div>
                    <p className="text-xs text-error leading-[18px] tracking-[0.36px]">
                      {errors.end_date}
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 mt-1 pl-1">
                    <div className="w-1 h-1 rounded-full bg-base-contrast-54"></div>
                    <p className="text-xs text-base-contrast-54 leading-[18px] tracking-[0.36px]">
                      {t("points.basic.endDate.help")}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
