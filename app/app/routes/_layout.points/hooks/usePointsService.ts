import { useDex } from "~/context/DexContext";
import { useMutation, usePrivateQuery, useQuery } from "~/net";
import { PointCampaign, PointCampaignDetail } from "~/types/points";

export function usePointsStages() {
  const { brokerId } = useDex();

  return useQuery<PointCampaign[]>(
    brokerId ? `/v1/public/points/stages?broker_id=${brokerId}` : null,
    {
      formatter: (data: any) => {
        const list = [...(data?.rows || [])];
        list.sort((a, b) => b.start_time - a.start_time);
        return list;
      },
    }
  );
}

export function usePointsDetail(stage_id?: number) {
  return usePrivateQuery<PointCampaignDetail>(
    stage_id ? `/v1/admin/points/stage?stage_id=${stage_id}` : null
  );
}

// create and update points stage
export function useOperatePointsStage() {
  return useMutation("/v1/admin/points/stage");
}

export function useDeletePointsStage(stage_id?: number) {
  return useMutation(
    stage_id ? `/v1/admin/points/stage?stage_id=${stage_id}` : "",
    "DELETE"
  );
}
