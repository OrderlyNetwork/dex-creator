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

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-base font-semibold text-base-contrast-80 leading-6 tracking-[0.48px]">
        Basic information
      </h2>

      {/* Campaign Title and Stages row */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <PointFormInput
            label="Campaign Title"
            placeholder="Name your campaign title"
            value={values.stage_name}
            onChange={e => setValue("stage_name", e.target.value)}
            disabled={readonly}
            error={!!errors.stage_name}
            errorMessage={errors.stage_name}
          />
        </div>
        <div className="flex-1">
          <PointFormInput
            label="Stages"
            tooltip="This default number will increase as more campaigns are created. The stage is mainly used to help organize and track data in the future."
            value={stages?.toString() || ""}
            disabled
          />
        </div>
      </div>

      {/* Description */}
      <div>
        <PointFormInput
          label="Description"
          placeholder="Description..."
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
              placeholder="Select a date"
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
                  Starts at 00:00:00 UTC
                </p>
              </div>
            )}
          </div>
        </div>
        <div className="flex-1">
          <div className={cn(readonly && "cursor-not-allowed")}>
            <div className="flex items-center justify-between gap-1 mb-1 md:mb-2 flex-wrap">
              <FormLabel label="End Date (UTC)" className="mb-0 md:mb-0" />
              <div className="flex items-center gap-1">
                <Tooltip
                  delayDuration={300}
                  align="center"
                  sideOffset={4}
                  className="max-w-[276px]"
                  content="You can leave the end time unset for now. Before creating a new campaign, please set the end date for the current one."
                >
                  <TooltipIcon />
                </Tooltip>
                <span className="text-xs font-semibold text-base-contrast-54 whitespace-nowrap">
                  Recurring
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
                value={"Recurring"}
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
                placeholder="Select a date"
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
                      Ends at 23:59:59 UTC
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
