import { toast } from "react-toastify";
import { modal } from "@orderly.network/ui";
import { useDeletePointsStage } from "./usePointsService";
import { useTranslation } from "~/i18n";

type UseDeleteStagesProps = {
  stage_id?: number;
  onSuccess: () => void;
};

export function useDeleteStages(props: UseDeleteStagesProps) {
  const { t } = useTranslation();
  const [deletePointCampaign] = useDeletePointsStage(props.stage_id);

  const doDelete = async () => {
    try {
      const res = await deletePointCampaign({});
      if (res.success) {
        toast.success(
          <div>
            {t("points.delete.toast.title")}
            <div className="text-[13px] text-base-contrast-54">
              {t("points.delete.toast.description")}
            </div>
          </div>
        );
        props.onSuccess();
      } else {
        toast.error(res?.message || t("points.delete.toast.error"));
      }
    } catch (err: any) {
      console.error("Error deleting campaign:", err);
      toast.error(err?.message || t("points.delete.toast.error"));
    }
  };

  const onDelete = () => {
    modal.confirm({
      title: t("points.delete.modal.title"),
      okLabel: t("points.delete.modal.ok"),
      content: (
        <span className="text-warning">{t("points.delete.modal.content")}</span>
      ),
      size: "md",
      onOk: doDelete,
    });
  };

  return {
    onDelete,
  };
}
