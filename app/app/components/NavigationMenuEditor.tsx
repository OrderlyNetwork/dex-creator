import { useState, useEffect, useCallback, useMemo } from "react";
import { cn } from "~/utils/css";
import { i18n, useTranslation } from "~/i18n";
import { useModal } from "~/context/ModalContext";

interface NavigationMenuItem {
  id: string;
  label: string;
  icon?: string;
  iconNode?: React.ReactNode;
  isDefault: boolean;
  editable?: boolean;
}

interface NavigationMenuEditorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  swapFeeBps: number | null;
  onOpenSwapFeeConfig: () => void;
  hasActivePointsCampaign?: boolean;
}

export function getAvailableMenus(): NavigationMenuItem[] {
  return [
    {
      id: "Trading",
      label: i18n.t("navigationMenuEditor.menuTrading"),
      icon: "i-mdi:chart-line",
      isDefault: true,
    },
    {
      id: "Portfolio",
      label: i18n.t("navigationMenuEditor.menuPortfolio"),
      icon: "i-mdi:wallet-outline",
      isDefault: true,
    },
    {
      id: "Markets",
      label: i18n.t("navigationMenuEditor.menuMarkets"),
      icon: "i-mdi:chart-box-outline",
      isDefault: true,
    },
    {
      id: "Leaderboard",
      label: i18n.t("navigationMenuEditor.menuLeaderboard"),
      icon: "i-mdi:trophy-outline",
      isDefault: true,
    },
    {
      id: "Campaigns",
      label: i18n.t("navigationMenuEditor.menuCampaigns"),
      iconNode: (
        <svg viewBox="0 0 8 11" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M0.000489424 6.785C-0.00634591 5.73247 0.369598 4.79952 1.04416 3.96991C1.42095 3.50697 1.85329 3.09279 2.25144 2.64902C2.571 2.29275 2.86363 1.91857 3.04264 1.47147C3.21224 1.04646 3.24727 0.609775 3.17293 0.162259C3.1708 0.148508 3.16695 0.135174 3.16567 0.121423C3.16268 0.0805887 3.14986 0.0372538 3.19814 0.00975272C3.24086 -0.0144149 3.27205 0.0114195 3.30494 0.0322536C3.55742 0.190176 3.7911 0.371433 4.00513 0.576441C4.59553 1.14105 4.96593 1.81441 5.07828 2.61985C5.13553 3.02987 5.0817 3.42863 4.99454 3.82781C4.94627 4.04866 4.90441 4.27283 4.95097 4.49826C5.03556 4.90702 5.44995 5.2287 5.87587 5.22453C6.31975 5.22037 6.70895 4.90577 6.79608 4.48201C6.81788 4.37533 6.81828 4.26825 6.81362 4.16075C6.81149 4.11074 6.79008 4.04991 6.85928 4.02657C6.92808 4.00365 6.95115 4.06616 6.98148 4.10491C7.32455 4.54409 7.55695 5.03536 7.70222 5.56705C8.00549 6.67873 7.92308 7.75047 7.30488 8.74887C6.63588 9.82927 5.65757 10.4797 4.36698 10.6381C2.34159 10.8869 0.414878 9.48427 0.0632914 7.52507C0.0201408 7.2846 -0.00378258 7.0438 0.000489424 6.785ZM3.46813 5.80247C3.47711 5.6558 3.48565 5.51038 3.49505 5.36496C3.49804 5.32121 3.49718 5.27995 3.44848 5.25953C3.4032 5.24037 3.37458 5.27121 3.34638 5.29704C3.02469 5.59788 2.71966 5.91248 2.47018 6.27457C2.05706 6.8742 1.86653 7.5346 1.99426 8.24967C2.13012 9.01133 2.60047 9.53133 3.3562 9.76013C4.1239 9.9926 4.81298 9.80473 5.36322 9.23553C5.91048 8.66967 6.04209 7.99753 5.78915 7.25793C5.74173 7.1192 5.70798 7.1138 5.58879 7.21087C4.94157 7.7388 3.97566 7.52673 3.62279 6.78C3.4754 6.46791 3.47241 6.13498 3.46813 5.80247Z"
            fill="#fff"
          />
        </svg>
      ),
      isDefault: true,
      editable: true,
    },
    {
      id: "Swap",
      label: i18n.t("navigationMenuEditor.menuSwap"),
      icon: "i-mdi:swap-horizontal",
      isDefault: false,
    },
    {
      id: "Rewards",
      label: i18n.t("navigationMenuEditor.menuRewards"),
      icon: "i-mdi:gift-outline",
      isDefault: false,
    },
    {
      id: "Vaults",
      label: i18n.t("navigationMenuEditor.menuVaults"),
      icon: "i-mdi:shield-outline",
      isDefault: false,
    },
    {
      id: "Points",
      label: i18n.t("navigationMenuEditor.menuPoints"),
      iconNode: (
        <svg
          viewBox="10 10 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g
            stroke="#fff"
            strokeWidth={1.667}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18.334 22.217v1.355a1.67 1.67 0 0 1-.814 1.413 4.17 4.17 0 0 0-1.686 3.33m5.833-6.098v1.355a1.67 1.67 0 0 0 .813 1.413 4.17 4.17 0 0 1 1.686 3.33M25 17.5h1.25a2.083 2.083 0 0 0 0-4.167H25m-11.666 15h13.333" />
            <path d="M15 17.5a5 5 0 0 0 10 0v-5a.833.833 0 0 0-.833-.833h-8.334A.833.833 0 0 0 15 12.5zm0 0h-1.25a2.083 2.083 0 0 1 0-4.167H15" />
          </g>
        </svg>
      ),
      isDefault: false,
    },
  ];
}

const NavigationMenuEditor: React.FC<NavigationMenuEditorProps> = ({
  value,
  onChange,
  className = "",
  swapFeeBps,
  onOpenSwapFeeConfig,
  hasActivePointsCampaign = false,
}) => {
  const { t } = useTranslation();
  const { openModal } = useModal();
  const parseMenus = useCallback((menuString: string): string[] => {
    if (!menuString) return [];
    return menuString
      .split(",")
      .map(item => item.trim())
      .filter(Boolean);
  }, []);

  const AVAILABLE_MENUS = useMemo(() => getAvailableMenus(), [t]);

  const MENU_INFO = useMemo(() => {
    return {
      Swap: {
        title: `${t("navigationMenuEditor.swapPageFeatures")}:`,
        description: t("navigationMenuEditor.swapPageFeaturesDesc"),
        color: "blue",
      },
      Rewards: {
        title: `${t("navigationMenuEditor.rewardsPageRequirement")}:`,
        description: t("navigationMenuEditor.rewardsPageRequirementDesc"),
        color: "warning",
      },
      Vaults: {
        title: `${t("navigationMenuEditor.vaultsPageFeatures")}:`,
        description: t("navigationMenuEditor.vaultsPageFeaturesDesc"),
        color: "success",
      },
    } as Record<string, { title: string; description: string; color: string }>;
  }, [t]);

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

  const doToggle = (menuId: string) => {
    setIsInternalUpdate(true);
    setEnabledMenus(current => {
      if (current.includes(menuId)) {
        return current.filter(id => id !== menuId);
      } else {
        return [...current, menuId];
      }
    });
  };

  const toggleMenu = (menuId: string) => {
    const menu = AVAILABLE_MENUS.find(m => m.id === menuId);
    // If the menu item is not editable and is in the initial value, editing is prohibited
    if (menu?.editable === false && initialMenus.includes(menuId)) {
      return;
    }

    if (
      menuId === "Points" &&
      enabledMenus.includes(menuId) &&
      hasActivePointsCampaign
    ) {
      openModal("confirmation", {
        title: t("navigationMenuEditor.activePointsCampaignWarning.title"),
        message: t("navigationMenuEditor.activePointsCampaignWarning.message"),
        confirmButtonVariant: "warning",
        confirmButtonText: t(
          "navigationMenuEditor.activePointsCampaignWarning.confirmButton"
        ),
        onConfirm: async () => {
          doToggle(menuId);
        },
      });
      return;
    }

    doToggle(menuId);
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

  const renderMenuIcon = (menu: NavigationMenuItem) => {
    if (menu.iconNode) {
      return (
        <div className="h-5 w-5 flex items-center justify-center [&>svg]:h-full [&>svg]:w-full">
          {menu.iconNode}
        </div>
      );
    }

    return <div className={`${menu.icon} h-5 w-5`}></div>;
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Add info card explaining optional configuration */}
      <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 text-sm flex items-start">
        <div className="i-mdi:information-outline h-5 w-5 mr-2 text-primary-light flex-shrink-0 mt-0.5"></div>
        <div className="text-gray-300">
          <p className="mb-1">
            {t("navigationMenuEditor.configuringOptional")}
          </p>
          <p className="text-xs text-gray-400">
            {t("navigationMenuEditor.defaultNavigationIncludes")}
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
                  {renderMenuIcon(menu)}
                  <span>
                    {menu.label}{" "}
                    {menu.isDefault && `(${t("navigationMenuEditor.default")})`}
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
                  title={t("navigationMenuEditor.showInformation")}
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
            <div className="text-base font-bold">
              {t("navigation.menuOrder")}
            </div>
            <div className="text-xs text-gray-400">
              {t("navigationMenuEditor.dragItemsToReorder")}
            </div>
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
                      {renderMenuIcon(menu)}
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
                          {swapFeeBps !== null
                            ? t("navigationMenuEditor.editFee")
                            : t("navigationMenuEditor.setFee")}
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
          <span>{t("navigationMenuEditor.noMenuItemsSelected")}</span>
        </div>
      )}
    </div>
  );
};

export default NavigationMenuEditor;
