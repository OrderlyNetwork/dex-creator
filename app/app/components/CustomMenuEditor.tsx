import React, { useState, useEffect } from "react";
import { useTranslation } from "~/i18n";
import { Icon } from "@iconify/react";
import { Button } from "./Button";

interface CustomMenuEditorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

interface MenuItemData {
  name: string;
  url: string;
}

const CustomMenuEditor: React.FC<CustomMenuEditorProps> = ({
  value,
  onChange,
  className = "",
}) => {
  const { t } = useTranslation();
  const [menuItems, setMenuItems] = useState<MenuItemData[]>([]);
  const [draggedItem, setDraggedItem] = useState<number | null>(null);
  const [draggedOverItem, setDraggedOverItem] = useState<number | null>(null);

  const parseMenuItems = (value: string): MenuItemData[] => {
    if (!value.trim()) return [];

    return value
      .split(";")
      .map(item => item.trim())
      .filter(item => item.length > 0)
      .map(item => {
        const [name, url] = item.split(",").map(part => part.trim());
        return {
          name: name || "",
          url: url || "",
        };
      });
  };

  const serializeMenuItems = (items: MenuItemData[]): string => {
    return items
      .filter(item => item.name.trim() || item.url.trim())
      .map(item => `${item.name.trim()}, ${item.url.trim()}`)
      .join("; ");
  };

  useEffect(() => {
    const parsedItems = parseMenuItems(value);
    setMenuItems(parsedItems.length > 0 ? parsedItems : []);
  }, [value]);

  const updateMenuItems = (newItems: MenuItemData[]) => {
    setMenuItems(newItems);
    onChange(serializeMenuItems(newItems));
  };

  const addMenuItem = () => {
    const newItems = [...menuItems, { name: "", url: "" }];
    setMenuItems(newItems);
  };

  const removeMenuItem = (index: number) => {
    const newItems = menuItems.filter((_, i) => i !== index);
    updateMenuItems(newItems);
  };

  const updateMenuItem = (
    index: number,
    field: keyof MenuItemData,
    value: string
  ) => {
    const newItems = [...menuItems];
    newItems[index] = { ...newItems[index], [field]: value };
    updateMenuItems(newItems);
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.effectAllowed = "move";
    setDraggedItem(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";

    if (draggedItem === null || draggedItem === index) return;
    setDraggedOverItem(index);
  };

  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedItem === null || draggedItem === index) return;

    const newItems = [...menuItems];
    const draggedItemData = newItems[draggedItem];
    newItems.splice(draggedItem, 1);
    newItems.splice(index, 0, draggedItemData);

    updateMenuItems(newItems);
    setDraggedOverItem(null);
  };

  const handleDragLeave = () => {
    setDraggedOverItem(null);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDraggedOverItem(null);
  };

  const validateMenuItem = (item: MenuItemData) => {
    const errors: string[] = [];

    if (item.name.trim() && !item.url.trim()) {
      errors.push(t("customMenuEditor.urlRequired"));
    }

    if (item.url.trim() && !item.name.trim()) {
      errors.push(t("customMenuEditor.nameRequired"));
    }

    if (item.url.trim()) {
      try {
        new URL(item.url);
      } catch {
        errors.push(t("customMenuEditor.invalidUrlFormat"));
      }
    }

    return errors;
  };

  const getValidationSummary = () => {
    const validItems = menuItems.filter(item => {
      const errors = validateMenuItem(item);
      return errors.length === 0 && item.name.trim() && item.url.trim();
    });

    if (
      validItems.length === 0 &&
      menuItems.some(item => item.name.trim() || item.url.trim())
    ) {
      return {
        type: "error" as const,
        message: t("customMenuEditor.completeAllItems"),
      };
    }

    if (validItems.length > 0) {
      return {
        type: "success" as const,
        message:
          validItems.length === 1
            ? t("customMenuEditor.menusConfigured", {
                count: validItems.length,
              })
            : t("customMenuEditor.menusConfiguredPlural", {
                count: validItems.length,
              }),
      };
    }

    return null;
  };

  const validation = getValidationSummary();

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header Section */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Icon icon="mdi:link-variant" className="w-5 h-5 text-primary" />
          <label className="text-sm font-medium text-gray-200">
            {t("customMenuEditor.title")}
          </label>
        </div>
        <p className="text-xs text-gray-400 pl-7">
          {t("customMenuEditor.description")}
        </p>
      </div>

      {/* Menu Items List */}
      <div className="space-y-3">
        {menuItems.length === 0 ? (
          /* Empty State */
          <div className="bg-gray-800/20 border-2 border-dashed border-gray-600/50 rounded-xl p-8 text-center slide-fade-in flex flex-col items-center">
            <div className="w-12 h-12 bg-gray-700/30 rounded-full flex items-center justify-center mx-auto mb-3">
              <Icon icon="mdi:link-variant" className="w-6 h-6 text-gray-400" />
            </div>
            <h4 className="text-base font-bold text-gray-300 mb-1">
              {t("customMenuEditor.noMenusYet")}
            </h4>
            <p className="text-xs text-gray-500 mb-4">
              {t("customMenuEditor.addFirstLink")}
            </p>
            <Button
              type="button"
              variant="secondary"
              onClick={addMenuItem}
              className="text-sm px-4 py-2 flex items-center flex-wrap"
              leftIcon={<Icon icon="mdi:plus" className="w-4 h-4" />}
            >
              {t("customMenuEditor.addFirstMenu")}
            </Button>
          </div>
        ) : (
          /* Menu Items List */
          <div className="space-y-3">
            {/* Menu Order Header */}
            <div className="flex items-center justify-between">
              <div className="text-base font-bold text-gray-300">
                {t("customMenuEditor.menuOrder")}
              </div>
              <div className="text-xs text-gray-400">
                {t("customMenuEditor.dragToReorder")}
              </div>
            </div>

            {menuItems.map((item, index) => {
              const itemErrors = validateMenuItem(item);
              const hasError =
                itemErrors.length > 0 && (item.name.trim() || item.url.trim());
              const isComplete =
                item.name.trim() && item.url.trim() && !hasError;

              return (
                <div
                  key={index}
                  draggable
                  onDragStart={e => handleDragStart(e, index)}
                  onDragOver={e => handleDragOver(e, index)}
                  onDragLeave={handleDragLeave}
                  onDrop={e => handleDrop(e, index)}
                  onDragEnd={handleDragEnd}
                  className={`staggered-item bg-gray-800/40 border rounded-xl p-4 transition-all duration-200 cursor-move ${
                    draggedItem === index ? "opacity-50" : "opacity-100"
                  } ${
                    draggedOverItem === index
                      ? "border-primary border-dashed bg-primary/10"
                      : hasError
                        ? "border-red-400/40 bg-red-500/5"
                        : isComplete
                          ? "border-green-400/40 bg-green-500/5"
                          : "border-gray-600/50 hover:border-gray-500/50"
                  }`}
                  style={{
                    animation: `slideFadeIn 0.25s ease ${0.05 + index * 0.05}s forwards`,
                    opacity: 0,
                    transform: "translateY(-10px)",
                  }}
                >
                  <div className="flex items-start gap-4">
                    {/* Menu Number */}
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium mt-6 flex-shrink-0 ${
                        hasError
                          ? "bg-red-500/20 text-red-400"
                          : isComplete
                            ? "bg-green-500/20 text-green-400"
                            : "bg-gray-600/30 text-gray-400"
                      }`}
                    >
                      {index + 1}
                    </div>

                    {/* Input Fields */}
                    <div className="flex-1 space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-400 mb-2">
                            {t("customMenuEditor.menuName")}
                          </label>
                          <input
                            type="text"
                            value={item.name}
                            onChange={e =>
                              updateMenuItem(index, "name", e.target.value)
                            }
                            placeholder={t(
                              "customMenuEditor.menuNamePlaceholder"
                            )}
                            className="w-full px-3 py-2.5 bg-gray-900/50 border border-gray-600/50 rounded-lg text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-colors"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-400 mb-2">
                            {t("customMenuEditor.url")}
                          </label>
                          <input
                            type="url"
                            value={item.url}
                            onChange={e =>
                              updateMenuItem(index, "url", e.target.value)
                            }
                            placeholder="https://docs.example.com"
                            className="w-full px-3 py-2.5 bg-gray-900/50 border border-gray-600/50 rounded-lg text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-colors"
                          />
                        </div>
                      </div>

                      {/* Error Message */}
                      {hasError && (
                        <div className="flex items-start gap-2 text-xs text-red-400 bg-red-500/10 rounded-lg p-2.5 slide-fade-in-delayed">
                          <Icon
                            icon="heroicons:exclamation-triangle"
                            className="w-4 h-4 mt-0.5 flex-shrink-0"
                          />
                          <span>{itemErrors[0]}</span>
                        </div>
                      )}
                    </div>

                    {/* Drag Handle and Remove Button */}
                    <div className="flex flex-col gap-2 mt-6">
                      <div className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-300 rounded-lg transition-colors">
                        <Icon icon="mdi:drag" className="w-4 h-4" />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeMenuItem(index)}
                        className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        title={t("customMenuEditor.removeMenuItem")}
                      >
                        <Icon icon="heroicons:trash" className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Add Another Button */}
            <div className="pt-2 flex justify-center">
              <Button
                type="button"
                variant="secondary"
                onClick={addMenuItem}
                className="text-sm slide-fade-in-delayed flex items-center flex-wrap"
                leftIcon={<Icon icon="mdi:plus" className="w-4 h-4" />}
              >
                {t("customMenuEditor.addAnotherMenu")}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Validation Summary */}
      {validation && (
        <div
          className={`flex items-start gap-2 text-xs p-3 rounded-lg slide-fade-in ${
            validation.type === "error"
              ? "text-red-400 bg-red-500/10"
              : "text-green-400 bg-green-500/10"
          }`}
        >
          <Icon
            icon={
              validation.type === "error"
                ? "heroicons:exclamation-triangle"
                : "heroicons:check-circle"
            }
            className="w-4 h-4 mt-0.5 flex-shrink-0"
          />
          <span>{validation.message}</span>
        </div>
      )}

      {/* Examples Section */}
      <div className="bg-gray-800/20 rounded-xl p-4 border border-gray-600/30 slide-fade-in-delayed">
        <div className="flex items-center gap-2 mb-3">
          <Icon
            icon="heroicons:light-bulb"
            className="w-4 h-4 text-yellow-400"
          />
          <span className="text-xs font-medium text-gray-300">
            {t("customMenuEditor.examples")}
          </span>
        </div>
        <div className="space-y-2 text-xs text-gray-400">
          <div className="flex items-center gap-2">
            <span className="text-gray-500">•</span>
            <span>
              <strong className="text-gray-300">
                {t("customMenuEditor.helpCenterExample")}
              </strong>{" "}
              → https://help.mydex.com
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-500">•</span>
            <span>
              <strong className="text-gray-300">
                {t("customMenuEditor.apiDocsExample")}
              </strong>{" "}
              → https://docs.mydex.com
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomMenuEditor;
