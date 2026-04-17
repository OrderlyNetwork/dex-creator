import { useMemo, useState } from "react";
import type { MetaFunction } from "@remix-run/node";
import { BackDexDashboard } from "../../components/BackDexDashboard";
import { PointCampaignForm } from "./components/form";
import { PointCampaignList } from "./components/PointCampaignList";
import { OrderlyKeyAuthGrard } from "~/components/authGrard/OrderlyKeyAuthGuard";
import { GraduationAuthGuard } from "~/components/authGrard/GraduationAuthGuard";
import { PointCampaign, PointCampaignFormType } from "~/types/points";
import { usePointsStages } from "./hooks/usePointsService";
import { useDeleteStages } from "./hooks/useDeleteStages";
import { useTranslation } from "~/i18n";

export const meta: MetaFunction = () => [
  { title: "Create point system - Orderly one" },
  {
    name: "description",
    content:
      "Configure and manage point campaigns for your DEX. Set up trading volume, PNL, and referral coefficients",
  },
];

export default function PointsRoute() {
  const { t } = useTranslation();
  const [type, setType] = useState<PointCampaignFormType | null>(null);
  const [currentPoints, setCurrentPoints] = useState<PointCampaign | null>(
    null
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
          {t("points.page.title")}
        </h1>

        <OrderlyKeyAuthGrard className="mt-10">
          <GraduationAuthGuard className="mt-10">
            <PointCampaignList
              data={data}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onCreate={handleCreate}
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
