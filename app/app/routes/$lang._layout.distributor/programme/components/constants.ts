export const PROGRAMME_CONFIG = {
  API_URL: "https://data-api.orderly.network/orderly/api/v1/distributors/stats",
  API_KEY: "rJzGVc5G8WnjkMkkcZ8ZeWCQTzyTiI8Oo2SCDrNN05I",
  MIN_SPREAD_BPS: 0.1,
  SLIDER_MIN: 1,
  SLIDER_MAX: 500,
  SLIDER_DEFAULT: 50,
  DEFAULT_DISTRIBUTOR_TIER_INDEX: 3,
  DEFAULT_BUILDER_TIER_INDEX: 0,
  DEFAULT_TAKER_RATIO: 60,
  LEADERBOARD_LIMIT: 15,
  LEADERBOARD_MIN_EARNINGS_USD: 100,
} as const;

export type TierName = "Public" | "Silver" | "Gold" | "Platinum" | "Diamond";

export interface TierConfig {
  name: TierName;
  makerBps: number;
  takerBps: number;
  rwaMakerBps: number;
  rwaTakerBps: number;
}

export const TIERS: TierConfig[] = [
  {
    name: "Public",
    makerBps: 0,
    takerBps: 3.0,
    rwaMakerBps: 0,
    rwaTakerBps: 5.0,
  },
  {
    name: "Silver",
    makerBps: -0.05,
    takerBps: 2.75,
    rwaMakerBps: -0.15,
    rwaTakerBps: 4.75,
  },
  {
    name: "Gold",
    makerBps: -0.1,
    takerBps: 2.5,
    rwaMakerBps: -0.25,
    rwaTakerBps: 4.5,
  },
  {
    name: "Platinum",
    makerBps: -0.15,
    takerBps: 2.0,
    rwaMakerBps: -0.35,
    rwaTakerBps: 4.0,
  },
  {
    name: "Diamond",
    makerBps: -0.2,
    takerBps: 1.0,
    rwaMakerBps: -0.5,
    rwaTakerBps: 3.0,
  },
];

const ADJECTIVES = [
  "Cosmic",
  "Shadow",
  "Neon",
  "Crimson",
  "Silent",
  "Mega",
  "Dark",
  "Swift",
  "Iron",
  "Golden",
  "Phantom",
  "Savage",
  "Hyper",
  "Frozen",
  "Electric",
];

const ANIMALS = [
  "Falcon",
  "Wolf",
  "Panther",
  "Viper",
  "Eagle",
  "Tiger",
  "Shark",
  "Phoenix",
  "Lynx",
  "Cobra",
  "Dragon",
  "Raven",
  "Puma",
  "Jaguar",
  "Mantis",
];

export const anonymizeDistributor = (index: number) => {
  return `${ADJECTIVES[index % ADJECTIVES.length]}-${ANIMALS[index % ANIMALS.length]}`;
};

export const formatCurrency = (value: number) => {
  if (value >= 1_000_000_000) {
    return `$${(value / 1_000_000_000).toFixed(2)}B`;
  }

  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(2)}M`;
  }

  if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(1)}K`;
  }

  return `$${value.toFixed(2)}`;
};

export const formatCompactCurrency = (value: number) => {
  if (value >= 1_000_000_000) {
    return `$${(value / 1_000_000_000).toFixed(1)}B`;
  }

  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(0)}M`;
  }

  if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(0)}K`;
  }

  return `$${value.toFixed(0)}`;
};
