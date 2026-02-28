import {
  PointCampaignDetail,
  PointCampaignFormType,
  PointCampaignFormValues,
} from "~/types/points";
import { useOperatePointsStage } from "./usePointsService";
import { toast } from "react-toastify";
import { modal } from "@orderly.network/ui";
import { formatDate } from "~/utils/date";
import { useTranslation } from "~/i18n";

type UseOperatePointsProps = {
  type: PointCampaignFormType;
  pointDetail?: PointCampaignDetail | null;
  onSuccess: () => void;
};

export function useOperatePoints(props: UseOperatePointsProps) {
  const { type, pointDetail } = props;
  const { t } = useTranslation();

  const [updatePointCampaign, { isMutating }] = useOperatePointsStage();

  const getFormData = (values: PointCampaignFormValues) => ({
    stage_name: values.stage_name,
    stage_description: values.stage_description,
    start_date: values.start_date
      ? formatDate(values.start_date, "yyyy-MM-dd")
      : undefined,
    end_date: values.is_continuous
      ? undefined
      : values.end_date
        ? formatDate(values.end_date, "yyyy-MM-dd")
        : undefined,
    is_continuous: values.is_continuous,
    volume_boost: Number(values.volume_boost ?? 0.1),
    pnl_boost: Number(values.pnl_boost ?? 1),
    l1_referral_boost: Number(values.l1_referral_boost ?? 10),
    l2_referral_boost: Number(values.l2_referral_boost ?? 5),
  });

  const operateCampaign = async (values: PointCampaignFormValues) => {
    try {
      const formData = getFormData(values);
      const stage_id =
        type === PointCampaignFormType.Edit ? pointDetail?.stage_id : undefined;
      const res = await updatePointCampaign({ stage_id, ...formData });

      if (res.success) {
        if (type === PointCampaignFormType.Create) {
          toast.success(
            <div>
              {t("points.operate.create.toast.title")}
              <div className="text-[13px] text-base-contrast-54">
                {t("points.operate.create.toast.description")}
              </div>
            </div>
          );
        } else if (type === PointCampaignFormType.Edit) {
          toast.success(
            <div>
              {t("points.operate.edit.toast.title")}
              <div className="text-[13px] text-base-contrast-54">
                {t("points.operate.edit.toast.description")}
              </div>
            </div>
          );
        }
        props.onSuccess();
      } else {
        toast.error(res.message);
      }
    } catch (err) {
      console.error("Error creating campaign:", err);
      const errorMessage =
        err instanceof Error ? err.message : t("points.operate.error");
      toast.error(errorMessage);
      return err;
    }
  };

  const onSubmit = (values: PointCampaignFormValues) => {
    modal.confirm({
      title: t("points.operate.modal.title"),
      okLabel: t("points.operate.modal.ok"),
      content: (
        <span className="text-warning">
          {t("points.operate.modal.content")}
        </span>
      ),
      size: "md",
      onOk: () => operateCampaign(values),
    });
  };

  return {
    onSubmit,
    isMutating,
  };
}
