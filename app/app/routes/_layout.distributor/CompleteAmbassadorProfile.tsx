import { useCreateOrderlyKey } from "../../hooks/useCreateOrderlyKey";
import { OrderlyKeyCard } from "./components/OrderlyKeyCard";
import { DistributorNameCard } from "./components/DistributorNameCard";
import { DistributorHeader } from "./components/DistributorHeader";
import { AccountCreationCard } from "./components/AccountCreationCard";
import { useDistributor } from "../../context/DistributorContext";
import { useTranslation } from "~/i18n";

type CompleteDistributorProfileProps = {
  brokerId: string;
  onCreateAmbassadorSuccess: () => void;
  onUpdateDistributorNameSuccess: () => void;
};

export function CompleteAmbassadorProfile(
  props: CompleteDistributorProfileProps
) {
  const { t } = useTranslation();
  const { isAmbassador } = useDistributor();
  const { hasValidKey } = useCreateOrderlyKey();

  return (
    <div className="mt-15 md:mt-30 pb-52 font-medium">
      <div className="section-container flex flex-col gap-10 md:gap-16 items-start px-4 md:px-8 py-10 md:py-16 relative max-w-6xl mx-auto">
        {/* Header Section */}
        <DistributorHeader title={t("distributor.completeProfile.step.3")} />

        {/* Main Content */}
        <div className="flex flex-col gap-5 items-start w-full">
          {/* Step 1 */}
          <AccountCreationCard
            brokerId={props.brokerId}
            onSuccess={props.onCreateAmbassadorSuccess}
          />

          {/* Step 2 */}
          {isAmbassador && <OrderlyKeyCard />}

          {/* Step 3 */}
          {hasValidKey && (
            <DistributorNameCard
              onSuccess={props.onUpdateDistributorNameSuccess}
            />
          )}
        </div>
      </div>
    </div>
  );
}
