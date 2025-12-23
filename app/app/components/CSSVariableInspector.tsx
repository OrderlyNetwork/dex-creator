import { FC, useState, useEffect, useRef, useCallback } from "react";
import {
  extractCSSVariablesFromElement,
  getElementPath,
  ElementCSSVariable,
  extractAIFineTuneRulesForElement,
  AIFineTuneRule,
} from "../utils/elementCSSInspector";
import { Button } from "./Button";
import { isAllowedCSSVariable } from "../utils/allowedCSSVariables";
import { useModal } from "../context/ModalContext";
import { DexPreviewProps } from "./DexPreview";
import {
  hexToRgbSpaceSeparated,
  rgbSpaceSeparatedToHex,
} from "../utils/colorUtils";

export interface CSSVariableInspectorProps {
  element: HTMLElement | null;
  originalClickedElement: HTMLElement | null;
  elementPath?: HTMLElement[];
  currentTheme: string | null;
  defaultTheme: string;
  onVariableChange: (variableName: string, newValue: string) => void;
  onElementSelect?: (element: HTMLElement) => void;
  onClose: () => void;
  onApplyCSSOverrides?: (element: HTMLElement, overrides: string) => void;
  onThemeChange?: (newTheme: string) => void;
  previewProps?: DexPreviewProps;
  viewMode?: "desktop" | "mobile";
}

const CSSVariableInspector: FC<CSSVariableInspectorProps> = ({
  element,
  originalClickedElement,
  elementPath: elementPathArray = [],
  currentTheme,
  defaultTheme: _defaultTheme,
  onVariableChange,
  onElementSelect,
  onClose,
  onApplyCSSOverrides,
  onThemeChange,
  previewProps,
  viewMode = "desktop",
}) => {
  const { openModal } = useModal();
  const [variables, setVariables] = useState<
    ReturnType<typeof extractCSSVariablesFromElement>
  >([]);
  const [elementPath, setElementPath] = useState<string>("");
  const [aiFineTuneRules, setAIFineTuneRules] = useState<AIFineTuneRule[]>([]);
  const [editingVariable, setEditingVariable] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>("");
  const [editingRuleIndex, setEditingRuleIndex] = useState<number | null>(null);
  const [editRuleProperties, setEditRuleProperties] = useState<string>("");
  const [position, setPosition] = useState<{ x: number; y: number } | null>(
    null
  );
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const modalRef = useRef<HTMLDivElement>(null);
  const fineTuneButtonRef = useRef<HTMLButtonElement>(null);

  const handleFineTuneClick = useCallback(() => {
    if (!element || !onApplyCSSOverrides) {
      return;
    }
    openModal("aiFineTune", {
      element,
      currentTheme,
      ...(previewProps && { previewProps }),
      viewMode,
      onApplyOverrides: (overrides: string) => {
        if (element && onApplyCSSOverrides) {
          onApplyCSSOverrides(element, overrides);
        }
      },
    });
  }, [element, currentTheme, previewProps, onApplyCSSOverrides, openModal]);

  useEffect(() => {
    const button = fineTuneButtonRef.current;
    if (!button) {
      return;
    }

    const handleClick = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      handleFineTuneClick();
    };

    button.addEventListener("click", handleClick, true);
    button.addEventListener(
      "mousedown",
      e => {
        e.stopPropagation();
      },
      true
    );

    return () => {
      button.removeEventListener("click", handleClick, true);
    };
  }, [handleFineTuneClick]);

  useEffect(() => {
    if (originalClickedElement && !position) {
      const rect = originalClickedElement.getBoundingClientRect();
      const viewportWidth = window.innerWidth;

      const shouldPlaceOnLeft = rect.left > viewportWidth / 2;

      const defaultX = shouldPlaceOnLeft ? 16 : viewportWidth - 400 - 16;
      const defaultY = 16;

      setPosition({ x: defaultX, y: defaultY });
    }
  }, [originalClickedElement, position]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (element && elementPathArray.length > 0) {
        const selectedIndex = elementPathArray.indexOf(element);

        const elementsToProcess =
          selectedIndex >= 0
            ? elementPathArray.slice(0, selectedIndex + 1)
            : [element];

        const allVariables = new Map<string, ElementCSSVariable>();

        elementsToProcess.forEach(el => {
          const extracted = extractCSSVariablesFromElement(el);
          extracted.forEach(v => {
            if (isAllowedCSSVariable(v.name)) {
              if (!allVariables.has(v.name)) {
                allVariables.set(v.name, v);
              }
            }
          });
        });

        setVariables(Array.from(allVariables.values()));

        const pathStrings = elementPathArray
          .slice()
          .reverse()
          .map(el => getElementPath(el).split(" > ").pop() || "");
        setElementPath(pathStrings.join(" > "));

        const aiRules = extractAIFineTuneRulesForElement(currentTheme, element);
        setAIFineTuneRules(aiRules);
      } else if (element) {
        const extracted = extractCSSVariablesFromElement(element);
        const filtered = extracted.filter(v => isAllowedCSSVariable(v.name));
        setVariables(filtered);
        setElementPath(getElementPath(element));

        const aiRules = extractAIFineTuneRulesForElement(currentTheme, element);
        setAIFineTuneRules(aiRules);
      } else {
        setVariables([]);
        setElementPath("");
        setAIFineTuneRules([]);
      }
    }, 50);

    return () => clearTimeout(timeoutId);
  }, [element, elementPathArray, currentTheme]);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault();
      if (position) {
        setPosition({
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y,
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      if (window.getSelection) {
        window.getSelection()?.removeAllRanges();
      }
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, dragOffset, position]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (modalRef.current && position) {
      e.preventDefault();
      const rect = modalRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
      setIsDragging(true);
    }
  };

  const handleVariableClick = (varName: string, currentValue: string) => {
    setEditingVariable(varName);
    setEditValue(currentValue);
  };

  const handleSave = () => {
    if (editingVariable && editValue) {
      const fullVarName = editingVariable.startsWith("oui-")
        ? editingVariable
        : `oui-${editingVariable}`;
      onVariableChange(fullVarName, editValue);
      setEditingVariable(null);
      setEditValue("");
    }
  };

  const handleCancel = () => {
    setEditingVariable(null);
    setEditValue("");
    setEditingRuleIndex(null);
    setEditRuleProperties("");
  };

  const handleRuleEdit = (index: number, properties: string) => {
    setEditingRuleIndex(index);
    setEditRuleProperties(properties);
  };

  const handleRuleSave = () => {
    if (editingRuleIndex === null || !onThemeChange || !currentTheme) {
      return;
    }

    const rule = aiFineTuneRules[editingRuleIndex];
    if (!rule) {
      return;
    }

    let baseTheme = currentTheme;
    const overrideMatch = baseTheme.match(
      /\/\*\s*AI Fine-Tune Overrides\s*\*\/\s*([\s\S]*?)(?=\/\*|$)/
    );
    if (overrideMatch) {
      baseTheme = baseTheme.replace(
        /\/\*\s*AI Fine-Tune Overrides\s*\*\/\s*[\s\S]*?(?=\/\*|$)/,
        ""
      );
      baseTheme = baseTheme.replace(/\n{3,}/g, "\n\n").trim();
    }

    let existingOverrides = "";
    if (overrideMatch && overrideMatch[1]) {
      existingOverrides = overrideMatch[1].trim();
    }

    const ruleRegex = /([^{]+)\{([^}]+)\}/g;
    const rules: Array<{ selector: string; properties: string }> = [];
    let match;
    let foundEditedRule = false;

    while ((match = ruleRegex.exec(existingOverrides)) !== null) {
      const selector = match[1].trim();
      const properties = match[2].trim();

      if (selector === rule.selector && !foundEditedRule) {
        rules.push({
          selector,
          properties: editRuleProperties.trim(),
        });
        foundEditedRule = true;
      } else {
        rules.push({ selector, properties });
      }
    }

    if (!foundEditedRule) {
      rules.push({
        selector: rule.selector,
        properties: editRuleProperties.trim(),
      });
    }

    const updatedOverrides = rules
      .map(r => `${r.selector} { ${r.properties} }`)
      .join("\n");

    const updatedTheme = baseTheme
      ? `${baseTheme}\n\n/* AI Fine-Tune Overrides */\n${updatedOverrides}`
      : `/* AI Fine-Tune Overrides */\n${updatedOverrides}`;

    onThemeChange(updatedTheme);
    setEditingRuleIndex(null);
    setEditRuleProperties("");
  };

  const handleRuleDelete = (index: number) => {
    if (!onThemeChange || !currentTheme) {
      return;
    }

    const rule = aiFineTuneRules[index];
    if (!rule) {
      return;
    }

    let baseTheme = currentTheme;
    const overrideMatch = baseTheme.match(
      /\/\*\s*AI Fine-Tune Overrides\s*\*\/\s*([\s\S]*?)(?=\/\*|$)/
    );
    if (overrideMatch) {
      baseTheme = baseTheme.replace(
        /\/\*\s*AI Fine-Tune Overrides\s*\*\/\s*[\s\S]*?(?=\/\*|$)/,
        ""
      );
      baseTheme = baseTheme.replace(/\n{3,}/g, "\n\n").trim();
    }

    let existingOverrides = "";
    if (overrideMatch && overrideMatch[1]) {
      existingOverrides = overrideMatch[1].trim();
    }

    const ruleToDelete = rule.rawRule || rule.fullRule;

    const escapedRule = ruleToDelete.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const ruleRegex = new RegExp(escapedRule.replace(/\s+/g, "\\s*"), "g");

    const updatedOverrides = existingOverrides.replace(ruleRegex, "").trim();

    if (updatedOverrides) {
      const updatedTheme = baseTheme
        ? `${baseTheme}\n\n/* AI Fine-Tune Overrides */\n${updatedOverrides}`
        : `/* AI Fine-Tune Overrides */\n${updatedOverrides}`;
      onThemeChange(updatedTheme);
    } else {
      onThemeChange(baseTheme || "");
    }
  };

  const isColorVariable = (varName: string): boolean => {
    if (varName.includes("color") || varName.includes("fill")) {
      return true;
    }
    if (varName.includes("gradient")) {
      return !varName.includes("stop") && !varName.includes("angle");
    }
    return false;
  };

  if (!element || !originalClickedElement) {
    return null;
  }

  const pathSelectors =
    elementPathArray.length > 0
      ? elementPathArray
          .slice()
          .reverse()
          .slice(0, 5)
          .map(el => {
            const fullPath = getElementPath(el);
            return fullPath.split(" > ").pop() || fullPath;
          })
      : elementPath.split(" > ").slice(-5);

  return (
    <div
      ref={modalRef}
      className="fixed z-[51] bg-[rgb(var(--oui-color-base-7))] border border-light/20 rounded-lg shadow-xl p-4 max-h-[80vh] overflow-y-auto backdrop-blur-sm w-96"
      style={{
        backgroundColor: "rgba(var(--oui-color-base-7), 0.98)",
        left: position?.x !== undefined ? `${position.x}px` : undefined,
        right: position?.x === undefined ? "16px" : undefined,
        top: position?.y !== undefined ? `${position.y}px` : undefined,
        bottom: position?.y === undefined ? "16px" : undefined,
        cursor: isDragging ? "grabbing" : "default",
        userSelect: isDragging ? "none" : "auto",
        WebkitUserSelect: isDragging ? "none" : "auto",
      }}
      data-higher-modal="true"
    >
      <div
        className="flex items-center justify-between mb-4 cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
      >
        <h3 className="text-sm font-bold text-gray-200">CSS Variables</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-200 transition-colors"
          type="button"
        >
          <div className="i-mdi:close h-5 w-5"></div>
        </button>
      </div>

      <div className="mb-3">
        <div className="text-xs text-gray-400 font-mono bg-background-dark/50 p-2 rounded border border-light/10 break-all mb-2">
          {elementPath}
        </div>
        <div className="flex flex-wrap gap-1 text-xs">
          {pathSelectors.map((selector, index) => {
            const reversedIndex = pathSelectors.length - 1 - index;
            const pathElement =
              elementPathArray.length > 0 &&
              reversedIndex < elementPathArray.length
                ? elementPathArray[reversedIndex]
                : null;

            const isSelected = pathElement === element;

            return (
              <button
                key={index}
                onClick={() => {
                  if (pathElement && onElementSelect) {
                    onElementSelect(pathElement);
                  }
                }}
                className={`px-2 py-1 rounded transition-colors ${
                  isSelected
                    ? "bg-blue-500/20 text-blue-300 border border-blue-500/50 hover:bg-blue-500/30"
                    : "bg-gray-700/50 text-gray-400 border border-gray-600/50 hover:bg-gray-600/50"
                } ${pathElement ? "cursor-pointer" : "cursor-default"}`}
                type="button"
                disabled={!pathElement}
              >
                {selector}
              </button>
            );
          })}
        </div>
      </div>

      {aiFineTuneRules.length > 0 && (
        <div className="mb-3 pt-3 border-t border-light/10">
          <h4 className="text-xs font-semibold text-gray-300 mb-2 flex items-center gap-1">
            <div className="i-mdi:magic-wand h-3 w-3 text-primary-light"></div>
            AI Fine-Tune Overrides
          </h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {aiFineTuneRules.map((rule, index) => {
              const isEditing = editingRuleIndex === index;
              const propertiesToShow = isEditing
                ? editRuleProperties
                : rule.properties;

              return (
                <div
                  key={index}
                  className="bg-background-dark/50 p-2 rounded border border-primary-light/20"
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-xs font-mono text-primary-light/80 break-all flex-1">
                      {rule.selector}
                    </div>
                    {!isEditing && onThemeChange && (
                      <div className="flex gap-1 ml-2">
                        <button
                          onClick={() => handleRuleEdit(index, rule.properties)}
                          className="text-xs text-primary-light hover:text-primary-light/80 transition-colors"
                          type="button"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleRuleDelete(index)}
                          className="text-xs text-red-400 hover:text-red-300 transition-colors"
                          type="button"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                  {isEditing ? (
                    <div className="mt-2 space-y-2">
                      <textarea
                        value={propertiesToShow}
                        onChange={e => setEditRuleProperties(e.target.value)}
                        className="w-full bg-background-dark border border-light/20 rounded px-2 py-1 text-xs text-gray-200 font-mono min-h-[60px] resize-y"
                        placeholder="CSS properties..."
                      />
                      <div className="flex gap-2">
                        <Button
                          onClick={handleRuleSave}
                          variant="primary"
                          size="xs"
                          type="button"
                        >
                          Save
                        </Button>
                        <Button
                          onClick={handleCancel}
                          variant="secondary"
                          size="xs"
                          type="button"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-gray-400 font-mono whitespace-pre-wrap break-all">
                      {rule.properties}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {element && onApplyCSSOverrides && (
        <div className="mb-3 pt-3 border-t border-light/10">
          <button
            ref={fineTuneButtonRef}
            onClick={e => {
              console.log("React onClick fired!", e);
              e.preventDefault();
              e.stopPropagation();
              handleFineTuneClick();
            }}
            onMouseDown={e => {
              console.log("React onMouseDown fired!", e);
              e.stopPropagation();
            }}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-primary-light hover:text-primary-darken hover:bg-primary-light/10 rounded border border-primary-light/30 hover:border-primary-light/50 transition-colors"
            type="button"
            data-modal-header-button="true"
          >
            <div className="i-mdi:magic-wand h-4 w-4"></div>
            <span>AI Fine-Tune This Element</span>
          </button>
          <p className="text-xs text-gray-400 mt-2 text-center">
            Use AI to customize this element and its children
          </p>
        </div>
      )}

      {variables.length === 0 ? (
        <div className="text-xs text-gray-400 text-center py-4">
          No CSS variables found for this element
        </div>
      ) : (
        <div className="space-y-2">
          {variables.map(variable => {
            const isEditing = editingVariable === variable.name;
            const isColor = isColorVariable(variable.name);
            const valueToUse = isEditing ? editValue : variable.value;
            const hexValue = isColor ? rgbSpaceSeparatedToHex(valueToUse) : "";

            return (
              <div
                key={variable.name}
                className="bg-background-dark/50 p-2 rounded border border-light/10"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-mono text-gray-300">
                    --{variable.name}
                  </span>
                  {!isEditing && (
                    <button
                      onClick={() =>
                        handleVariableClick(variable.name, variable.value)
                      }
                      className="text-xs text-primary-light hover:text-primary-light/80 transition-colors"
                      type="button"
                    >
                      Edit
                    </button>
                  )}
                </div>

                {isEditing ? (
                  <div className="mt-2 space-y-2">
                    {isColor ? (
                      <div className="flex gap-2 items-center">
                        <input
                          type="color"
                          value={hexValue || "#000000"}
                          onChange={e =>
                            setEditValue(hexToRgbSpaceSeparated(e.target.value))
                          }
                          className="w-12 h-8 rounded border border-light/20 cursor-pointer"
                        />
                        <div
                          className="w-6 h-6 rounded border border-light/20 flex-shrink-0"
                          style={{
                            backgroundColor: `rgb(${editValue})`,
                          }}
                        />
                        <input
                          type="text"
                          value={editValue}
                          onChange={e => setEditValue(e.target.value)}
                          placeholder="R G B"
                          className="flex-1 bg-background-dark border border-light/20 rounded px-2 py-1 text-xs text-gray-200 font-mono"
                        />
                      </div>
                    ) : (
                      <input
                        type="text"
                        value={editValue}
                        onChange={e => setEditValue(e.target.value)}
                        className="w-full bg-background-dark border border-light/20 rounded px-2 py-1 text-xs text-gray-200 font-mono"
                      />
                    )}
                    <div className="flex gap-2">
                      <Button
                        onClick={handleSave}
                        variant="primary"
                        size="xs"
                        type="button"
                      >
                        Save
                      </Button>
                      <Button
                        onClick={handleCancel}
                        variant="secondary"
                        size="xs"
                        type="button"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    {isColor && hexValue && (
                      <div
                        className="w-6 h-6 rounded border border-light/20"
                        style={{
                          backgroundColor: `rgb(${variable.computedValue})`,
                        }}
                      />
                    )}
                    <span className="text-xs text-gray-400 font-mono">
                      {variable.computedValue || variable.value || "N/A"}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CSSVariableInspector;
