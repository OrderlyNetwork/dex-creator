import { useMemo } from "react";
import { Card } from "../../../../components/Card";
import { Button } from "../../../../components/Button";
import {
  PointCampaign,
  PointCampaignFormType,
  PointCampaignStatus,
} from "~/types/points";
import { usePointsDetail } from "../../hooks/usePointsService";
import { usePointsForm } from "../../hooks/usePointsForm";
import { useOperatePoints } from "../../hooks/useOperatePoints";
import { CoefficientInput } from "./CoefficientInput";
import { PointsBasicInput } from "./PointsBasicInput";
import { add } from "date-fns";

type PointCampaignFormProps = {
  type: PointCampaignFormType;
  currentPoints?: PointCampaign | null;
  latestPoints?: PointCampaign;
  close: () => void;
  refresh: () => void;
};

export function PointCampaignForm(props: PointCampaignFormProps) {
  const { currentPoints, type, latestPoints } = props;

  const { data: pointDetail } = usePointsDetail(currentPoints?.stage_id);

  const { values, errors, setValue, validateForm } = usePointsForm({
    type,
    pointDetail,
  });

  const { onSubmit, isMutating } = useOperatePoints({
    type,
    pointDetail,
    onSuccess: () => {
      props.refresh();
      props.close();
    },
  });

  const handleSave = () => {
    if (!validateForm()) {
      return;
    }
    onSubmit(values);
  };

  const stages = useMemo(() => {
    if (type === PointCampaignFormType.Create) {
      // next stage
      return latestPoints ? (latestPoints.epoch_period || 0) + 1 : 1;
    }

    return pointDetail?.epoch_period;
  }, [latestPoints, pointDetail, type]);

  const getTitle = () => {
    if (type === PointCampaignFormType.Create) {
      return "Create Your Points Campaign";
    } else if (type === PointCampaignFormType.Edit) {
      return "Edit Your Points Campaign";
    } else if (type === PointCampaignFormType.View) {
      return "View Your Points Campaign";
    }
  };

  const readonly = type === PointCampaignFormType.View;

  const disabledStartDate = useMemo(() => {
    if (type === PointCampaignFormType.Edit && currentPoints) {
      return readonly || currentPoints?.status === PointCampaignStatus.Active;
    }

    return readonly;
  }, [type, currentPoints, readonly]);

  const getMinStartTime = () => {
    const tomorrow = add(new Date(), { days: 1 });
    const endTime = latestPoints?.end_time
      ? latestPoints.end_time * 1000
      : undefined;

    if (endTime) {
      return endTime > tomorrow.getTime() ? new Date(endTime) : tomorrow;
    }

    return tomorrow;
  };

  return (
    <div>
      <div
        className="text-sm text-gray-400 hover:text-primary-light mb-2 inline-flex items-center"
        onClick={props.close}
      >
        <div className="i-mdi:arrow-left h-4 w-4 mr-1"></div>
        Back to Point Campaign Setup
      </div>

      <h1 className="text-lg md:text-2xl font-bold gradient-text">
        {getTitle()}
      </h1>
      <Card className="p-4 md:p-8 bg-white/[0.04] border-line-12 mt-6 md:mt-12">
        <div className="flex flex-col gap-8">
          <PointsBasicInput
            values={values}
            setValue={setValue}
            readonly={readonly}
            errors={errors}
            stages={stages}
            disabledStartDate={disabledStartDate}
            minStartTime={getMinStartTime()}
          />

          <CoefficientInput
            values={values}
            setValue={setValue}
            readonly={readonly}
            errors={errors}
          />

          {!readonly && (
            <div className="flex justify-end">
              <Button
                variant="primary"
                size="md"
                onClick={handleSave}
                isLoading={isMutating}
              >
                Save & Publish
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
