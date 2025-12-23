export interface CSSVariables {
  [key: string]: string;
}

export function parseCSSVariables(css: string | null): CSSVariables {
  if (!css) {
    return {};
  }

  const cssVariables: CSSVariables = {};
  const variableRegex = /--([^:]+):\s*([^;]+);/g;
  let match;

  while ((match = variableRegex.exec(css)) !== null) {
    cssVariables[match[1]] = match[2].trim();
  }

  return cssVariables;
}

export function extractFontValues(css: string | null) {
  const variables = parseCSSVariables(css);

  return {
    fontFamily: variables["oui-font-family"] || "'Manrope', sans-serif",
    fontSize: variables["oui-font-size-base"] || "16px",
  };
}

export function generateThemeCSS(variables: CSSVariables): string {
  return `:root {
  --oui-font-family: ${variables["oui-font-family"] || "'Manrope', sans-serif"};
  --oui-font-size-base: ${variables["oui-font-size-base"] || "16px"};

  /* colors */
  --oui-color-primary: ${variables["oui-color-primary"] || "176 132 233"};
  --oui-color-primary-light: ${variables["oui-color-primary-light"] || "213 190 244"};
  --oui-color-primary-darken: ${variables["oui-color-primary-darken"] || "137 76 209"};
  --oui-color-primary-contrast: ${variables["oui-color-primary-contrast"] || "255 255 255"};

  --oui-color-link: ${variables["oui-color-link"] || "189 107 237"};
  --oui-color-link-light: ${variables["oui-color-link-light"] || "217 152 250"};

  --oui-color-secondary: ${variables["oui-color-secondary"] || "255 255 255"};
  --oui-color-tertiary: ${variables["oui-color-tertiary"] || "218 218 218"};
  --oui-color-quaternary: ${variables["oui-color-quaternary"] || "218 218 218"};

  --oui-color-danger: ${variables["oui-color-danger"] || "245 97 139"};
  --oui-color-danger-light: ${variables["oui-color-danger-light"] || "250 167 188"};
  --oui-color-danger-darken: ${variables["oui-color-danger-darken"] || "237 72 122"};
  --oui-color-danger-contrast: ${variables["oui-color-danger-contrast"] || "255 255 255"};

  --oui-color-success: ${variables["oui-color-success"] || "41 233 169"};
  --oui-color-success-light: ${variables["oui-color-success-light"] || "101 240 194"};
  --oui-color-success-darken: ${variables["oui-color-success-darken"] || "0 161 120"};
  --oui-color-success-contrast: ${variables["oui-color-success-contrast"] || "255 255 255"};

  --oui-color-warning: ${variables["oui-color-warning"] || "255 209 70"};
  --oui-color-warning-light: ${variables["oui-color-warning-light"] || "255 229 133"};
  --oui-color-warning-darken: ${variables["oui-color-warning-darken"] || "255 152 0"};
  --oui-color-warning-contrast: ${variables["oui-color-warning-contrast"] || "255 255 255"};

  --oui-color-fill: ${variables["oui-color-fill"] || "36 32 47"};
  --oui-color-fill-active: ${variables["oui-color-fill-active"] || "40 46 58"};

  --oui-color-base-1: ${variables["oui-color-base-1"] || "93 83 123"};
  --oui-color-base-2: ${variables["oui-color-base-2"] || "81 72 107"};
  --oui-color-base-3: ${variables["oui-color-base-3"] || "68 61 69"};
  --oui-color-base-4: ${variables["oui-color-base-4"] || "57 52 74"};
  --oui-color-base-5: ${variables["oui-color-base-5"] || "51 46 66"};
  --oui-color-base-6: ${variables["oui-color-base-6"] || "43 38 56"};
  --oui-color-base-7: ${variables["oui-color-base-7"] || "36 32 47"};
  --oui-color-base-8: ${variables["oui-color-base-8"] || "29 26 38"};
  --oui-color-base-9: ${variables["oui-color-base-9"] || "22 20 28"};
  --oui-color-base-10: ${variables["oui-color-base-10"] || "14 13 18"};

  --oui-color-base-foreground: ${variables["oui-color-base-foreground"] || "255 255 255"};
  --oui-color-line: ${variables["oui-color-line"] || "255 255 255"};

  --oui-color-trading-loss: ${variables["oui-color-trading-loss"] || "245 97 139"};
  --oui-color-trading-loss-contrast: ${variables["oui-color-trading-loss-contrast"] || "255 255 255"};
  --oui-color-trading-profit: ${variables["oui-color-trading-profit"] || "41 233 169"};
  --oui-color-trading-profit-contrast: ${variables["oui-color-trading-profit-contrast"] || "255 255 255"};

  /* gradients */
  --oui-gradient-primary-start: ${variables["oui-gradient-primary-start"] || "40 0 97"};
  --oui-gradient-primary-end: ${variables["oui-gradient-primary-end"] || "189 107 237"};

  --oui-gradient-secondary-start: ${variables["oui-gradient-secondary-start"] || "81 42 121"};
  --oui-gradient-secondary-end: ${variables["oui-gradient-secondary-end"] || "176 132 233"};

  --oui-gradient-success-start: ${variables["oui-gradient-success-start"] || "1 83 68"};
  --oui-gradient-success-end: ${variables["oui-gradient-success-end"] || "41 223 169"};

  --oui-gradient-danger-start: ${variables["oui-gradient-danger-start"] || "153 24 76"};
  --oui-gradient-danger-end: ${variables["oui-gradient-danger-end"] || "245 97 139"};

  --oui-gradient-brand-start: ${variables["oui-gradient-brand-start"] || "231 219 249"};
  --oui-gradient-brand-end: ${variables["oui-gradient-brand-end"] || "159 107 225"};
  --oui-gradient-brand-stop-start: ${variables["oui-gradient-brand-stop-start"] || "6.62%"};
  --oui-gradient-brand-stop-end: ${variables["oui-gradient-brand-stop-end"] || "86.5%"};
  --oui-gradient-brand-angle: ${variables["oui-gradient-brand-angle"] || "17.44deg"};

  --oui-gradient-warning-start: ${variables["oui-gradient-warning-start"] || "152 58 8"};
  --oui-gradient-warning-end: ${variables["oui-gradient-warning-end"] || "255 209 70"};

  --oui-gradient-neutral-start: ${variables["oui-gradient-neutral-start"] || "27 29 24"};
  --oui-gradient-neutral-end: ${variables["oui-gradient-neutral-end"] || "38 41 46"};

  /* rounded */
  --oui-rounded-sm: ${variables["oui-rounded-sm"] || "2px"};
  --oui-rounded: ${variables["oui-rounded"] || "4px"};
  --oui-rounded-md: ${variables["oui-rounded-md"] || "6px"};
  --oui-rounded-lg: ${variables["oui-rounded-lg"] || "8px"};
  --oui-rounded-xl: ${variables["oui-rounded-xl"] || "12px"};
  --oui-rounded-2xl: ${variables["oui-rounded-2xl"] || "16px"};
  --oui-rounded-full: ${variables["oui-rounded-full"] || "9999px"};

  /* spacing */
  --oui-spacing-xs: ${variables["oui-spacing-xs"] || "20rem"};
  --oui-spacing-sm: ${variables["oui-spacing-sm"] || "22.5rem"};
  --oui-spacing-md: ${variables["oui-spacing-md"] || "26.25rem"};
  --oui-spacing-lg: ${variables["oui-spacing-lg"] || "30rem"};
  --oui-spacing-xl: ${variables["oui-spacing-xl"] || "33.75rem"};
}

html, body {
  font-family: ${variables["oui-font-family"] || "'Manrope', sans-serif"} !important;
  font-size: ${variables["oui-font-size-base"] || "16px"} !important;
}

.orderly-app-container,
.orderly-app-container *,
.orderly-app-container *::before,
.orderly-app-container *::after {
  font-family: ${variables["oui-font-family"] || "'Manrope', sans-serif"} !important;
}
`;
}
