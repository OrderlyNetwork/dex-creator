import { FC, useState, useEffect } from "react";
import { Button } from "./Button";
import FormInput from "./FormInput";
import { Card } from "./Card";
import { post } from "../utils/apiClient";
import { toast } from "react-toastify";
import { useTranslation } from "~/i18n";
import { useAuth } from "../context/useAuth";
import { useModal } from "../context/ModalContext";
import { DexPreviewProps } from "./DexPreview";

const MAX_ELEMENTS = 15;
const MAX_DEPTH_ELEMENTS = 4;
const MAX_DEPTH_HTML = 5;

const DEFAULT_CSS_VALUES = new Set([
  "none",
  "normal",
  "auto",
  "initial",
  "inherit",
  "unset",
  "revert",
  "transparent",
  "rgba(0, 0, 0, 0)",
  "0px",
  "0",
]);

const IMPORTANT_CSS_PROPERTIES = new Set([
  // Layout & positioning
  "display",
  "position",
  "top",
  "right",
  "bottom",
  "left",
  "z-index",
  "float",
  "clear",
  // Flexbox
  "flex",
  "flex-direction",
  "flex-wrap",
  "justify-content",
  "align-items",
  "align-content",
  "gap",
  // Grid
  "grid",
  "grid-template-columns",
  "grid-template-rows",
  "grid-template-areas",
  "grid-column",
  "grid-row",
  "grid-area",
  // Sizing
  "width",
  "height",
  "min-width",
  "min-height",
  "max-width",
  "max-height",
  "box-sizing",
  // Spacing
  "margin",
  "margin-top",
  "margin-right",
  "margin-bottom",
  "margin-left",
  "padding",
  "padding-top",
  "padding-right",
  "padding-bottom",
  "padding-left",
  // Visual appearance
  "color",
  "background",
  "background-color",
  "background-image",
  "background-size",
  "background-position",
  "background-repeat",
  "border",
  "border-top",
  "border-right",
  "border-bottom",
  "border-left",
  "border-width",
  "border-style",
  "border-color",
  "border-radius",
  "box-shadow",
  "outline",
  "opacity",
  "visibility",
  "overflow",
  "overflow-x",
  "overflow-y",
  // Typography
  "font-family",
  "font-size",
  "font-weight",
  "font-style",
  "line-height",
  "text-align",
  "text-decoration",
  "text-transform",
  "letter-spacing",
  "word-spacing",
  "white-space",
  // Transform & effects
  "transform",
  "transition",
  "cursor",
  "pointer-events",
  "user-select",
]);

export interface AIFineTuneModalProps {
  isOpen: boolean;
  onClose: () => void;
  element: HTMLElement | null;
  currentTheme: string | null;
  onApplyOverrides: (overrides: string) => void;
  previewProps?: DexPreviewProps;
  viewMode?: "desktop" | "mobile";
}

const AIFineTuneModal: FC<AIFineTuneModalProps> = ({
  isOpen,
  onClose,
  element,
  currentTheme: _currentTheme,
  onApplyOverrides,
  previewProps,
  viewMode = "desktop",
}) => {
  const { t } = useTranslation();
  const { token: authToken } = useAuth();
  const { openModal } = useModal();
  const token = authToken;
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [htmlStructure, setHtmlStructure] = useState<string>("");
  const [elements, setElements] = useState<
    Array<{
      elementSelector: string;
      computedStyles: Record<string, string>;
    }>
  >([]);
  const [cssVariables, setCssVariables] = useState<Record<string, string>>({});

  const getSelector = (el: HTMLElement | Element): string => {
    if (el.id) return `#${el.id}`;
    const className = el.className;
    if (className) {
      let classNameStr: string;
      if (typeof className === "string") {
        classNameStr = className;
      } else if (
        typeof className === "object" &&
        className !== null &&
        "baseVal" in className
      ) {
        classNameStr = (className as { baseVal: string }).baseVal;
      } else {
        classNameStr = String(className);
      }
      if (classNameStr) {
        const classes = classNameStr
          .split(" ")
          .filter(c => c && !c.startsWith("orderly-"))
          .slice(0, 3)
          .join(".");
        if (classes) return `.${classes}`;
      }
    }
    return el.tagName.toLowerCase();
  };

  const extractElementData = (el: HTMLElement): Record<string, string> => {
    const styles = window.getComputedStyle(el);
    const computedStyles: Record<string, string> = {};

    for (let i = 0; i < styles.length; i++) {
      const prop = styles[i];
      if (prop.startsWith("-") || !IMPORTANT_CSS_PROPERTIES.has(prop)) {
        continue;
      }
      const value = styles.getPropertyValue(prop);
      const trimmedValue = value.trim();
      if (
        !trimmedValue ||
        prop === "cssText" ||
        DEFAULT_CSS_VALUES.has(trimmedValue)
      ) {
        continue;
      }
      computedStyles[prop] = trimmedValue;
    }

    return computedStyles;
  };

  const extractCSSVariables = (): Record<string, string> => {
    const cssVariables: Record<string, string> = {};

    try {
      for (let i = 0; i < document.styleSheets.length; i++) {
        try {
          const sheet = document.styleSheets[i];
          const rules = sheet.cssRules || sheet.rules;
          if (rules) {
            for (let j = 0; j < rules.length; j++) {
              const rule = rules[j];
              if (
                rule instanceof CSSStyleRule &&
                (rule.selectorText === ":root" ||
                  rule.selectorText === "html" ||
                  rule.selectorText === "html, body")
              ) {
                const style = rule.style;
                for (let k = 0; k < style.length; k++) {
                  const prop = style[k];
                  if (prop.startsWith("--oui-")) {
                    const value = style.getPropertyValue(prop);
                    if (value) {
                      cssVariables[prop] = value;
                    }
                  }
                }
              }
            }
          }
        } catch (_e) {
          continue;
        }
      }
    } catch (_e) {}

    return cssVariables;
  };

  useEffect(() => {
    if (!isOpen || !element) {
      setPrompt("");
      setHtmlStructure("");
      setElements([]);
      setCssVariables({});
      return;
    }

    const clone = element.cloneNode(true) as HTMLElement;
    const limitDepth = (el: HTMLElement, depth: number = 0): void => {
      if (depth >= MAX_DEPTH_HTML) {
        el.innerHTML = "";
        return;
      }
      Array.from(el.children).forEach(child => {
        limitDepth(child as HTMLElement, depth + 1);
      });
    };
    limitDepth(clone);
    const html = clone.outerHTML;
    setHtmlStructure(html);

    const rootCssVariables = extractCSSVariables();
    setCssVariables(rootCssVariables);

    const collectedElements: Array<{
      elementSelector: string;
      computedStyles: Record<string, string>;
    }> = [];

    const queue: Array<{ element: HTMLElement; depth: number }> = [
      { element, depth: 0 },
    ];

    while (queue.length > 0 && collectedElements.length < MAX_ELEMENTS) {
      const { element: currentEl, depth } = queue.shift()!;

      if (depth > MAX_DEPTH_ELEMENTS) continue;
      if (!(currentEl instanceof HTMLElement)) continue;

      const computedStyles = extractElementData(currentEl);
      collectedElements.push({
        elementSelector: getSelector(currentEl),
        computedStyles,
      });

      if (
        depth < MAX_DEPTH_ELEMENTS &&
        collectedElements.length < MAX_ELEMENTS
      ) {
        Array.from(currentEl.children).forEach(child => {
          if (child instanceof HTMLElement) {
            queue.push({ element: child, depth: depth + 1 });
          }
        });
      }
    }

    setElements(collectedElements);
  }, [isOpen, element]);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error(t("aiFineTuneModal.pleaseEnterDescription"));
      return;
    }

    if (!token) {
      toast.error(t("aiFineTuneModal.authenticationRequired"));
      return;
    }

    if (!element) {
      toast.error(t("aiFineTuneModal.noElementSelected"));
      return;
    }

    setIsGenerating(true);

    try {
      let existingOverrides = "";
      if (_currentTheme) {
        const overrideMatch = _currentTheme.match(
          /\/\*\s*AI Fine-Tune Overrides\s*\*\/\s*([\s\S]*?)(?=\/\*|$)/
        );
        if (overrideMatch && overrideMatch[1]) {
          existingOverrides = overrideMatch[1].trim();
        }
      }

      const response = await post<{ overrides: string[] }>(
        "api/theme/fine-tune",
        {
          prompt: prompt.trim(),
          html: htmlStructure,
          elements,
          cssVariables,
          existingOverrides: existingOverrides || undefined,
        },
        token
      );

      if (
        response &&
        response.overrides &&
        Array.isArray(response.overrides) &&
        response.overrides.length === 3
      ) {
        let oldTheme = _currentTheme || "";
        if (oldTheme) {
          const overrideMatch = oldTheme.match(
            /\/\*\s*AI Fine-Tune Overrides\s*\*\/\s*([\s\S]*?)(?=\/\*|$)/
          );
          if (overrideMatch) {
            oldTheme = oldTheme
              .replace(
                /\/\*\s*AI Fine-Tune Overrides\s*\*\/\s*[\s\S]*?(?=\/\*|$)/,
                ""
              )
              .trim();
          }
        }

        if (previewProps) {
          openModal("aiFineTunePreview", {
            oldTheme,
            newOverrides: response.overrides,
            previewProps,
            viewMode,
            onApply: (overrides: string) => {
              onApplyOverrides(overrides);
            },
            onReject: () => {},
          });
        } else {
          // If no preview, apply the first variant
          onApplyOverrides(response.overrides[0]);
          toast.success(t("aiFineTuneModal.overridesGeneratedSuccess"));
          onClose();
        }
      } else {
        toast.error(t("aiFineTuneModal.failedToGenerateOverrides"));
      }
    } catch (error) {
      console.error("Error fine-tuning element:", error);
      if (
        error &&
        typeof error === "object" &&
        "status" in error &&
        error.status === 429
      ) {
        toast.error(t("aiFineTuneModal.rateLimitExceeded"));
      } else {
        toast.error(t("aiFineTuneModal.errorGeneratingOverrides"));
      }
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[70] bg-background-dark/95 flex items-center justify-center p-4"
      onClick={e => e.stopPropagation()}
      onKeyDown={e => e.stopPropagation()}
      onKeyUp={e => e.stopPropagation()}
      role="dialog"
      data-higher-modal="true"
    >
      <div className="bg-background-card border border-light/20 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-light/10">
          <h2 className="text-lg font-bold text-gray-200">
            {t("aiFineTuneModal.title")}
          </h2>
          <Button onClick={onClose} variant="secondary" size="sm" type="button">
            {t("common.close")}
          </Button>
        </div>
        <div className="flex-1 overflow-auto p-4">
          <div className="flex flex-col gap-4">
            <p className="text-xs text-gray-400">
              {t("aiFineTuneModal.describePrompt")}
            </p>
            <Card className="p-3" variant="default">
              <div className="flex items-start gap-2">
                <div className="i-mdi:information-outline text-primary-light h-4 w-4 mt-0.5 flex-shrink-0"></div>
                <div>
                  <p className="text-xs text-gray-300 mb-1">
                    <span className="text-primary-light font-medium">
                      {t("aiFineTuneModal.note")}:
                    </span>{" "}
                    {t("aiFineTuneModal.noteDesc")}
                  </p>
                </div>
              </div>
            </Card>
            {elements.length > 0 && (
              <div className="text-xs text-gray-400">
                <span className="font-medium">
                  {t("aiFineTuneModal.elements")}:
                </span>{" "}
                <code className="bg-background-dark/50 px-1.5 py-0.5 rounded">
                  {t("aiFineTuneModal.elementsCount", {
                    count: elements.length,
                  })}
                </code>
              </div>
            )}
            <FormInput
              id="fineTunePrompt"
              label={t("common.description")}
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder={t("aiFineTuneModal.placeholder")}
              helpText={t("aiFineTuneModal.helpText")}
              maxLength={200}
              disabled={isGenerating}
            />
          </div>
        </div>
        <div className="flex items-center justify-end p-4 border-t border-light/10">
          <Button
            onClick={handleGenerate}
            isLoading={isGenerating}
            loadingText={t("aiFineTuneModal.generating")}
            disabled={!prompt.trim() || isGenerating || !element}
            variant="primary"
            size="sm"
            type="button"
          >
            <span className="flex items-center gap-1">
              <div className="i-mdi:magic-wand h-4 w-4"></div>
              {t("aiFineTuneModal.generateOverrides")}
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AIFineTuneModal;
