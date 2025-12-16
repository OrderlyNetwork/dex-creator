import { useState } from "react";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import clsx from "clsx";
import { toast } from "react-toastify";
import { BrowserProvider } from "ethers";
import { registerAccount } from "../../utils/orderly";
import { useAccount, useChainId, useWalletClient } from "wagmi";
import { useDex } from "../../context/DexContext";
import { ProfileTypeCard } from "./components/ProfileTypeCard";
import { CreateDexButton } from "./components/CreateDexButton";
import { DistributorHeader } from "./components/DistributorHeader";
import { parseWalletError } from "../../utils/wallet";

type ProfileType = "ambassador" | "builder" | null;

type CreateDistributorProfileProps = {
  brokerId: string;
  onSuccess: (accountId: string) => void;
};

export function CreateDistributorProfile(props: CreateDistributorProfileProps) {
  const [selectedType, setSelectedType] = useState<ProfileType>(null);
  const [loading, setLoading] = useState(false);
  const { address } = useAccount();
  const chainId = useChainId();
  const { data: walletClient } = useWalletClient();
  const { setBrokerId } = useDex();

  const handleSelectType = (type: ProfileType) => {
    setSelectedType(type);
  };

  const handleCreate = async () => {
    setLoading(true);
    try {
      const provider = new BrowserProvider(walletClient!);
      const signer = await provider.getSigner();

      const res = await registerAccount(
        signer,
        address!,
        chainId || 1,
        props.brokerId
      );
      props.onSuccess(res);
      toast.success("Create profile");
      setBrokerId(props.brokerId);
    } catch (error: any) {
      console.error("Error creating profile:", error);
      const message = parseWalletError(error) || "Failed to create profile";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-18 md:mt-30 pt-5 pb-10 md:pb-15 font-medium">
      <div className="flex flex-col gap-10 md:gap-15 px-4 md:px-8 relative max-w-6xl mx-auto">
        {/* Header Section */}
        <DistributorHeader title="Create your distributor profile" />

        {/* Main Content */}
        <div className="flex flex-col gap-5 items-start w-full">
          <Card className="!border-none w-full p-6 md:p-6 flex flex-col gap-5">
            {/* Question Section */}
            <p className="text-lg text-base-contrast">
              What describes you best?
            </p>

            {/* Divider */}
            <div className="h-px w-full bg-base-contrast-12"></div>

            {/* Instruction Text */}
            <p className="text-sm text-base-contrast-54">
              Choose one that applies
            </p>

            {/* Selection Cards */}
            <div
              className={clsx(
                "flex flex-col gap-5 items-start",
                loading && "opacity-50"
              )}
            >
              <ProfileTypeCard
                title="Ambassador"
                description="Not a builder? No problem! You can register as an ambassador*."
                footer="*After signing up as an ambassador, you cannot create your own DEX using the same address."
                isSelected={selectedType === "ambassador"}
                onClick={() => handleSelectType("ambassador")}
              />

              <ProfileTypeCard
                title="Builder"
                description="Builder with a strong network to help onboard projects to Orderly One. Orderly One's graduation rules apply to qualify."
                isSelected={selectedType === "builder"}
                onClick={() => handleSelectType("builder")}
              />
            </div>

            <div className="flex justify-end">
              {selectedType === "ambassador" ? (
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleCreate}
                  disabled={!selectedType}
                  isLoading={loading}
                >
                  Create now
                </Button>
              ) : (
                <CreateDexButton />
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
