import { useMemo, useState } from "react";
import type { MetaFunction } from "@remix-run/node";
import { BackDexDashboard } from "../../components/BackDexDashboard";
import { PointCampaignForm } from "./components/form";
import { PointCampaignList } from "./components/PointCampaignList";
import { EnablePointsCard, PointsMenuId } from "./components/EnablePointsCard";
import { OrderlyKeyAuthGrard } from "~/components/authGrard/OrderlyKeyAuthGuard";
import { GraduationAuthGuard } from "~/components/authGrard/GraduationAuthGuard";
import { PointCampaign, PointCampaignFormType } from "~/types/points";
import { usePointsStages } from "./hooks/usePointsService";
import { useDex } from "~/context/DexContext";
import { useDeleteStages } from "./hooks/useDeleteStages";

export const meta: MetaFunction = () => [
  { title: "Create point system - Orderly one" },
  {
    name: "description",
    content:
      "Configure and manage point campaigns for your DEX. Set up trading volume, PNL, and referral coefficients",
  },
];

export default function PointsRoute() {
  const [type, setType] = useState<PointCampaignFormType | null>(null);
  const [currentPoints, setCurrentPoints] = useState<PointCampaign | null>(
    null
  );

  const { dexData } = useDex();

  const enabledMenus = useMemo(
    () => parseMenus(dexData?.enabledMenus!),
    [dexData?.enabledMenus]
  );

  const { data, mutate: mutatePointsStages } = usePointsStages();

  const onRefresh = () => {
    mutatePointsStages();
  };

  const { onDelete } = useDeleteStages({
    stage_id: currentPoints?.stage_id,
    onSuccess: onRefresh,
  });

  const handleCreate = () => {
    setType(PointCampaignFormType.Create);
  };

  const handleEdit = (campaign: PointCampaign) => {
    setCurrentPoints(campaign);
    setType(PointCampaignFormType.Edit);
  };

  const handleView = (campaign: PointCampaign) => {
    setCurrentPoints(campaign);
    setType(PointCampaignFormType.View);
  };

  const onClose = () => {
    setType(null);
    setCurrentPoints(null);
  };

  const handleDelete = (campaign: PointCampaign) => {
    setCurrentPoints(campaign);
    onDelete();
  };

  const latestPoints = useMemo(() => {
    return data?.[0];
  }, [data]);

  const disabledCreate = useMemo(() => {
    return !enabledMenus.includes(PointsMenuId);
  }, [enabledMenus]);

  const renderContent = () => {
    if (type) {
      return (
        <PointCampaignForm
          type={type}
          currentPoints={currentPoints}
          close={onClose}
          refresh={onRefresh}
          latestPoints={latestPoints}
        />
      );
    }

    return (
      <div>
        <BackDexDashboard />

        <h1 className="text-lg md:text-2xl font-bold gradient-text">
          Point Campaign Setup
        </h1>

        <OrderlyKeyAuthGrard className="mt-10">
          <GraduationAuthGuard className="mt-10">
            <EnablePointsCard enabledMenus={enabledMenus} />
            <PointCampaignList
              data={data}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onCreate={handleCreate}
              disabledCreate={disabledCreate}
            />
          </GraduationAuthGuard>
        </OrderlyKeyAuthGrard>
      </div>
    );
  };

  return (
    <div className="container mx-auto p-4 max-w-3xl mt-26 pb-52">
      {renderContent()}
    </div>
  );
}

function parseMenus(menuString?: string): string[] {
  if (!menuString) return [];
  return menuString
    .split(",")
    .map(item => item.trim())
    .filter(Boolean);
}
