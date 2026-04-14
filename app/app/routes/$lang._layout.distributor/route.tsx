import { useRef } from "react";
import { useAuth } from "../../context/useAuth";
import { CompleteAmbassadorProfile } from "./CompleteAmbassadorProfile";
import { VanguardDistributorProgramme } from "./programme/VanguardDistributorProgramme";
import { CompleteBuilderProfile } from "./CompleteBuilderProfile";
import { useOrderlyKey } from "../../context/OrderlyKeyContext";
import { OrderlyKeyCard } from "./components/OrderlyKeyCard";
import { DistributorHeader } from "./components/DistributorHeader";
import { useDistributor } from "../../context/DistributorContext";
import { useDex } from "../../context/DexContext";
import VanguardDashboard from "./vanguard/VanguardDashboard";
import { MetaFunction } from "@remix-run/node";
import { useTranslation } from "~/i18n";

export const meta: MetaFunction = () => [
  { title: "Orderly Distributor Program - Orderly One" },
  {
    name: "description",
    content:
      "Orderly empowers distributors to onboard projects to Orderly One and earn a share of the fees.",
  },
];

export const AMBASSADOR_BROKER_ID = "ambassador";

function BoostedDistributorBanner() {
  const { t } = useTranslation();

  return (
    <a
      href="https://forms.gle/qARKWqC7X66TJAKy9"
      target="_blank"
      rel="noopener noreferrer"
      className="block w-full bg-gradient-to-r from-purple-700 via-blue-600 to-purple-700 py-3 text-center text-white text-sm md:text-base font-medium hover:from-purple-600 hover:via-blue-500 hover:to-purple-600 transition-all mt-[56px] md:mt-[100px]"
    >
      <span className="inline-flex items-center gap-2">
        {t("distributor.boostedBanner")}
        <div className="i-mdi:open-in-new w-4 h-4" />
      </span>
    </a>
  );
}

export default function DistributorRoute() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const { setBrokerId } = useDex();

  const { hasValidKey, isResolvingAccount } = useOrderlyKey();
  const isCreatingAmbassador = useRef(false);

  const {
    isInitialLoading,
    isAmbassador,
    ambassadorCompleted,
    isBuilder,
    builderCompleted,
    mutateAmbassadorInfo,
    mutateAccountInfo,
  } = useDistributor();

  const handleCreateAmbassador = () => {
    isCreatingAmbassador.current = true;
    setBrokerId(AMBASSADOR_BROKER_ID);
    mutateAccountInfo();
  };

  const handleUpdateDistributorNameSuccess = () => {
    mutateAmbassadorInfo();
  };

  const createKeyCard = (
    <div className="mt-15 md:mt-30 pb-52 max-w-6xl mx-auto flex flex-col gap-10 px-4 md:px-8 ">
      <DistributorHeader title={t("distributor.createKeyHeader")} />
      <OrderlyKeyCard />
    </div>
  );

  const renderContent = () => {
    if (!isAuthenticated) {
      return <VanguardDistributorProgramme />;
    }

    if (isInitialLoading || isResolvingAccount) {
      return (
        <div className="w-full h-[calc(100vh-64px)] flex items-center justify-center">
          <div className="i-svg-spinners:pulse-rings-multiple h-20 w-20 text-primary-light"></div>
        </div>
      );
    }

    if (isAmbassador && !hasValidKey && !isCreatingAmbassador.current) {
      return createKeyCard;
    }

    if (ambassadorCompleted || builderCompleted) {
      if (!hasValidKey) {
        return createKeyCard;
      }

      return (
        <>
          <BoostedDistributorBanner />
          <VanguardDashboard />
        </>
      );
    }

    if (isBuilder) {
      return <CompleteBuilderProfile />;
    }

    return (
      <CompleteAmbassadorProfile
        brokerId={AMBASSADOR_BROKER_ID}
        onCreateAmbassadorSuccess={handleCreateAmbassador}
        onUpdateDistributorNameSuccess={handleUpdateDistributorNameSuccess}
      />
    );
  };

  return <>{renderContent()}</>;
}
