import type { FaqItem } from "../components/EditableFaqList";

export const DEFAULT_KEY_FEATURES = [
  "Built on Orderly Network's omnichain infrastructure",
  "Trade perpetual futures across EVM chains and Solana",
  "Unified cross-chain liquidity pool",
  "Up to 50x leverage trading",
  "Advanced order types (limit, stop-loss, take-profit)",
  "Cross-margin account management",
  "Low trading fees with competitive spreads",
  "Sub-second order execution",
  "Real-time market data and analytics",
  "Professional risk management tools",
];

export const DEFAULT_FAQ_ITEMS: FaqItem[] = [
  {
    question: "What is Orderly Network and how does it power this DEX?",
    answer:
      "Orderly Network is an omnichain infrastructure layer that powers this DEX, providing unified liquidity across EVM chains and Solana. It enables seamless cross-chain perpetual futures trading with deep liquidity and professional-grade trading infrastructure.",
  },
  {
    question: "Can I trade perpetual futures across different blockchains?",
    answer:
      "Yes! This DEX is built on Orderly Network's omnichain infrastructure, allowing you to trade perpetual futures across multiple EVM chains and Solana from a single interface. Your positions and collateral are unified across all supported chains.",
  },
  {
    question: "What is the maximum leverage I can use?",
    answer:
      "You can trade with up to 50x leverage on perpetual futures contracts. However, higher leverage increases both potential profits and risks. Always use appropriate risk management strategies and never risk more than you can afford to lose.",
  },
  {
    question: "How does cross-margin trading work?",
    answer:
      "Cross-margin trading allows you to use your entire account balance as collateral for all open positions. This maximizes capital efficiency by sharing margin across positions, but also means that losses in one position can affect your other positions. Monitor your account health and use stop-loss orders to manage risk.",
  },
  {
    question: "What are the trading fees?",
    answer:
      "Trading fees are competitive and vary based on whether you're a maker (providing liquidity) or taker (taking liquidity). Maker fees are typically lower than taker fees. Check the fee structure section for detailed information.",
  },
  {
    question: "Which wallets are supported?",
    answer:
      "We support a wide range of wallets including MetaMask, WalletConnect-compatible wallets, Privy (for email and social logins), and Solana wallets. You can connect wallets from multiple chains to access the full omnichain trading experience.",
  },
  {
    question: "How do I manage my risk when trading with leverage?",
    answer:
      "Use stop-loss orders to limit potential losses, maintain adequate margin levels, diversify your positions, and never risk more than you can afford to lose. Monitor your account health and liquidation price regularly. Consider using lower leverage until you're comfortable with the risks.",
  },
  {
    question: "What order types are available?",
    answer:
      "We support multiple order types including market orders, limit orders, stop-loss orders, and take-profit orders. Advanced traders can also use conditional orders and trailing stops to implement sophisticated trading strategies.",
  },
  {
    question: "Is my collateral safe and secure?",
    answer:
      "Yes. This DEX is non-custodial, meaning you maintain full control of your funds. Your collateral is secured by Orderly Network's infrastructure, which uses smart contracts on-chain. The platform has been audited and is built on battle-tested DeFi infrastructure. However, always be aware that trading involves risk, and you should never deposit more than you can afford to lose.",
  },
  {
    question: "How does the unified liquidity pool work?",
    answer:
      "Orderly Network aggregates liquidity from across all supported chains into a unified pool. This means you get access to deeper liquidity, tighter spreads, and better execution prices regardless of which blockchain you're trading on. The unified pool ensures optimal trading conditions for all users.",
  },
];

export const DEFAULT_METADATA = {
  description:
    "Trade perpetual futures across EVM chains and Solana on a non-custodial DEX powered by Orderly Network. Unified liquidity, up to 50x leverage, and professional trading tools.",
  keywords: [
    "DEX",
    "perpetual futures",
    "Orderly Network",
    "omnichain trading",
    "DeFi",
    "cryptocurrency trading",
    "cross-chain",
    "leverage trading",
    "non-custodial",
    "EVM",
    "Solana",
  ],
};

export const FONT_FAMILIES = [
  { name: "Manrope", value: "'Manrope', sans-serif", category: "Sans-serif" },
  { name: "Inter", value: "'Inter', sans-serif", category: "Sans-serif" },
  { name: "Roboto", value: "'Roboto', sans-serif", category: "Sans-serif" },
  {
    name: "Open Sans",
    value: "'Open Sans', sans-serif",
    category: "Sans-serif",
  },
  { name: "Lato", value: "'Lato', sans-serif", category: "Sans-serif" },
  { name: "Poppins", value: "'Poppins', sans-serif", category: "Sans-serif" },
  {
    name: "Montserrat",
    value: "'Montserrat', sans-serif",
    category: "Sans-serif",
  },
  {
    name: "Source Sans Pro",
    value: "'Source Sans Pro', sans-serif",
    category: "Sans-serif",
  },
  { name: "Nunito", value: "'Nunito', sans-serif", category: "Sans-serif" },
  {
    name: "Raleway",
    value: "'Raleway', sans-serif",
    category: "Sans-serif",
  },
  {
    name: "Ubuntu",
    value: "'Ubuntu', sans-serif",
    category: "Sans-serif",
  },
  {
    name: "Outfit",
    value: "'Outfit', sans-serif",
    category: "Sans-serif",
  },
  {
    name: "Space Grotesk",
    value: "'Space Grotesk', sans-serif",
    category: "Sans-serif",
  },
  {
    name: "IBM Plex Sans",
    value: "'IBM Plex Sans', sans-serif",
    category: "Sans-serif",
  },
  {
    name: "DM Sans",
    value: "'DM Sans', sans-serif",
    category: "Sans-serif",
  },
  {
    name: "Playfair Display",
    value: "'Playfair Display', serif",
    category: "Serif",
  },
  { name: "Merriweather", value: "'Merriweather', serif", category: "Serif" },
  { name: "Georgia", value: "Georgia, serif", category: "Serif" },
  {
    name: "Fira Code",
    value: "'Fira Code', monospace",
    category: "Monospace",
  },
  {
    name: "JetBrains Mono",
    value: "'JetBrains Mono', monospace",
    category: "Monospace",
  },
];

export const SECTION_TYPES = [
  {
    id: "hero",
    label: "Hero Section",
    description: "Main headline with call-to-action",
  },
  {
    id: "features",
    label: "Features",
    description: "Key features and benefits",
  },
  {
    id: "about",
    label: "About",
    description: "About the project/team",
  },
  {
    id: "cta",
    label: "Call to Action",
    description: "Secondary CTA section",
  },
  {
    id: "faq",
    label: "FAQ",
    description: "Frequently asked questions",
  },
  {
    id: "feeStructure",
    label: "Fee Structure",
    description: "Trading fees and costs",
  },
  {
    id: "team",
    label: "Team",
    description: "Team members",
  },
  {
    id: "socials",
    label: "Social Links",
    description: "Social media links",
  },
  {
    id: "contact",
    label: "Contact",
    description: "Contact information",
  },
];
