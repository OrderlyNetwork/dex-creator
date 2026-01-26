import { useState, useEffect, useCallback, useMemo } from "react";
import { cn } from "~/utils/css";

interface NavigationMenuEditorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  swapFeeBps: number | null;
  onOpenSwapFeeConfig: () => void;
}

export const AVAILABLE_MENUS = [
  {
    id: "Trading",
    label: "Trading",
    icon: "i-mdi:chart-line",
    isDefault: true,
  },
  {
    id: "Portfolio",
    label: "Portfolio",
    icon: "i-mdi:wallet-outline",
    isDefault: true,
  },
  {
    id: "Markets",
    label: "Markets",
    icon: "i-mdi:chart-box-outline",
    isDefault: true,
  },
  {
    id: "Leaderboard",
    label: "Leaderboard",
    icon: "i-mdi:trophy-outline",
    isDefault: true,
  },
  {
    id: "Swap",
    label: "Swap",
    icon: "i-mdi:swap-horizontal",
    isDefault: false,
  },
  {
    id: "Rewards",
    label: "Rewards",
    icon: "i-mdi:gift-outline",
    isDefault: false,
  },
  {
    id: "Vaults",
    label: "Vaults",
    icon: "i-mdi:shield-outline",
    isDefault: false,
  },
  {
    id: "Points",
    label: "Points",
    icon: "i-mdi:trophy",
    isDefault: false,
    editable: false,
  },
];

const MENU_INFO: Record<
  string,
  { title: string; description: string; color: string }
> = {
  Swap: {
    title: "Swap Page Features:",
    description:
      "The Swap page allows users to exchange tokens seamlessly across multiple chains. Powered by WOOFi, this feature provides efficient token swapping with competitive rates and deep liquidity across supported networks.",
    color: "blue",
  },
  Rewards: {
    title: "Rewards Page Requirement:",
    description:
      "The Rewards page (which includes referral management) can only be fully utilized after your DEX has been graduated. You can enable the Rewards menu now, but referral features will only become active once you graduate your DEX and start earning fee splits.",
    color: "warning",
  },
  Vaults: {
    title: "Vaults Page Features:",
    description:
      "The Vaults page enables users to earn passive yield through automated trading strategies and yield farming. Users can deposit USDC into curated vault strategies that deploy market-making strategies, handle liquidations, and accrue platform fees. This feature works across multiple blockchains with no gas fees for deposits from your DEX account.",
    color: "success",
  },
};

const NavigationMenuEditor: React.FC<NavigationMenuEditorProps> = ({
  value,
  onChange,
  className = "",
  swapFeeBps,
  onOpenSwapFeeConfig,
}) => {
  const parseMenus = useCallback((menuString: string): string[] => {
    if (!menuString) return [];
    return menuString
      .split(",")
      .map(item => item.trim())
      .filter(Boolean);
  }, []);

  // save initial menus, used to prevent editing disabled menus, don't add "value" to the dependency array
  const initialMenus = useMemo(() => parseMenus(value), [parseMenus]);

  const [enabledMenus, setEnabledMenus] = useState<string[]>(
    () => initialMenus
  );

  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [draggedOverItem, setDraggedOverItem] = useState<string | null>(null);

  const [isInternalUpdate, setIsInternalUpdate] = useState(false);
  const [expandedInfo, setExpandedInfo] = useState<string | null>(null);

  useEffect(() => {
    if (isInternalUpdate) {
      onChange(enabledMenus.join(","));
      setIsInternalUpdate(false);
    }
  }, [enabledMenus, onChange, isInternalUpdate]);

  useEffect(() => {
    if (!isInternalUpdate) {
      const parsedValue = parseMenus(value);
      if (JSON.stringify(parsedValue) !== JSON.stringify(enabledMenus)) {
        setEnabledMenus(parsedValue);
      }
    }
  }, [value, parseMenus]);

  const toggleMenu = (menuId: string) => {
    const menu = AVAILABLE_MENUS.find(m => m.id === menuId);
    // If the menu item is not editable and is in the initial value, editing is prohibited
    if (menu?.editable === false && initialMenus.includes(menuId)) {
      return;
    }

    setIsInternalUpdate(true);
    setEnabledMenus(current => {
      if (current.includes(menuId)) {
        return current.filter(id => id !== menuId);
      } else {
        return [...current, menuId];
      }
    });
  };

  const handleDragStart = (e: React.DragEvent, menuId: string) => {
    e.dataTransfer.effectAllowed = "move";
    setDraggedItem(menuId);
  };

  const handleDragOver = (e: React.DragEvent, menuId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";

    if (!draggedItem || draggedItem === menuId) return;

    setDraggedOverItem(menuId);
  };

  const handleDrop = (e: React.DragEvent, menuId: string) => {
    e.preventDefault();
    if (!draggedItem || draggedItem === menuId) return;

    const draggedIndex = enabledMenus.indexOf(draggedItem);
    const targetIndex = enabledMenus.indexOf(menuId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    setIsInternalUpdate(true);
    const newMenus = [...enabledMenus];
    newMenus.splice(draggedIndex, 1);
    newMenus.splice(targetIndex, 0, draggedItem);

    setEnabledMenus(newMenus);
    setDraggedOverItem(null);
  };

  const handleDragLeave = () => {
    setDraggedOverItem(null);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDraggedOverItem(null);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Add info card explaining optional configuration */}
      <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 text-sm flex items-start">
        <div className="i-mdi:information-outline h-5 w-5 mr-2 text-primary-light flex-shrink-0 mt-0.5"></div>
        <div className="text-gray-300">
          <p className="mb-1">
            Configuring navigation menus is{" "}
            <span className="text-primary-light font-medium">optional</span>. If
            you don't select any menus, the default menus will be displayed.
          </p>
          <p className="text-xs text-gray-400">
            Default navigation includes: Trading, Portfolio, Markets, and
            Leaderboard pages. The Rewards page includes referral management and
            trader incentives.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2 mb-4">
        {AVAILABLE_MENUS.map(menu => {
          const hasInfo = menu.id in MENU_INFO;
          const isInfoExpanded = expandedInfo === menu.id;
          const isEnabled = enabledMenus.includes(menu.id);
          // If the menu item is not editable and is in the initial value, editing is prohibited
          const isDisabled =
            menu.editable === false && initialMenus.includes(menu.id);

          return (
            <div
              key={menu.id}
              className={cn(
                "flex items-center gap-2",
                isDisabled
                  ? "cursor-not-allowed"
                  : menu.editable !== false
                    ? "cursor-pointer"
                    : "cursor-not-allowed"
              )}
            >
              <label
                className={cn(
                  "flex items-center space-x-2 p-2 rounded flex-1 border transition-colors",
                  isDisabled
                    ? "cursor-not-allowed opacity-60"
                    : "cursor-pointer hover:bg-dark/70",
                  isEnabled
                    ? "bg-primary/20 border-primary/30"
                    : "bg-dark/50 border-light/10"
                )}
              >
                <input
                  type="checkbox"
                  checked={isEnabled}
                  onChange={() => toggleMenu(menu.id)}
                  disabled={isDisabled}
                  className="form-checkbox rounded bg-dark border-gray-500 text-primary focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <div className="flex items-center space-x-2">
                  <div className={`${menu.icon} h-5 w-5`}></div>
                  <span>
                    {menu.label} {menu.isDefault && "(Default)"}
                  </span>
                </div>
              </label>
              {hasInfo && (
                <button
                  type="button"
                  onClick={() =>
                    setExpandedInfo(isInfoExpanded ? null : menu.id)
                  }
                  className={`p-2 rounded transition-colors ${
                    isInfoExpanded
                      ? "bg-primary/20 text-primary-light"
                      : "bg-dark/50 hover:bg-dark/70 text-gray-400"
                  }`}
                  title="Show information"
                >
                  <div className="i-mdi:information-outline h-5 w-5"></div>
                </button>
              )}
            </div>
          );
        })}
      </div>

      {expandedInfo && MENU_INFO[expandedInfo] && (
        <div
          className={`rounded-lg p-3 text-sm mb-4 ${
            expandedInfo === "Swap"
              ? "bg-blue-500/10 border border-blue-500/20"
              : expandedInfo === "Rewards"
                ? "bg-warning/10 border border-warning/20"
                : "bg-success/10 border border-success/20"
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="text-gray-300 flex-1">
              <p className="mb-2">
                <span
                  className={`font-medium ${
                    expandedInfo === "Swap"
                      ? "text-blue-400"
                      : expandedInfo === "Rewards"
                        ? "text-warning"
                        : "text-success"
                  }`}
                >
                  {MENU_INFO[expandedInfo].title}
                </span>{" "}
                {MENU_INFO[expandedInfo].description}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setExpandedInfo(null)}
              className="ml-3 text-gray-400 hover:text-gray-300"
            >
              <div className="i-mdi:close h-5 w-5"></div>
            </button>
          </div>
        </div>
      )}

      {enabledMenus.length > 0 && (
        <>
          <div className="flex items-center justify-between">
            <div className="text-base font-bold">Menu Order</div>
            <div className="text-xs text-gray-400">Drag items to reorder</div>
          </div>

          <div className="border border-light/10 rounded-lg p-2 bg-dark/30">
            <ul className="space-y-2">
              {enabledMenus.map((menuId, index) => {
                const menu = AVAILABLE_MENUS.find(m => m.id === menuId);
                if (!menu) return null;

                return (
                  <li
                    key={menuId}
                    draggable
                    onDragStart={e => handleDragStart(e, menuId)}
                    onDragOver={e => handleDragOver(e, menuId)}
                    onDragLeave={handleDragLeave}
                    onDrop={e => handleDrop(e, menuId)}
                    onDragEnd={handleDragEnd}
                    className={cn(
                      "flex items-center justify-between p-2 rounded border transition-colors",
                      draggedItem === menuId ? "opacity-50" : "opacity-100",
                      draggedOverItem === menuId
                        ? "border-primary border-dashed bg-primary/10"
                        : "border-light/10 bg-dark/50",
                      "cursor-move hover:bg-dark/70"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <div className="i-mdi:drag h-5 w-5 text-gray-400"></div>
                      <div className={`${menu.icon} h-5 w-5`}></div>
                      <span>{menu.label}</span>
                      {menuId === "Swap" && swapFeeBps !== null && (
                        <div className="flex items-center gap-1.5 ml-2">
                          <div className="i-mdi:check-circle w-4 h-4 text-success"></div>
                          <span className="text-xs text-success">
                            {swapFeeBps} bps ({(swapFeeBps / 100).toFixed(2)}%)
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      {menuId === "Swap" && (
                        <button
                          type="button"
                          onClick={e => {
                            e.stopPropagation();
                            onOpenSwapFeeConfig();
                          }}
                          className={`text-xs px-2.5 py-1 rounded transition-all duration-200 font-medium ${
                            swapFeeBps !== null
                              ? "bg-primary/20 hover:bg-primary/30 text-primary-light"
                              : "bg-warning text-dark hover:bg-warning/90 animate-pulse"
                          }`}
                        >
                          {swapFeeBps !== null ? "Edit Fee" : "⚠️ Set Fee"}
                        </button>
                      )}
                      <div className="text-xs px-2 py-1 rounded-full bg-dark/50 text-gray-400">
                        {index + 1}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </>
      )}

      {enabledMenus.length === 0 && (
        <div className="text-sm text-warning border border-warning/20 bg-warning/10 p-3 rounded flex items-center">
          <div className="i-mdi:alert-circle-outline h-5 w-5 mr-2"></div>
          <span>No menu items selected. Default menus will be displayed.</span>
        </div>
      )}
    </div>
  );
};

export default NavigationMenuEditor;
