import { useState } from "react";
import { useAccount } from "wagmi";
import { useAppKit } from "@reown/appkit/react";
import { useModal } from "../../../../context/ModalContext";
import { useAuth } from "../../../../context/useAuth";
import { TIER_CONFIG, TIER_ORDER, ALPHA_GUARANTEE } from "./constants";

export function RevenueSimulator() {
  interface Invitee {
    id: number;
    tier: string;
    volume: number | "";
  }

  // Hooks
  const { isConnected } = useAccount();
  const appKit = useAppKit();
  const { openModal, closeModal } = useModal();
  const { isAuthenticated, login } = useAuth();

  // State for Revenue Simulator
  const [userTier, setUserTier] = useState("Diamond");
  const [invitees, setInvitees] = useState<Invitee[]>([
    { id: 1, tier: "Public", volume: 30000000 },
    { id: 2, tier: "Public", volume: 30000000 },
    { id: 3, tier: "Public", volume: 30000000 },
  ]);

  // Helpers
  const formatNumber = (num: number | "") => {
    if (num === "") return "";
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const formatCurrency = (amount: number) => {
    return (
      "$" +
      amount.toLocaleString("en-US", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      })
    );
  };

  const getTierFromVolume = (volume: number) => {
    for (let i = TIER_ORDER.length - 1; i >= 0; i--) {
      const tier = TIER_ORDER[i];
      if (volume >= TIER_CONFIG[tier].threshold) {
        return tier;
      }
    }
    return "Public";
  };

  const getTierIndex = (tier: string) => {
    return TIER_ORDER.indexOf(tier);
  };

  // derived state
  const totalVolume = invitees.reduce(
    (sum, inv) => sum + Number(inv.volume),
    0
  );
  const volumeBasedTier = getTierFromVolume(totalVolume);
  const projectedTier =
    getTierIndex(volumeBasedTier) > getTierIndex(userTier)
      ? volumeBasedTier
      : userTier;

  const distributorFee = TIER_CONFIG[projectedTier].fee;

  const results = invitees.map(invitee => {
    const vol = Number(invitee.volume);
    const inviteeFee = TIER_CONFIG[invitee.tier].fee;
    const rawSpread = inviteeFee - distributorFee;
    const margin = Math.max(rawSpread, ALPHA_GUARANTEE);
    const revenue = vol * margin;
    const sharePercentage = inviteeFee > 0 ? (margin / inviteeFee) * 100 : 0;

    return {
      revenue,
      sharePercentage,
      active: vol > 0,
    };
  });

  const totalRevenue = results.reduce((sum, r) => sum + r.revenue, 0);

  // Calculate max share percentage
  const activeMargins = results
    .filter(r => r.active)
    .map(r => r.sharePercentage);
  const maxSharePercentage =
    activeMargins.length > 0 ? Math.max(...activeMargins) : 0;

  const allSameShare =
    activeMargins.length > 0 &&
    activeMargins.every(m => Math.abs(m - activeMargins[0]) < 0.01);
  const shareText =
    activeMargins.length > 0 && allSameShare
      ? `${Math.round(maxSharePercentage)}% of fees earned`
      : `Up to ${Math.round(maxSharePercentage)}%`;

  const isUpgrade = getTierIndex(projectedTier) > getTierIndex(userTier);

  // Handlers
  const handleUserTierChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setUserTier(e.target.value);
  };

  const handleInviteeTierChange = (id: number, newTier: string) => {
    setInvitees(prev =>
      prev.map(inv => (inv.id === id ? { ...inv, tier: newTier } : inv))
    );
  };

  const handleInviteeVolumeChange = (id: number, valueStr: string) => {
    // allow typing numbers and commas
    // simple approach: strip non-digits, then format
    const rawValue = valueStr.replace(/[^0-9]/g, "");

    if (rawValue === "") {
      setInvitees(prev =>
        prev.map(inv => (inv.id === id ? { ...inv, volume: "" } : inv))
      );
      return;
    }

    const numValue = parseInt(rawValue);

    if (!isNaN(numValue)) {
      setInvitees(prev =>
        prev.map(inv => (inv.id === id ? { ...inv, volume: numValue } : inv))
      );
    }
  };

  const handleGetStarted = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isConnected) {
      appKit?.open({
        namespace: "eip155",
        view: "Connect",
      });
    } else if (!isAuthenticated) {
      openModal("login", {
        onLogin: async () => {
          try {
            await login();
            closeModal();
          } catch (error) {
            console.error("Login failed:", error);
          }
        },
        onClose: () => {
          closeModal();
        },
      });
    }
  };

  return (
    <section className="py-16">
      <div className="flex flex-col items-center gap-8 max-w-[1088px] mx-auto px-5 lg:px-0">
        <div className="flex flex-col justify-center items-center text-center gap-4 w-full">
          <h2 className="text-[32px] font-semibold leading-[1.2]">
            Calculate your revenue potential
          </h2>
        </div>

        <div className="flex items-stretch gap-8 w-full max-lg:flex-col">
          {/* Left Side: Inputs */}
          <div className="flex flex-col justify-start gap-8 flex-1">
            {/* Your Tier Selector */}
            <div className="flex flex-col gap-4 p-6 bg-purple-dark border border-line-6 rounded-2xl">
              <div className="flex items-center gap-6">
                <div className="flex flex-col gap-2 flex-1">
                  <h3 className="text-lg font-medium leading-[1.2] text-base-contrast/54">
                    My tier
                  </h3>
                  <div className="flex items-center gap-2 flex-1 relative group">
                    <span className="text-2xl font-medium leading-[1.2] text-base-contrast">
                      {userTier}
                    </span>
                    <img
                      src="/distributor/icon-chevron-down.svg"
                      alt=""
                      className="w-6 h-6 shrink-0"
                    />
                    <select
                      id="userTierSelect"
                      value={userTier}
                      onChange={handleUserTierChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    >
                      {TIER_ORDER.map(tier => (
                        <option key={tier} value={tier}>
                          {tier}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="w-12 h-16 flex items-center justify-center">
                  <img
                    id="userTierIcon"
                    src={TIER_CONFIG[userTier].icon}
                    alt={userTier}
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
              <div className="flex self-stretch gap-6 justify-start">
                <a
                  href="https://orderly.network/docs/introduction/trade-on-orderly/trading-basics/trading-fees#builder-staking-programme"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium leading-[1.2] text-purple-light"
                >
                  Learn more
                </a>
              </div>
            </div>

            {/* Invitee Input Group */}
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center w-full">
                <h3 className="text-lg font-medium leading-[1.2] text-base-contrast text-left">
                  Invitee tier
                </h3>
                <h3 className="text-lg font-medium leading-[1.2] text-base-contrast text-right">
                  Est. monthly volume
                </h3>
              </div>

              {invitees.map(invitee => (
                <div
                  className="flex items-start gap-4 max-md:flex-col max-md:bg-purple-dark max-md:border max-md:border-line-6 max-md:rounded-2xl max-md:p-4 max-md:gap-3"
                  key={invitee.id}
                >
                  <div className="flex justify-center items-center w-5 h-5 text-base font-medium leading-[1.2] text-purple-light shrink-0 max-md:self-start">
                    {invitee.id}
                  </div>
                  <div className="flex flex-1 gap-2 max-md:flex-col max-md:w-full">
                    <div className="flex items-center gap-2 p-6 w-[188px] h-[70px] bg-purple-dark border border-line-6 rounded-2xl shrink-0 relative isolate max-md:w-full">
                      <img
                        className="w-8 h-8 opacity-100"
                        src={TIER_CONFIG[invitee.tier].icon}
                        alt={invitee.tier}
                      />
                      <select
                        className="text-base font-medium leading-[1.2] text-base-contrast bg-transparent border-0 outline-none flex-1 cursor-pointer appearance-none"
                        value={invitee.tier}
                        onChange={e =>
                          handleInviteeTierChange(invitee.id, e.target.value)
                        }
                      >
                        {TIER_ORDER.map(tier => (
                          <option key={tier} value={tier}>
                            {tier}
                          </option>
                        ))}
                      </select>
                      <img
                        src="/distributor/icon-chevron-down.svg"
                        alt=""
                        className="absolute right-6 top-1/2 -translate-y-1/2 w-6 h-6 pointer-events-none"
                      />
                    </div>
                    <div className="flex items-center gap-2 p-6 flex-1 bg-purple-dark border border-line-6 rounded-2xl max-md:w-full">
                      <input
                        type="text"
                        className="text-base font-medium leading-[1.2] text-base-contrast bg-transparent border-0 outline-none flex-1 w-full"
                        value={formatNumber(invitee.volume)}
                        onChange={e =>
                          handleInviteeVolumeChange(invitee.id, e.target.value)
                        }
                        placeholder="0"
                      />
                      <span className="text-base font-medium leading-[1.2] text-base-contrast/54 shrink-0">
                        USDC
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side: Preview */}
          <div className="flex flex-col justify-start gap-8 flex-1 bg-purple-dark border border-line-6 rounded-[20px] p-0 overflow-hidden">
            <div className="flex flex-col gap-5 p-6 bg-transparent rounded-[19px] flex-1 justify-between">
              <h3 className="text-lg font-medium leading-[1.2] text-base-contrast">
                Preview
              </h3>

              <div className="flex flex-col justify-center gap-3 p-5 bg-purple-darker rounded-3xl">
                <h4 className="text-lg font-medium leading-[1.2] text-base-contrast text-center">
                  Est. monthly revenue
                </h4>
                <div
                  className="text-[40px] font-medium leading-[1.2] text-center bg-[linear-gradient(-36deg,#1DF6B5_0%,#86ED92_91%)] bg-clip-text text-transparent"
                  id="totalRevenue"
                >
                  {formatCurrency(totalRevenue)}
                </div>
                <div className="text-sm font-medium leading-[1.2] text-base-contrast/54 text-center">
                  Paid daily in USDC
                </div>
              </div>

              <div className="flex flex-col gap-4 p-3 md:p-4">
                <div className="flex justify-stretch items-stretch gap-6">
                  <h4 className="text-lg font-medium leading-[1.2] text-base-contrast flex-1">
                    Revenue share
                  </h4>
                  <div
                    className="text-lg font-medium leading-[1.2] text-base-contrast text-right"
                    id="revenueShare"
                  >
                    {shareText}
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-6">
                    <h4 className="text-lg font-medium leading-[1.2] text-base-contrast flex-1">
                      Tier
                    </h4>
                    <div className="flex items-center gap-2" id="tierDisplay">
                      <div
                        className={`flex items-center gap-2 ${isUpgrade ? "opacity-30" : ""}`}
                      >
                        <img
                          src={TIER_CONFIG[userTier].icon}
                          alt={userTier}
                          className="w-5 h-5 opacity-100"
                        />
                        <span className="text-base font-medium leading-[1.2] text-base-contrast">
                          {userTier}
                        </span>
                      </div>

                      {isUpgrade && (
                        <>
                          <div className="w-4 h-4 opacity-100">
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                              className="w-full h-full"
                            >
                              <path
                                d="M5 12H19M19 12L12 5M19 12L12 19"
                                stroke="rgba(255,255,255,0.98)"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </div>
                          <div className="flex items-center gap-2">
                            <img
                              src={TIER_CONFIG[projectedTier].icon}
                              alt={projectedTier}
                              className="w-5 h-5 opacity-100"
                            />
                            <span className="text-base font-medium leading-[1.2] text-base-contrast">
                              {projectedTier}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  <div
                    className="text-base font-medium leading-[1.2] text-purple-light text-right"
                    style={{ display: isUpgrade ? "block" : "none" }}
                  >
                    Upgraded based on invitee volume!
                  </div>
                </div>
              </div>
              <button
                onClick={handleGetStarted}
                className="flex justify-center items-center px-5 py-3 h-10 rounded-full border-0 cursor-pointer text-lg font-medium no-underline transition-opacity hover:opacity-90 bg-[linear-gradient(270deg,#48BDFF_0%,#786CFF_48%,#BD00FF_100%)] text-white w-full"
              >
                Start earning now
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
