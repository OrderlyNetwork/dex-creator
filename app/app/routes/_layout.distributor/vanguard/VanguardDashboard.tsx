import Overview from "./sections/overview";
import InviteesList from "./sections/invitees";
import RevenueShareList from "./sections/revenue";
import { ToggleTab } from "./components";
import { TooltipProvider } from "@orderly.network/ui";
import { useTranslation } from "~/i18n";

export default function VanguardDashboard() {
  const { t } = useTranslation();
  const tabs = [
    {
      label: t("distributor.myInvitees"),
      content: <InviteesList />,
    },
    {
      label: t("distributor.revenueShare"),
      content: <RevenueShareList />,
    },
  ];

  return (
    <TooltipProvider>
      <div className="mt-15 md:mt-30 pb-52 max-w-6xl mx-auto flex flex-col gap-6 px-4 md:px-8">
        <h1 className="text-2xl font-semibold bg-gradient-to-t from-white to-purple-300 bg-clip-text text-transparent">
          {t("distributor.myDistributorProfile")}
        </h1>
        <div className="flex flex-col gap-5">
          <Overview />
          <ToggleTab tabs={tabs} initialIndex={0} />
        </div>
      </div>
    </TooltipProvider>
  );
}
