import { ProgrammeStepCard } from "./components/ProgrammeStepCard";
import { ConnectWalletCard } from "./components/ConnectWalletCard";

export function VanguardDistributorProgramme() {
  return (
    <div className="mt-18 md:mt-30 pt-5 pb-10 md:pb-22 font-medium">
      <div className="flex flex-col gap-10 md:gap-16 items-start px-4 md:px-8 relative max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="flex gap-10 md:gap-16 items-start relative w-full">
          <div className="flex flex-col gap-3 md:gap-4 grow items-center">
            <h1 className="font-semibold leading-[1.2] md:leading-[1.3] text-2xl md:text-4xl text-center bg-gradient-to-t from-white to-purple-300 px-4 bg-clip-text text-transparent">
              Orderly Distributor Program
            </h1>
            <div className="flex flex-col gap-1 items-center w-full px-4">
              <p className="text-xs md:text-base leading-[1.5] text-base-contrast-54 text-center">
                Orderly empowers distributors to onboard projects to Orderly One
                and earn a share of the fees.
              </p>
              <p className="text-xs md:text-base leading-[1.5] text-base-contrast-54 text-center">
                <span>View detailed rules in </span>
                <a
                  href="https://orderly.network/docs/introduction/orderly-one/vanguard-distributor-program"
                  className="text-[#9c75ff] hover:text-[#b58fff] transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Distributor Program ↗
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* How it works Section */}
        <div className="flex flex-col gap-4 md:gap-5 items-start w-full">
          <div className="flex flex-col gap-2 items-start w-full">
            <h2 className="text-xl md:text-2xl leading-[1.2] text-base-contrast w-full">
              How it works
            </h2>
            <p className="text-sm md:text-base leading-[1.5] text-base-contrast-54 w-full">
              Sign up and start earning in 3 steps:
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-4 md:gap-5 items-start w-full">
            <ProgrammeStepCard
              icon="/distributor/vanguard_step_1.png"
              title="1. Create profile"
              description="Create your distributor profile directly on Orderly One. Not a builder? No problem! You can register as an ambassador."
            />

            <ProgrammeStepCard
              icon="/distributor/vanguard_step_2.png"
              title="2. Refer builders"
              description="Share your distributor link or code with your network. Builders in your network can use it to setup their DEXes."
            />

            <ProgrammeStepCard
              icon="/distributor/vanguard_step_3.png"
              title="3. Earn revenue share"
              description="Immediately start earning revenue share once your invitees have successfully setup their DEXes and graduated."
            />
          </div>
        </div>

        {/* Connect Wallet Section */}
        <ConnectWalletCard />
      </div>
    </div>
  );
}
