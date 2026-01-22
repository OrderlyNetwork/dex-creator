export interface DexData {
  id: string;
  brokerName: string;
  brokerId: string;
  themeCSS?: string | null;
  primaryLogo?: string | null;
  secondaryLogo?: string | null;
  favicon?: string | null;
  pnlPosters?: string[] | null;
  telegramLink?: string | null;
  discordLink?: string | null;
  xLink?: string | null;
  walletConnectProjectId?: string | null;
  privyAppId?: string | null;
  privyTermsOfUse?: string | null;
  privyLoginMethods?: string | null;
  enabledMenus?: string | null;
  customMenus?: string | null;
  enableAbstractWallet?: boolean;
  enableServiceDisclaimerDialog?: boolean;
  enableCampaigns?: boolean;
  swapFeeBps?: number | null;
  chainIds?: number[] | null;
  defaultChain?: number | null;
  repoUrl?: string | null;
  customDomain?: string | null;
  customDomainOverride?: string | null;
  disableMainnet?: boolean;
  disableTestnet?: boolean;
  disableEvmWallets?: boolean;
  disableSolanaWallets?: boolean;
  showOnBoard?: boolean;
  tradingViewColorConfig?: string | null;
  availableLanguages?: string[] | null;
  seoSiteName?: string | null;
  seoSiteDescription?: string | null;
  seoSiteLanguage?: string | null;
  seoSiteLocale?: string | null;
  seoTwitterHandle?: string | null;
  seoThemeColor?: string | null;
  seoKeywords?: string | null;
  analyticsScript?: string | null;
  symbolList?: string | null;
  restrictedRegions?: string | null;
  whitelistedIps?: string | null;
  description?: string | null;
  banner?: string | null;
  logo?: string | null;
  tokenAddress?: string | null;
  tokenChain?: string | null;
  websiteUrl?: string | null;
  isGraduated?: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ThemeTabType =
  | "colors"
  | "fonts"
  | "rounded"
  | "spacing"
  | "tradingview";

export const defaultTheme = `:root {
  --oui-font-family: 'Manrope', sans-serif;
  --oui-font-size-base: 16px;

  /* colors */
  --oui-color-primary: 176 132 233;
  --oui-color-primary-light: 213 190 244;
  --oui-color-primary-darken: 137 76 209;
  --oui-color-primary-contrast: 255 255 255;

  --oui-color-link: 189 107 237;
  --oui-color-link-light: 217 152 250;

  --oui-color-secondary: 255 255 255;
  --oui-color-tertiary: 218 218 218;
  --oui-color-quaternary: 218 218 218;

  --oui-color-danger: 245 97 139;
  --oui-color-danger-light: 250 167 188;
  --oui-color-danger-darken: 237 72 122;
  --oui-color-danger-contrast: 255 255 255;

  --oui-color-success: 41 233 169;
  --oui-color-success-light: 101 240 194;
  --oui-color-success-darken: 0 161 120;
  --oui-color-success-contrast: 255 255 255;

  --oui-color-warning: 255 209 70;
  --oui-color-warning-light: 255 229 133;
  --oui-color-warning-darken: 255 152 0;
  --oui-color-warning-contrast: 255 255 255;

  --oui-color-fill: 36 32 47;
  --oui-color-fill-active: 40 46 58;

  --oui-color-base-1: 93 83 123;
  --oui-color-base-2: 81 72 107;
  --oui-color-base-3: 68 61 69;
  --oui-color-base-4: 57 52 74;
  --oui-color-base-5: 51 46 66;
  --oui-color-base-6: 43 38 56;
  --oui-color-base-7: 36 32 47;
  --oui-color-base-8: 29 26 38;
  --oui-color-base-9: 22 20 28;
  --oui-color-base-10: 14 13 18;

  --oui-color-base-foreground: 255 255 255;
  --oui-color-line: 255 255 255;

  --oui-color-trading-loss: 245 97 139;
  --oui-color-trading-loss-contrast: 255 255 255;
  --oui-color-trading-profit: 41 233 169;
  --oui-color-trading-profit-contrast: 255 255 255;

  /* gradients */
  --oui-gradient-primary-start: 40 0 97;
  --oui-gradient-primary-end: 189 107 237;

  --oui-gradient-secondary-start: 81 42 121;
  --oui-gradient-secondary-end: 176 132 233;

  --oui-gradient-success-start: 1 83 68;
  --oui-gradient-success-end: 41 223 169;

  --oui-gradient-danger-start: 153 24 76;
  --oui-gradient-danger-end: 245 97 139;

  --oui-gradient-brand-start: 231 219 249;
  --oui-gradient-brand-end: 159 107 225;
  --oui-gradient-brand-stop-start: 6.62%;
  --oui-gradient-brand-stop-end: 86.5%;
  --oui-gradient-brand-angle: 17.44deg;

  --oui-gradient-warning-start: 152 58 8;
  --oui-gradient-warning-end: 255 209 70;

  --oui-gradient-neutral-start: 27 29 24;
  --oui-gradient-neutral-end: 38 41 46;

  /* rounded */
  --oui-rounded-sm: 2px;
  --oui-rounded: 4px;
  --oui-rounded-md: 6px;
  --oui-rounded-lg: 8px;
  --oui-rounded-xl: 12px;
  --oui-rounded-2xl: 16px;
  --oui-rounded-full: 9999px;

  /* spacing */
  --oui-spacing-xs: 20rem;
  --oui-spacing-sm: 22.5rem;
  --oui-spacing-md: 26.25rem;
  --oui-spacing-lg: 30rem;
  --oui-spacing-xl: 33.75rem;
}

html, body {
  font-family: 'Manrope', sans-serif !important;
  font-size: 16px !important;
}`;

export type ThemePreset = "1" | "2" | "3" | "4" | "5";

export interface ThemePresetDefinition {
  id: ThemePreset;
  name: string;
  theme: string;
}

export const themePresets: ThemePresetDefinition[] = [
  {
    id: "1",
    name: "1",
    theme: defaultTheme,
  },
  {
    id: "2",
    name: "2",
    theme: `:root {
  --oui-font-family: 'Manrope', sans-serif;

  /* global font sizes */
  --oui-font-size-xs: 12px;   /* small labels, table footers */
  --oui-font-size-sm: 12px;   /* default small text */
  --oui-font-size-md: 14px;   /* default body, chart labels */
  --oui-font-size-lg: 16px;   /* nav items, headings */
  --oui-font-size-xl: 20px;   /* section titles, key values */
  --oui-font-size-2xl: 24px;  /* page titles */

  /* specific semantic font sizes */
  --oui-font-size-nav: var(--oui-font-size-lg);              /* 16px */
  --oui-font-size-stats-label: 12px;                         /* stats labels */
  --oui-font-size-stats-value: 15px;                         /* stats values (was 14px) */
  --oui-font-size-chart-axis: var(--oui-font-size-sm);       /* 12px */
  --oui-font-size-chart-lastprice: var(--oui-font-size-md);  /* 14px */
  --oui-font-size-button: var(--oui-font-size-md);           /* 14px */
  --oui-font-size-pair-name: var(--oui-font-size-xl);        /* 20px */

  /*  order book specific sizes */
  --oui-font-size-ob-header: 13px;   /* was 12px */
  --oui-font-size-ob-row:    14px;   /* was 13px */
  --oui-font-size-ob-mid:    19px;   /* was 20px */

  /* font weights + line-heights */
  --oui-font-weight-regular: 400;
  --oui-font-weight-medium: 500;
  --oui-font-weight-semibold: 600;
  --oui-font-weight-bold: 700;

  --oui-line-height-tight: 1.15;
  --oui-line-height-normal: 1.35;
  --oui-line-height-loose: 1.5;

  /* colors */
  --oui-color-primary: 56 210 199;
  --oui-color-primary-light: 56 210 199;
  --oui-color-primary-darken: 56 210 199;
  --oui-color-primary-contrast: 255 255 255;

  --oui-color-link: 56 210 199;
  --oui-color-link-light: 56 210 199;

  --oui-color-secondary: 255 255 255;
  --oui-color-tertiary: 218 218 218;
  --oui-color-quaternary: 218 218 218;

  --oui-color-danger: 245 97 139;
  --oui-color-danger-light: 250 167 188;
  --oui-color-danger-darken: 237 72 122;
  --oui-color-danger-contrast: 255 255 255;

  --oui-color-success: 41 233 169;
  --oui-color-success-light: 101 240 194;
  --oui-color-success-darken: 0 161 120;
  --oui-color-success-contrast: 255 255 255;

  --oui-color-warning: 255 209 70;
  --oui-color-warning-light: 255 229 133;
  --oui-color-warning-darken: 255 152 0;
  --oui-color-warning-contrast: 255 255 255;

  --oui-color-fill: 36 32 47;
  --oui-color-fill-active: 40 46 58;

  --oui-color-base-1: 93 83 123;
  --oui-color-base-2: 81 72 107;
  --oui-color-base-3: 68 61 69;
  --oui-color-base-4: 57 52 74;
  --oui-color-base-5: 51 46 66;
  --oui-color-base-6: 43 38 56;
  --oui-color-base-7: 64 59 88;
  --oui-color-base-8: 29 26 38;
  --oui-color-base-9: 15 26 31;
  --oui-color-base-10: 30 38 43;

  --oui-color-base-foreground: 255 255 255;
  --oui-color-line: 255 255 255;

  --oui-color-trading-loss: 217 139 139;        /* red sell text */
  --oui-color-trading-loss-contrast: 255 255 255;
  --oui-color-trading-profit: 71 199 176;        /* green buy text */
  --oui-color-trading-profit-contrast: 255 255 255;

  /* gradients */
  --oui-gradient-primary-start: 56 210 199;
  --oui-gradient-primary-end: 101 240 194;

  --oui-gradient-secondary-start: 81 42 121;
  --oui-gradient-secondary-end: 56 210 199;

  --oui-gradient-success-start: 1 83 68;
  --oui-gradient-success-end: 41 223 169;

  --oui-gradient-danger-start: 153 24 76;
  --oui-gradient-danger-end: 245 97 139;

  --oui-gradient-brand-start: 56 210 199;
  --oui-gradient-brand-end: 56 210 199;
  --oui-gradient-brand-stop-start: 6.62%;
  --oui-gradient-brand-stop-end: 86.5%;
  --oui-gradient-brand-angle: 17.44deg;

  --oui-gradient-warning-start: 152 58 8;
  --oui-gradient-warning-end: 255 209 70;

  --oui-gradient-neutral-start: 27 29 24;
  --oui-gradient-neutral-end: 38 41 46;

  /* rounded */
  --oui-rounded-sm: 0px;
  --oui-rounded: 0px;
  --oui-rounded-md: 6px;
  --oui-rounded-lg: 0px;
  --oui-rounded-xl: 0px;
  --oui-rounded-2xl: 0px;
  --oui-rounded-full: 9999px;

  /* spacing */
  --oui-spacing-xs: 20rem;
  --oui-spacing-sm: 22.5rem;
  --oui-spacing-md: 26.25rem;
  --oui-spacing-lg: 30rem;
  --oui-spacing-xl: 33.75rem;
}`,
  },
  {
    id: "3",
    name: "3",
    theme: `:root {
  --oui-font-family: 'Manrope', sans-serif;

  /* colors */
  --oui-color-primary: 234 166 127;
  --oui-color-primary-light: 251 201 175;
  --oui-color-primary-darken: 217 144 103;
  --oui-color-primary-contrast: 255 255 255;

  --oui-color-link: 210 144 183;
  --oui-color-link-light: 243 193 217;

  --oui-color-secondary: 255 255 255;
  --oui-color-tertiary: 218 218 218;
  --oui-color-quaternary: 218 218 218;

  --oui-color-danger: 245 97 139;
  --oui-color-danger-light: 250 167 188;
  --oui-color-danger-darken: 237 72 122;
  --oui-color-danger-contrast: 255 255 255;

  --oui-color-success: 41 233 169;
  --oui-color-success-light: 101 240 194;
  --oui-color-success-darken: 0 161 120;
  --oui-color-success-contrast: 255 255 255;

  --oui-color-warning: 255 209 70;
  --oui-color-warning-light: 255 229 133;
  --oui-color-warning-darken: 255 152 0;
  --oui-color-warning-contrast: 255 255 255;

  --oui-color-fill: 36 32 47;
  --oui-color-fill-active: 40 46 58;

  --oui-color-base-1: 93 83 123;
  --oui-color-base-2: 81 72 107;
  --oui-color-base-3: 68 61 69;
  --oui-color-base-4: 57 52 74;
  --oui-color-base-5: 51 46 66;
  --oui-color-base-6: 43 38 56;
  --oui-color-base-7: 62 53 90;
  --oui-color-base-8: 29 26 38;
  --oui-color-base-9: 22 20 28;
  --oui-color-base-10: 14 13 18;

  --oui-color-base-foreground: 255 255 255;
  --oui-color-line: 255 255 255;

  --oui-color-trading-loss: 231 100 72;
  --oui-color-trading-loss-contrast: 255 255 255;
  --oui-color-trading-profit: 45 199 193;
  --oui-color-trading-profit-contrast: 255 255 255;

  /* gradients */
  --oui-gradient-primary-start: 96 64 48;
  --oui-gradient-primary-end: 234 166 127;

  --oui-gradient-secondary-start: 81 42 121;
  --oui-gradient-secondary-end: 176 132 233;

  --oui-gradient-success-start: 1 83 68;
  --oui-gradient-success-end: 41 223 169;

  --oui-gradient-danger-start: 153 24 76;
  --oui-gradient-danger-end: 245 97 139;

  --oui-gradient-brand-start: 250 205 150;
  --oui-gradient-brand-end: 234 166 127;
  --oui-gradient-brand-stop-start: 6.62%;
  --oui-gradient-brand-stop-end: 86.5%;
  --oui-gradient-brand-angle: 17.44deg;

  --oui-gradient-warning-start: 152 58 8;
  --oui-gradient-warning-end: 255 209 70;

  --oui-gradient-neutral-start: 27 29 24;
  --oui-gradient-neutral-end: 38 41 46;

  /* rounded */
  --oui-rounded-sm: 2px;
  --oui-rounded: 0px;
  --oui-rounded-md: 0px;
  --oui-rounded-lg: 0px;
  --oui-rounded-xl: 0px;
  --oui-rounded-2xl: 0px;
  --oui-rounded-full: 9999px;

  /* spacing */
  --oui-spacing-xs: 20rem;
  --oui-spacing-sm: 22.5rem;
  --oui-spacing-md: 26.25rem;
  --oui-spacing-lg: 30rem;
  --oui-spacing-xl: 33.75rem;
}`,
  },
  {
    id: "4",
    name: "4",
    theme: `:root {
  --oui-font-family: 'Roboto', sans-serif;
  --oui-font-size-base: 15px;

  /* colors */
  --oui-color-primary: 139 196 94;
  --oui-color-primary-light: 156 220 106;
  --oui-color-primary-darken: 110 160 70;
  --oui-color-primary-contrast: 0 0 0;

  --oui-color-link: 189 107 237;
  --oui-color-link-light: 217 152 250;

  --oui-color-secondary: 255 255 255;
  --oui-color-tertiary: 180 180 180;
  --oui-color-quaternary: 120 120 120;

  --oui-color-danger: 255 69 123;
  --oui-color-danger-light: 255 120 160;
  --oui-color-danger-darken: 210 40 90;
  --oui-color-danger-contrast: 255 255 255;

  --oui-color-success: 156 220 106;
  --oui-color-success-light: 180 240 140;
  --oui-color-success-darken: 120 180 80;
  --oui-color-success-contrast: 0 0 0;

  --oui-color-warning: 255 209 70;
  --oui-color-warning-light: 255 229 133;
  --oui-color-warning-darken: 255 152 0;
  --oui-color-warning-contrast: 0 0 0;

  --oui-color-fill: 17 17 17;
  --oui-color-fill-active: 24 24 24;

  --oui-color-base-1: 30 30 30;
  --oui-color-base-2: 40 40 40;
  --oui-color-base-3: 55 55 55;
  --oui-color-base-4: 80 80 80;
  --oui-color-base-5: 15 15 15;
  --oui-color-base-6: 0 0 0;
  --oui-color-base-7: 15 15 15;
  --oui-color-base-8: 30 30 30;
  --oui-color-base-9: 15 15 15;
  --oui-color-base-10: 0 0 0;

  --oui-color-base-foreground: 255 255 255;
  --oui-color-line: 60 60 60;

  --oui-color-trading-loss: 255 69 123;
  --oui-color-trading-loss-contrast: 255 255 255;
  --oui-color-trading-profit: 156 220 106;
  --oui-color-trading-profit-contrast: 0 0 0;

  /* gradients */
  --oui-gradient-primary-start: 40 0 97;
  --oui-gradient-primary-end: 189 107 237;

  --oui-gradient-secondary-start: 81 42 121;
  --oui-gradient-secondary-end: 176 132 233;

  --oui-gradient-success-start: 1 83 68;
  --oui-gradient-success-end: 41 223 169;

  --oui-gradient-danger-start: 153 24 76;
  --oui-gradient-danger-end: 245 97 139;

  --oui-gradient-brand-start: 255 255 255;
  --oui-gradient-brand-end: 255 255 255;
  --oui-gradient-brand-stop-start: 6.62%;
  --oui-gradient-brand-stop-end: 86.5%;
  --oui-gradient-brand-angle: 17.44deg;

  --oui-gradient-warning-start: 152 58 8;
  --oui-gradient-warning-end: 255 209 70;

  --oui-gradient-neutral-start: 27 29 24;
  --oui-gradient-neutral-end: 38 41 46;

  /* rounded */
  --oui-rounded-sm: 1px;
  --oui-rounded: 1px;
  --oui-rounded-md: 30px;
  --oui-rounded-lg: 1px;
  --oui-rounded-xl: 1px;
  --oui-rounded-2xl: 1px;
  --oui-rounded-full: 9999px;

  /* spacing */
  --oui-spacing-xs: 20rem;
  --oui-spacing-sm: 22.5rem;
  --oui-spacing-md: 26.25rem;
  --oui-spacing-lg: 30rem;
  --oui-spacing-xl: 33.75rem;
}

html, body {
  font-family: 'Roboto', sans-serif !important;
  font-size: 15px !important;
}`,
  },

  {
    id: "5",
    name: "5",
    theme: `:root {
  --oui-font-family: 'IBM Plex Sans', sans-serif;
  --trading-disabled-text: "Trading Disabled";

  /* colors */
  --oui-color-primary: 255 186 0;
  --oui-color-primary-light: 255 204 51;
  --oui-color-primary-darken: 204 149 0;
  --oui-color-primary-contrast: 0 0 0;

  --oui-color-link: 255 186 0;
  --oui-color-link-light: 255 204 51;

  --oui-color-secondary: 255 255 255;
  --oui-color-tertiary: 136 141 153;
  --oui-color-quaternary: 94 99 108;

  --oui-color-danger: 234 57 67;
  --oui-color-danger-light: 255 102 102;
  --oui-color-danger-darken: 239 69 74;
  --oui-color-danger-contrast: 255 255 255;

  --oui-color-success: 22 163 74;
  --oui-color-success-light: 72 187 120;
  --oui-color-success-darken: 32 178 108;
  --oui-color-success-contrast: 255 255 255;

  --oui-color-warning: 255 159 67;
  --oui-color-warning-light: 255 183 111;
  --oui-color-warning-darken: 230 130 50;
  --oui-color-warning-contrast: 255 255 255;

  --oui-color-fill: 24 26 32;
  --oui-color-fill-active: 34 36 44;

  --oui-color-base-1: 44 48 58;
  --oui-color-base-2: 38 41 50;
  --oui-color-base-3: 32 34 42;
  --oui-color-base-4: 69 64 94;
  --oui-color-base-5: 24 26 32;
  --oui-color-base-6: 20 22 28;
  --oui-color-base-7: 67 70 81;
  --oui-color-base-8: 12 14 20;
  --oui-color-base-9: 8 10 16;
  --oui-color-base-10: 4 6 12;


  --oui-color-base-foreground: 255 255 255;
  --oui-color-line: 93 83 123;

  --oui-color-trading-loss: 251 65 74;
  --oui-color-trading-loss-contrast: 255 255 255;
  --oui-color-trading-profit: 29 195 90;
  --oui-color-trading-profit-contrast: 255 255 255;

  /* gradients */
  --oui-gradient-primary-start: 204 149 0;
  --oui-gradient-primary-end: 255 204 51;

  --oui-gradient-secondary-start: 44 48 58;
  --oui-gradient-secondary-end: 24 26 32;

  --oui-gradient-success-start: 20 140 60;
  --oui-gradient-success-end: 22 163 74;

  --oui-gradient-danger-start: 200 50 60;
  --oui-gradient-danger-end: 234 57 67;

  --oui-gradient-brand-start: 255 186 0;
  --oui-gradient-brand-end: 255 159 67;
  --oui-gradient-brand-stop-start: 6.62%;
  --oui-gradient-brand-stop-end: 86.5%;
  --oui-gradient-brand-angle: 17.44deg;

  --oui-gradient-warning-start: 230 130 50;
  --oui-gradient-warning-end: 255 159 67;

  --oui-gradient-neutral-start: 24 26 32;
  --oui-gradient-neutral-end: 34 36 44;

  /* rounded */
  --oui-rounded-sm: 2px;
  --oui-rounded: 4px;
  --oui-rounded-md: 6px;
  --oui-rounded-lg: 8px;
  --oui-rounded-xl: 12px;
  --oui-rounded-2xl: 16px;
  --oui-rounded-full: 9999px;

  /* spacing */
  --oui-spacing-xs: 20rem;
  --oui-spacing-sm: 22.5rem;
  --oui-spacing-md: 26.25rem;
  --oui-spacing-lg: 30rem;
  --oui-spacing-xl: 33.75rem;
}

html, body {
  font-family: 'IBM Plex Sans', sans-serif !important;
  font-size: 15.5px !important;
}`,
  },
];
