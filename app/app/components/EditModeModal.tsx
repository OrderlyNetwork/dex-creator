import { FC, useState, useRef, useEffect, useCallback } from "react";
import DexPreview, { DexPreviewProps } from "./DexPreview";
import CSSVariableInspector from "./CSSVariableInspector";
import { parseCSSVariables, generateThemeCSS } from "../utils/cssParser";
import { Button } from "./Button";
import { useModal } from "../context/ModalContext";

export interface EditModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  previewProps: DexPreviewProps;
  currentTheme: string | null;
  defaultTheme: string;
  savedTheme: string | null;
  onThemeChange: (newTheme: string) => void;
  viewMode: "desktop" | "mobile";
  onGenerateTheme?: (prompt: string, viewMode: "desktop" | "mobile") => void;
  updateCssColor?: (variableName: string, newColorHex: string) => void;
  updateCssValue?: (variableName: string, newValue: string) => void;
  tradingViewColorConfig?: string | null;
  setTradingViewColorConfig?: (config: string | null) => void;
}

const EditModeModal: FC<EditModeModalProps> = ({
  isOpen,
  onClose,
  previewProps,
  currentTheme,
  defaultTheme,
  savedTheme,
  onThemeChange,
  viewMode,
  onGenerateTheme,
  updateCssColor,
  updateCssValue,
  tradingViewColorConfig,
  setTradingViewColorConfig,
}) => {
  const { openModal, currentModalType } = useModal();
  const [selectedElement, setSelectedElement] = useState<HTMLElement | null>(
    null
  );
  const [selectedElementPath, setSelectedElementPath] = useState<HTMLElement[]>(
    []
  );
  const [originalClickedElement, setOriginalClickedElement] =
    useState<HTMLElement | null>(null);
  const [isCtrlHeld, setIsCtrlHeld] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const originalMatchMediaRef = useRef<typeof window.matchMedia | null>(null);

  const handleVariableChange = useCallback(
    (variableName: string, newValue: string) => {
      const baseTheme = currentTheme || defaultTheme;
      const cssVariables = parseCSSVariables(baseTheme);
      cssVariables[variableName] = newValue;
      const newTheme = generateThemeCSS(cssVariables);
      onThemeChange(newTheme);
    },
    [currentTheme, defaultTheme, onThemeChange]
  );

  const handleApplyCSSOverrides = useCallback(
    (_element: HTMLElement, overrides: string) => {
      if (!overrides.trim()) return;

      let baseTheme = currentTheme || "";
      if (baseTheme) {
        baseTheme = baseTheme.replace(
          /\/\*\s*AI Fine-Tune Overrides\s*\*\/[\s\S]*?(?=\/\*\s*AI Fine-Tune Overrides\s*\*\/|$)/g,
          ""
        );
        baseTheme = baseTheme.replace(/\n{3,}/g, "\n\n").trim();
      }

      const updatedTheme = baseTheme
        ? `${baseTheme}\n\n/* AI Fine-Tune Overrides */\n${overrides.trim()}`
        : `/* AI Fine-Tune Overrides */\n${overrides.trim()}`;

      onThemeChange(updatedTheme);
    },
    [currentTheme, onThemeChange]
  );

  useEffect(() => {
    if (viewMode === "mobile" && isOpen) {
      const originalMatchMedia = window.matchMedia.bind(window);
      originalMatchMediaRef.current = originalMatchMedia;
      window.matchMedia = (query: string) => {
        if (query === "(max-width: 768px)") {
          return {
            matches: true,
            media: query,
            onchange: null,
            addListener: () => {},
            removeListener: () => {},
            addEventListener: () => {},
            removeEventListener: () => {},
            dispatchEvent: () => true,
          } as MediaQueryList;
        }
        return originalMatchMedia(query);
      };
    } else if (originalMatchMediaRef.current) {
      window.matchMedia = originalMatchMediaRef.current;
      originalMatchMediaRef.current = null;
    }

    return () => {
      if (originalMatchMediaRef.current) {
        window.matchMedia = originalMatchMediaRef.current;
        originalMatchMediaRef.current = null;
      }
    };
  }, [viewMode, isOpen]);

  useEffect(() => {
    if (!selectedElement) {
      return;
    }

    const rect = selectedElement.getBoundingClientRect();

    const highlight = document.createElement("div");
    highlight.style.position = "fixed";
    highlight.style.left = `${rect.left}px`;
    highlight.style.top = `${rect.top}px`;
    highlight.style.width = `${rect.width}px`;
    highlight.style.height = `${rect.height}px`;
    highlight.style.pointerEvents = "none";
    highlight.style.zIndex = "60";
    highlight.style.border = "2px solid #3b82f6";
    highlight.style.backgroundColor = "rgba(59, 130, 246, 0.1)";
    highlight.style.boxSizing = "border-box";
    highlight.setAttribute("data-element-highlight", "selected");
    document.body.appendChild(highlight);

    const updateHighlight = () => {
      const newRect = selectedElement!.getBoundingClientRect();
      highlight.style.left = `${newRect.left}px`;
      highlight.style.top = `${newRect.top}px`;
      highlight.style.width = `${newRect.width}px`;
      highlight.style.height = `${newRect.height}px`;
    };

    window.addEventListener("scroll", updateHighlight, true);
    window.addEventListener("resize", updateHighlight);

    return () => {
      document
        .querySelectorAll("[data-element-highlight]")
        .forEach(el => el.remove());
      window.removeEventListener("scroll", updateHighlight, true);
      window.removeEventListener("resize", updateHighlight);
    };
  }, [selectedElement]);

  const prevModalTypeRef = useRef<string | null>(null);
  const prevThemeRef = useRef<string | null>(null);
  const hasInitializedFontRef = useRef(false);

  useEffect(() => {
    if (
      isOpen &&
      prevModalTypeRef.current === "aiFineTunePreview" &&
      currentModalType !== "aiFineTunePreview" &&
      currentTheme
    ) {
      const fontFamilyMatch = currentTheme.match(
        /--oui-font-family:\s*([^;]+);/
      );
      if (fontFamilyMatch) {
        const fontFamily = fontFamilyMatch[1].trim();
        const styleId = "dex-preview-font-override";

        let style = document.getElementById(styleId);
        if (!style) {
          style = document.createElement("style");
          style.id = styleId;
          document.head.appendChild(style);
        }

        style.textContent = `
          .orderly-app-container,
          .orderly-app-container *,
          .orderly-app-container *::before,
          .orderly-app-container *::after {
            font-family: ${fontFamily} !important;
          }
        `;
      }
    }
    prevModalTypeRef.current = currentModalType || null;
  }, [isOpen, currentModalType, currentTheme]);

  useEffect(() => {
    const isFirstMount = !hasInitializedFontRef.current;
    const themeChanged = currentTheme !== prevThemeRef.current;

    if (isOpen && (isFirstMount || themeChanged)) {
      hasInitializedFontRef.current = true;
      requestAnimationFrame(() => {
        const themeToUse = currentTheme || defaultTheme;
        const fontFamilyMatch = themeToUse.match(
          /--oui-font-family:\s*([^;]+);/
        );
        if (fontFamilyMatch) {
          const fontFamily = fontFamilyMatch[1].trim();
          const styleId = "dex-preview-font-override";

          let style = document.getElementById(styleId);
          if (!style) {
            style = document.createElement("style");
            style.id = styleId;
            document.head.appendChild(style);
          }

          style.textContent = `
          .orderly-app-container,
          .orderly-app-container *,
          .orderly-app-container *::before,
          .orderly-app-container *::after {
            font-family: ${fontFamily} !important;
          }
        `;
        }
      });
    }
    prevThemeRef.current = currentTheme;
  }, [isOpen, currentTheme, defaultTheme]);

  const wrappedOnGenerateTheme = useCallback(
    (prompt: string, vm: "desktop" | "mobile") => {
      if (onGenerateTheme) {
        onGenerateTheme(prompt, vm);
      }
    },
    [onGenerateTheme]
  );

  useEffect(() => {
    if (!isOpen) {
      setSelectedElement(null);
      setSelectedElementPath([]);
      setOriginalClickedElement(null);
      setIsCtrlHeld(false);
      const oldOverrideStyles = document.querySelectorAll(
        'style[id^="ai-override-"]'
      );
      oldOverrideStyles.forEach(style => style.remove());
      return;
    }

    const oldOverrideStyles = document.querySelectorAll(
      'style[id^="ai-override-"]'
    );
    oldOverrideStyles.forEach(style => style.remove());

    const isWithinHigherModal = (element: HTMLElement | null): boolean => {
      if (!element) return false;
      return !!element.closest('[data-higher-modal="true"]');
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        isWithinHigherModal(target) ||
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA"
      ) {
        return;
      }
      if (e.key === "Control" || e.key === "Meta") {
        setIsCtrlHeld(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        isWithinHigherModal(target) ||
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA"
      ) {
        return;
      }
      if (e.key === "Control" || e.key === "Meta") {
        setIsCtrlHeld(false);
      }
    };

    const handleButtonClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      if (target.closest("[data-modal-header-button]")) {
        return;
      }

      if (target.closest("[data-higher-modal]")) {
        return;
      }

      if (isWithinHigherModal(target)) {
        return;
      }

      const cssInspector = document.querySelector(
        '[data-higher-modal="true"][class*="z-[51]"]'
      );
      if (cssInspector && cssInspector.contains(target)) {
        return;
      }

      if (e.ctrlKey || e.metaKey) {
        return;
      }
    };

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      if (target.closest("[data-modal-header-button]")) {
        return;
      }

      if (target.closest("[data-higher-modal]")) {
        return;
      }

      if (isWithinHigherModal(target)) {
        return;
      }

      const isCtrlHeld = e.ctrlKey || e.metaKey;

      if (!isCtrlHeld) {
        return;
      }

      if (!target || !previewRef.current) {
        return;
      }

      if (previewRef.current.contains(target)) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();

        const clickableElements = [
          "button",
          "a",
          "input",
          "select",
          "textarea",
        ];
        const isClickable =
          clickableElements.includes(target.tagName.toLowerCase()) ||
          target.closest("button, a, input, select, textarea");

        const elementToSelect = isClickable
          ? (target.closest(
              "button, a, input, select, textarea"
            ) as HTMLElement) || target
          : target;

        const path: HTMLElement[] = [];
        let current: HTMLElement | null = elementToSelect;
        const MAX_PATH_LENGTH = 5;

        while (current && path.length < MAX_PATH_LENGTH) {
          if (
            current === document.body ||
            current.hasAttribute("data-preview-container") ||
            current.classList.contains("orderly-app-container")
          ) {
            break;
          }
          path.push(current);
          current = current.parentElement;
        }

        const limitedPath = path.slice(0, MAX_PATH_LENGTH);

        const middleIndex = Math.floor((limitedPath.length - 1) / 2);
        const defaultSelectedElement =
          limitedPath[middleIndex] || elementToSelect;

        setOriginalClickedElement(elementToSelect);
        setSelectedElement(defaultSelectedElement);
        setSelectedElementPath(limitedPath);
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        isWithinHigherModal(target) ||
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA"
      ) {
        return;
      }
      if (e.key === "Escape") {
        setSelectedElement(null);
        setSelectedElementPath([]);
        setOriginalClickedElement(null);
      }
    };

    const timeout = setTimeout(() => {
      document.addEventListener("click", handleButtonClick, true);
      document.addEventListener("click", handleClick, true);
      document.addEventListener("keydown", handleEscape);
      document.addEventListener("keydown", handleKeyDown);
      document.addEventListener("keyup", handleKeyUp);
    }, 100);

    return () => {
      clearTimeout(timeout);
      document.removeEventListener("click", handleButtonClick, true);
      document.removeEventListener("click", handleClick, true);
      document.removeEventListener("keydown", handleEscape);
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
    };
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      ref={modalRef}
      className="fixed inset-0 z-[50] bg-background-dark/95 flex flex-col"
      onClick={e => {
        e.stopPropagation();
      }}
      onMouseDown={e => {
        e.stopPropagation();
      }}
      onMouseUp={e => {
        e.stopPropagation();
      }}
      onSubmit={e => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      <div className="flex items-center justify-between p-4 border-b border-light/10 bg-background-card">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-bold text-gray-200">
            {viewMode === "desktop" ? "Desktop" : "Mobile"} Preview
          </h2>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-background-dark/50 border border-light/20">
            <div className="i-mdi:cursor-pointer h-4 w-4 text-gray-400"></div>
            <span className="text-xs text-gray-400">
              Hold{" "}
              <kbd className="px-1.5 py-0.5 bg-background-dark rounded text-xs font-mono">
                Ctrl
              </kbd>{" "}
              + Click to inspect CSS variables
            </span>
          </div>
        </div>
        <div
          className="flex items-center gap-2"
          data-modal-header-button="true"
        >
          <Button
            onClick={e => {
              e.stopPropagation();
              openModal("themePresetPreview", {
                previewProps,
                viewMode,
                currentTheme,
                onApply: (theme: string) => {
                  onThemeChange(theme);
                },
                onPreviewChange: (theme: string) => {
                  onThemeChange(theme);
                },
              });
            }}
            variant="secondary"
            size="sm"
            type="button"
            data-modal-header-button="true"
          >
            <span className="flex items-center gap-1">
              <div className="i-mdi:swatch h-4 w-4"></div>
              Presets
            </span>
          </Button>
          <Button
            onClick={e => {
              e.stopPropagation();
              if (
                !updateCssColor ||
                !updateCssValue ||
                !setTradingViewColorConfig
              ) {
                return;
              }
              openModal("currentTheme", {
                currentTheme,
                defaultTheme,
                savedTheme,
                updateCssColor,
                updateCssValue,
                tradingViewColorConfig,
                setTradingViewColorConfig,
                onThemeChange,
              });
            }}
            variant="secondary"
            size="sm"
            type="button"
            data-modal-header-button="true"
            disabled={
              !updateCssColor || !updateCssValue || !setTradingViewColorConfig
            }
          >
            <span className="flex items-center gap-1">
              <div className="i-mdi:palette h-4 w-4"></div>
              Theme
            </span>
          </Button>
          <Button
            onClick={e => {
              e.stopPropagation();
              if (!onGenerateTheme) return;
              openModal("aiThemeGenerator", {
                viewMode,
                onGenerateTheme: wrappedOnGenerateTheme,
              });
            }}
            variant="secondary"
            size="sm"
            type="button"
            disabled={!onGenerateTheme}
            data-modal-header-button="true"
          >
            <span className="flex items-center gap-1">
              <div className="i-mdi:magic-wand h-4 w-4"></div>
              AI
            </span>
          </Button>
          <Button onClick={onClose} variant="secondary" size="sm" type="button">
            Close
          </Button>
        </div>
      </div>

      <div
        className={`flex-1 relative ${
          viewMode === "mobile"
            ? "overflow-y-auto overflow-x-hidden"
            : "overflow-hidden"
        }`}
      >
        {isCtrlHeld && (
          <style>{`
            [data-preview-container] * {
              cursor: crosshair !important;
            }
          `}</style>
        )}
        <div
          ref={previewRef}
          data-preview-container
          className={`${
            viewMode === "mobile" ? "max-w-md mx-auto min-h-full" : "h-full"
          } w-full`}
          style={
            isCtrlHeld
              ? {
                  cursor: "crosshair",
                }
              : undefined
          }
        >
          <DexPreview
            {...(({
              customStyles: _,
              fontFamily: __,
              fontSize: ___,
              ...rest
            }) => rest)(previewProps)}
            customStyles={currentTheme || defaultTheme}
            className="h-full w-full"
          />
        </div>

        {selectedElement && originalClickedElement && (
          <CSSVariableInspector
            element={selectedElement}
            originalClickedElement={originalClickedElement}
            elementPath={selectedElementPath}
            currentTheme={currentTheme}
            defaultTheme={defaultTheme}
            onVariableChange={handleVariableChange}
            onElementSelect={el => {
              setSelectedElement(el);
            }}
            onClose={() => {
              setSelectedElement(null);
              setSelectedElementPath([]);
              setOriginalClickedElement(null);
            }}
            onApplyCSSOverrides={handleApplyCSSOverrides}
            onThemeChange={onThemeChange}
            previewProps={previewProps}
            viewMode={viewMode}
          />
        )}
      </div>
    </div>
  );
};

export default EditModeModal;
