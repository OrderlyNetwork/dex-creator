import type { MetaFunction } from "@remix-run/node";
import { GraduationForm } from "../components/GraduationForm";
import { useAuth } from "../context/useAuth";
import { useDex } from "../context/DexContext";
import { Card } from "../components/Card";
import WalletConnect from "../components/WalletConnect";
import { useState } from "react";
import { FeeConfigWithCalculator } from "../components/FeeConfigWithCalculator";
import { BaseFeeExplanation } from "../components/BaseFeeExplanation";
import { BackDexDashboard } from "../components/BackDexDashboard";

export const meta: MetaFunction = () => [
  { title: "Graduate Your DEX - Orderly One" },
  {
    name: "description",
    content:
      "Graduate your DEX to enable revenue generation. Configure fees and start earning from trading activity.",
  },
];

export default function GraduationRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  const { refreshDexData } = useDex();
  const [noDexSetup, setNoDexSetup] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] mt-26 pb-52">
        <div className="i-svg-spinners:three-dots text-4xl text-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-3xl mt-26 pb-52">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <BackDexDashboard />
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-bold mb-4">Graduate Your DEX</h1>
            <p className="text-gray-300 max-w-2xl">
              By sending ORDER tokens, you can graduate your DEX to earn fee
              splits and unlock additional features.
            </p>
          </div>
        </div>
      </div>

      {/* Warning card when no DEX is set up */}
      {noDexSetup && isAuthenticated && (
        <div className="max-w-3xl mx-auto mb-8">
          <Card className="border border-warning/20 bg-warning/5 mb-8">
            <div className="flex gap-4 items-start">
              <div className="bg-warning/20 p-2 rounded-full flex-shrink-0">
                <div className="i-mdi:alert-circle text-warning w-6 h-6"></div>
              </div>
              <div>
                <h3 className="text-lg font-medium text-warning">
                  DEX Setup Required
                </h3>
                <p className="text-gray-300 mt-1 mb-3">
                  Before you can graduate your DEX to earn trading fees, you
                  need to create a DEX first. Please go to the DEX creation page
                  to set up your own customized decentralized exchange powered
                  by Orderly.
                </p>
                <a
                  href="/"
                  className="inline-flex items-center px-4 py-2 rounded-full bg-warning/10 text-warning hover:bg-warning/20 transition-colors"
                >
                  <div className="i-mdi:rocket-launch w-4 h-4 mr-2"></div>
                  Create Your DEX
                  <div className="i-mdi:arrow-right w-4 h-4 ml-2"></div>
                </a>
              </div>
            </div>
          </Card>

          {/* Even without a DEX, show the fee explanation and calculator */}
          <Card className="mb-8">
            <h2 className="text-xl font-medium mb-4">
              Preview Revenue Potential
            </h2>
            <p className="text-gray-300 mb-6">
              While you need to create a DEX first, you can still explore the
              potential revenue you could earn after graduation:
            </p>

            <BaseFeeExplanation />

            <FeeConfigWithCalculator
              makerFee={3}
              takerFee={6}
              readOnly={true}
              defaultOpenCalculator={true}
            />
          </Card>
        </div>
      )}

      {/* Show wallet connect if not authenticated */}
      {!isAuthenticated ? (
        <div className="w-full max-w-3xl mx-auto px-4 py-6 md:py-10">
          <div className="text-center">
            <Card>
              <h2 className="text-lg md:text-xl font-medium mb-3 md:mb-4">
                Authentication Required
              </h2>
              <p className="mb-4 md:mb-6 text-sm md:text-base text-gray-300">
                Please connect your wallet and login to access DEX graduation
                benefits.
              </p>
              <div className="flex justify-center">
                <WalletConnect />
              </div>
            </Card>
          </div>
        </div>
      ) : (
        <>
          <GraduationForm
            onNoDexSetup={() => setNoDexSetup(true)}
            onGraduationSuccess={refreshDexData}
          />

          <div className="mt-16 max-w-2xl mx-auto bg-light/5 rounded-xl p-6">
            <h2 className="text-xl font-bold mb-4">Benefits of Graduating</h2>
            <div className="space-y-4">
              <div className="flex gap-4 items-start">
                <div className="bg-primary/20 p-2 rounded-full">
                  <div className="i-mdi:cash-multiple text-primary w-6 h-6"></div>
                </div>
                <div>
                  <h3 className="text-lg font-medium">Fee Revenue</h3>
                  <p className="text-gray-300">
                    Earn a split of trading fees generated by users on your DEX.
                    Your revenue comes from the custom fee component that you
                    set.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="bg-primary/20 p-2 rounded-full">
                  <div className="i-mdi:card-account-details text-primary w-6 h-6"></div>
                </div>
                <div>
                  <h3 className="text-lg font-medium">Unique Broker ID</h3>
                  <p className="text-gray-300">
                    Get your own unique identifier in the Orderly ecosystem to
                    track your revenue and rewards. This ID is essential for
                    revenue attribution.
                  </p>
                </div>
              </div>

              {/* New benefit about staking tiers */}
              <div className="flex gap-4 items-start">
                <div className="bg-warning/20 p-2 rounded-full">
                  <div className="i-mdi:finance text-warning w-6 h-6"></div>
                </div>
                <div>
                  <h3 className="text-lg font-medium">
                    Builder Staking Programme
                  </h3>
                  <p className="text-gray-300">
                    Access our 5-tier staking system to reduce base fees and
                    unlock additional benefits. Achieve Silver tier (2.75 bps)
                    with 100K ORDER or $30M volume, Gold tier (2.50 bps) with
                    250K ORDER or $90M volume, Platinum tier (2.00 bps) with 2M
                    ORDER or $1B volume, or Diamond tier (1.00 bps) with 7M
                    ORDER or $10B volume.
                  </p>
                  <a
                    href="https://app.orderly.network/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 text-primary-light hover:text-primary inline-flex items-center text-sm"
                  >
                    Stake ORDER tokens
                    <div className="i-mdi:arrow-right ml-1 w-4 h-4"></div>
                  </a>
                  <div className="flex gap-2 mt-1">
                    <a
                      href="https://orderly.network/docs/build-on-omnichain/user-flows/builder-staking-programme"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-light hover:text-primary inline-flex items-center text-sm"
                    >
                      <div className="i-mdi:file-document-outline w-4 h-4 mr-1"></div>
                      View programme details
                    </a>
                  </div>
                  <div className="mt-2 bg-warning/10 p-2 rounded text-xs flex items-start gap-1.5">
                    <div className="i-mdi:alert-circle-outline text-warning w-4 h-4 flex-shrink-0 mt-0.5"></div>
                    <p className="text-gray-300">
                      You must use the{" "}
                      <span className="font-medium">same wallet</span> for
                      staking that you used to set up your DEX.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="bg-success/20 p-2 rounded-full">
                  <div className="i-mdi:shield-check text-success w-6 h-6"></div>
                </div>
                <div>
                  <h3 className="text-lg font-medium">
                    Enhanced Support & Services
                  </h3>
                  <p className="text-gray-300">
                    As you progress through higher tiers, unlock additional
                    benefits including dedicated tech support, marketing
                    assistance, and priority for new chain expansions. Platinum
                    and Diamond tier members receive enhanced marketing support,
                    flagship partner program access, and dedicated customer
                    service.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-light/10">
              <div className="flex items-start gap-3 text-sm">
                <div className="i-mdi:information-outline text-info w-5 h-5 flex-shrink-0 mt-0.5"></div>
                <p className="text-gray-400">
                  <span className="text-white font-medium">
                    DEX Fee Structure:
                  </span>{" "}
                  Your custom fees represent the total fees that traders pay.
                  Orderly's base fee (which varies by tier) is deducted from
                  your custom fees to calculate your revenue. The base fee
                  supports the Orderly ecosystem infrastructure and liquidity.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
