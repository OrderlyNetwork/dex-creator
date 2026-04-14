export const TIER_CONFIG: Record<
  string,
  { threshold: number; fee: number; icon: string }
> = {
  Public: { threshold: 0, fee: 0.0003, icon: "/distributor/tier-public.png" },
  Silver: {
    threshold: 30000000,
    fee: 0.000275,
    icon: "/distributor/tier-silver.png",
  },
  Gold: {
    threshold: 90000000,
    fee: 0.00025,
    icon: "/distributor/tier-gold.png",
  },
  Platinum: {
    threshold: 1000000000,
    fee: 0.0002,
    icon: "/distributor/tier-platinum.png",
  },
  Diamond: {
    threshold: 10000000000,
    fee: 0.0001,
    icon: "/distributor/tier-diamond.png",
  },
};

export const ALPHA_GUARANTEE = 0.00001; // 0.1 bps minimum margin
