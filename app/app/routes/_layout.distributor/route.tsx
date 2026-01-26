import { useRef } from "react";
import { useAuth } from "../../context/useAuth";
import { CompleteAmbassadorProfile } from "./CompleteAmbassadorProfile";
import { VanguardDistributorProgramme } from "./VanguardDistributorProgramme";
import { CompleteBuilderProfile } from "./CompleteBuilderProfile";
import { useOrderlyKey } from "../../context/OrderlyKeyContext";
import { OrderlyKeyCard } from "./components/OrderlyKeyCard";
import { DistributorHeader } from "./components/DistributorHeader";
import { useDistributor } from "../../context/DistributorContext";
import { useDex } from "../../context/DexContext";
import VanguardDashboard from "./vanguard/VanguardDashboard";
import { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => [
  { title: "Vanguard Distributor Program - Orderly One" },
  {
    name: "description",
    content:
      "Orderly empowers distributors to onboard projects to Orderly One and earn a share of the fees.",
  },
];

export const AMBASSADOR_BROKER_ID = "ambassador";

export default function DistributorRoute() {
  const { isAuthenticated } = useAuth();
  const { setBrokerId } = useDex();

  const { hasValidKey } = useOrderlyKey();
  // flag to prevent showing the create key card when creating ambassador profile
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
    // when broker id is set, we can calculate the account id
    setBrokerId(AMBASSADOR_BROKER_ID);
    // mutate the account info to get the latest account info
    mutateAccountInfo();
  };

  const handleUpdateDistributorNameSuccess = () => {
    mutateAmbassadorInfo();
  };

  const createKeyCard = (
    <div className="mt-15 md:mt-30 pb-52 max-w-6xl mx-auto flex flex-col gap-10 px-4 md:px-8 ">
      <DistributorHeader title="Create key to manage your distributor profile" />
      <OrderlyKeyCard />
    </div>
  );

  if (!isAuthenticated) {
    return <VanguardDistributorProgramme />;
  }

  if (isInitialLoading) {
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

    // Show vanguard distributor dashboard when key is valid
    return <VanguardDashboard />;
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

  // if (isAmbassador) {
  //   return <CompleteAmbassadorProfile onSuccess={handleCompleteAmbassador} />;
  // }

  // return (
  //   <CreateDistributorProfile
  //     brokerId={AMBASSADOR_BROKER_ID}
  //     onSuccess={handleCreateAmbassador}
  //   />
  // );
}
