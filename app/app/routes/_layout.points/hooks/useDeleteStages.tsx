import { toast } from "react-toastify";
import { modal } from "@orderly.network/ui";
import { useDeletePointsStage } from "./usePointsService";

type UseDeleteStagesProps = {
  stage_id?: number;
  onSuccess: () => void;
};

export function useDeleteStages(props: UseDeleteStagesProps) {
  const [deletePointCampaign] = useDeletePointsStage(props.stage_id);

  const doDelete = async () => {
    try {
      const res = await deletePointCampaign({});
      if (res.success) {
        toast.success(
          <div>
            Campaign deleted
            <div className="text-[13px] text-base-contrast-54">
              The campaign has been successfully removed.
            </div>
          </div>
        );
        props.onSuccess();
      } else {
        toast.error(res?.message || "Campaign delete failed");
      }
    } catch (err: any) {
      console.error("Error deleting campaign:", err);
      toast.error(err?.message || "Campaign delete failed");
    }
  };

  const onDelete = () => {
    modal.confirm({
      title: "Delete Campaign?",
      okLabel: "Delete",
      content: (
        <span className="text-warning">
          Are you sure you want to delete this campaign? This action cannot be
          undone.
        </span>
      ),
      size: "md",
      onOk: doDelete,
    });
  };

  return {
    onDelete,
  };
}
