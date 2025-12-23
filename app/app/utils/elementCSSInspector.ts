export interface ElementCSSVariable {
  name: string;
  value: string;
  computedValue: string;
}

export function extractCSSVariablesFromElement(
  element: HTMLElement
): ElementCSSVariable[] {
  const finalComputedStyle = window.getComputedStyle(element);
  const rootStyle = window.getComputedStyle(document.documentElement);
  const allVarNames = new Set<string>();

  function processElement(el: HTMLElement) {
    const inlineStyle = el.getAttribute("style");
    if (inlineStyle) {
      const regex = /--([a-zA-Z0-9-]+):\s*([^;]+)/g;
      let match;
      while ((match = regex.exec(inlineStyle)) !== null) {
        const varName = match[1].trim();
        if (varName.startsWith("oui-")) {
          allVarNames.add(varName);
        }
      }
    }

    try {
      const stylesheets = Array.from(document.styleSheets);
      for (const sheet of stylesheets) {
        try {
          const rules = Array.from(sheet.cssRules || sheet.rules || []);
          for (const rule of rules) {
            if (rule instanceof CSSStyleRule) {
              try {
                const selector = rule.selectorText;
                if (
                  selector &&
                  (el.matches(selector) || el.querySelector(selector))
                ) {
                  const cssText = rule.cssText || rule.style?.cssText || "";
                  const varMatches = cssText.match(/var\(--[^)]+\)/g);
                  if (varMatches) {
                    varMatches.forEach(varMatch => {
                      const varNameMatch = varMatch.match(/var\(--([^),]+)/);
                      if (varNameMatch) {
                        const varName = varNameMatch[1].trim();
                        if (varName.startsWith("oui-")) {
                          allVarNames.add(varName);
                        }
                      }
                    });
                  }
                }
              } catch {}
            }
          }
        } catch {}
      }
    } catch {}
  }

  processElement(element);

  const allChildren = element.querySelectorAll("*");
  allChildren.forEach(child => {
    processElement(child as HTMLElement);
  });

  const variables: ElementCSSVariable[] = [];

  for (const varName of allVarNames) {
    const fullVarName = `--${varName}`;
    const computedValue = finalComputedStyle
      .getPropertyValue(fullVarName)
      .trim();
    const rootValue = rootStyle.getPropertyValue(fullVarName).trim();

    let definedValue = rootValue;
    const inlineStyle = element.getAttribute("style");
    if (inlineStyle) {
      const regex = new RegExp(
        `--${varName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}:\\s*([^;]+)`
      );
      const match = inlineStyle.match(regex);
      if (match) {
        definedValue = match[1].trim();
      }
    }

    const finalComputed = computedValue || rootValue || definedValue;

    if (finalComputed) {
      variables.push({
        name: varName,
        value: definedValue || rootValue || computedValue,
        computedValue: finalComputed,
      });
    }
  }

  return variables.sort((a, b) => a.name.localeCompare(b.name));
}

export function getElementPath(element: HTMLElement): string {
  const path: string[] = [];
  let current: HTMLElement | null = element;

  while (current && current !== document.body) {
    let selector = current.tagName.toLowerCase();

    if (current.id) {
      selector += `#${current.id}`;
      path.unshift(selector);
      break;
    }

    if (current.className && typeof current.className === "string") {
      const classes = current.className
        .split(" ")
        .filter(c => c && !c.startsWith("orderly-"))
        .slice(0, 2)
        .join(".");
      if (classes) {
        selector += `.${classes}`;
      }
    }

    const parentElement: HTMLElement | null = current.parentElement;
    if (parentElement) {
      const currentTagName = current.tagName;
      const siblings = Array.from(parentElement.children).filter(
        (el): el is HTMLElement =>
          el instanceof HTMLElement && el.tagName === currentTagName
      );
      if (siblings.length > 1 && current) {
        const index = siblings.indexOf(current) + 1;
        selector += `:nth-of-type(${index})`;
      }
    }

    path.unshift(selector);
    current = parentElement;
  }

  return path.join(" > ");
}

export interface AIFineTuneRule {
  selector: string;
  properties: string;
  fullRule: string;
  rawRule?: string; // Raw CSS string from the original theme (for deletion matching)
}

/**
 * Strips pseudo-classes (like :hover, :focus, :active) from a CSS selector
 * to allow matching elements regardless of their current state
 */
function stripPseudoClasses(selector: string): string {
  const pseudoElementPlaceholders: string[] = [];
  let protectedSelector = selector;
  let placeholderIndex = 0;

  protectedSelector = protectedSelector.replace(/::[a-zA-Z-]+/g, match => {
    const placeholder = `__PSEUDO_ELEMENT_${placeholderIndex++}__`;
    pseudoElementPlaceholders.push(match);
    return placeholder;
  });

  protectedSelector = protectedSelector.replace(
    /:([a-zA-Z-]+(\([^)]*\))?)/g,
    ""
  );

  pseudoElementPlaceholders.forEach((pseudoElement, index) => {
    protectedSelector = protectedSelector.replace(
      `__PSEUDO_ELEMENT_${index}__`,
      pseudoElement
    );
  });

  return protectedSelector.replace(/\s+/g, " ").trim();
}

/**
 * Extracts AI fine-tune CSS overrides from theme string and finds rules that match the given element
 */
export function extractAIFineTuneRulesForElement(
  theme: string | null,
  element: HTMLElement
): AIFineTuneRule[] {
  if (!theme) return [];

  const overrideMatch = theme.match(
    /\/\*\s*AI Fine-Tune Overrides\s*\*\/\s*([\s\S]*?)(?=\/\*|$)/
  );
  if (!overrideMatch || !overrideMatch[1]) return [];

  const overrideCSS = overrideMatch[1].trim();
  if (!overrideCSS) return [];

  const tempStyle = document.createElement("style");
  tempStyle.id = "temp-ai-finetune-check";
  tempStyle.textContent = overrideCSS;
  document.head.appendChild(tempStyle);

  try {
    const stylesheets = Array.from(document.styleSheets);
    const tempSheet = stylesheets.find(sheet => sheet.ownerNode === tempStyle);

    const rules: AIFineTuneRule[] = [];
    const elementsToCheck = [element];

    // First, try regex parsing to get raw CSS (preserves formatting)
    const ruleRegex = /([^{]+)\{([^}]+)\}/g;
    let match;
    const rawRules: Array<{
      selector: string;
      properties: string;
      rawRule: string;
    }> = [];

    while ((match = ruleRegex.exec(overrideCSS)) !== null) {
      const selector = match[1].trim();
      const properties = match[2].trim();

      if (!properties.trim()) {
        continue;
      }

      for (const elToCheck of elementsToCheck) {
        try {
          if (elToCheck.matches(selector)) {
            rawRules.push({
              selector,
              properties,
              rawRule: match[0],
            });
            break;
          }
        } catch {
          try {
            const baseSelector = stripPseudoClasses(selector);
            if (baseSelector && elToCheck.matches(baseSelector)) {
              rawRules.push({
                selector,
                properties,
                rawRule: match[0],
              });
              break;
            }
          } catch {}
        }
      }
    }

    // If we found rules via regex, use them (they have raw CSS)
    if (rawRules.length > 0) {
      for (const rawRule of rawRules) {
        rules.push({
          selector: rawRule.selector,
          properties: rawRule.properties,
          fullRule: rawRule.rawRule,
          rawRule: rawRule.rawRule,
        });
      }
    } else {
      // Fallback to CSSStyleRule parsing (normalized, but more reliable for complex CSS)
      if (tempSheet) {
        try {
          const cssRules = Array.from(tempSheet.cssRules || []);
          for (const rule of cssRules) {
            if (rule instanceof CSSStyleRule) {
              const selector = rule.selectorText;
              const properties = rule.style.cssText || "";

              let matches = false;
              for (const elToCheck of elementsToCheck) {
                try {
                  if (elToCheck.matches(selector)) {
                    matches = true;
                    break;
                  }
                } catch {
                  try {
                    const baseSelector = stripPseudoClasses(selector);
                    if (baseSelector && elToCheck.matches(baseSelector)) {
                      matches = true;
                      break;
                    }
                  } catch {}
                }
              }

              if (matches && properties.trim()) {
                rules.push({
                  selector,
                  properties,
                  fullRule: `${selector} { ${properties} }`,
                });
              }
            }
          }
        } catch {}
      }
    }

    return rules;
  } finally {
    tempStyle.remove();
  }
}
