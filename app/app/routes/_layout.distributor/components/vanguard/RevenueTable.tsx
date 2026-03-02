export function RevenueTable() {
  const tiers = [
    {
      tier: "Public",
      stake: "0 $ORDER",
      vals: ["$100", "$750", "$4,500", "$100K", "$2M"],
      icon: "/distributor/tier-public.png",
    },
    {
      tier: "Silver",
      stake: "100K $ORDER",
      vals: ["$250", "$750", "$4,500", "$100K", "$2M"],
      icon: "/distributor/tier-silver.png",
    },
    {
      tier: "Gold",
      stake: "250K $ORDER",
      vals: ["$500", "$1,500", "$4,500", "$100K", "$2M"],
      icon: "/distributor/tier-gold.png",
    },
    {
      tier: "Platinum",
      stake: "2M $ORDER",
      vals: ["$1,000", "$3,000", "$9,000", "$100K", "$2M"],
      icon: "/distributor/tier-platinum.png",
    },
    {
      tier: "Diamond",
      stake: "7M $ORDER",
      vals: ["$2,000", "$6,000", "$18,000", "$200K", "$2M"],
      icon: "/distributor/tier-diamond.png",
    },
  ];

  return (
    <section className="py-16">
      <div className="flex flex-col justify-center items-center gap-11 max-w-[1088px] mx-auto px-5 lg:px-0">
        <div className="flex flex-col items-center gap-2 text-center">
          <h2 className="text-[32px] font-semibold leading-[1.2]">
            Monthly revenue by volume & tier
          </h2>
        </div>

        <div className="w-full relative rounded-[20px] p-[1px] overflow-hidden revenue-table-wrapper">
          <div className="bg-purple-dark rounded-[19px] overflow-hidden w-full">
            <div className="revenue-scroll-container">
              <div className="overflow-x-auto revenue-scroll-wrapper">
                <div className="min-w-[800px]">
                  <div className="border-b border-line-6">
                    <div className="flex flex-nowrap items-center gap-4 px-6 py-8">
                      <div className="w-[200px] shrink-0 text-sm font-medium text-base-contrast/54 revenue-sticky-col leading-[1.2]">
                        Tier / Staked $ORDER
                      </div>
                      {[
                        "10M Vol.",
                        "30M Vol.",
                        "90M Vol.",
                        "1B Vol.",
                        "10B Vol.",
                      ].map((label, idx) => (
                        <div
                          key={idx}
                          className="flex-1 text-left text-sm font-medium text-base-contrast/54 leading-[1.2]"
                        >
                          {label}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col">
                    {/* Rows */}
                    {tiers.map((row, idx) => (
                      <div
                        key={row.tier}
                        className={`flex flex-nowrap items-center gap-4 px-6 py-6 ${
                          idx < 4 ? "mb-[2px]" : ""
                        }`}
                      >
                        <div className="flex items-center gap-4 w-[200px] shrink-0 revenue-sticky-col">
                          <div className="w-8 h-8 shrink-0 relative rounded-full overflow-hidden tier-icon-wrapper">
                            <img
                              src={row.icon}
                              alt={row.tier}
                              className="w-full h-full block opacity-100"
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="text-base text-base-contrast leading-[1.2]">
                              {row.tier}
                            </span>
                            <span className="text-sm text-purple-light leading-[1.2]">
                              {row.stake}
                            </span>
                          </div>
                        </div>
                        {row.vals.map((v, i) => (
                          <div
                            key={i}
                            className="flex-1 text-base text-[#1DF6B5]"
                          >
                            {v}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-line-6 p-6 flex flex-col gap-2">
              <div className="flex items-center gap-4">
                <div className="w-2 h-2 rounded-full shrink-0 bg-[linear-gradient(-36deg,#1DF6B5_0%,#86ED92_91%)]"></div>
                <span className="text-xs text-base-contrast/54">
                  Estimated monthly revenue; actual amount is dependent on
                  referrals' tiers and their taker volume.
                </span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-2 h-2 rounded-full shrink-0 bg-purple-light"></div>
                <span className="text-xs text-base-contrast/54">
                  Stake $ORDER tokens to unlock higher tiers immediately for
                  higher earnings.{" "}
                  <a
                    href="https://orderly.network/docs/introduction/trade-on-orderly/trading-basics/trading-fees#builder-staking-programme"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-light no-underline"
                  >
                    Learn more
                  </a>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
