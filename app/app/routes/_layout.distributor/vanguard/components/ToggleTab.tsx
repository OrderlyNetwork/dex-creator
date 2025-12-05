import React, { useState } from "react";
import { cn } from "../utils";

type ToggleTabItem = {
  label: string;
  content: React.ReactNode;
};

interface ToggleTabProps {
  tabs: ToggleTabItem[];
  initialIndex?: number;
  className?: string;
}

const ToggleTab: React.FC<ToggleTabProps> = ({
  tabs,
  initialIndex = 0,
  className,
}) => {
  const normalizedTabs = tabs?.length ? tabs : [];
  const safeInitialIndex = Math.min(
    Math.max(initialIndex, 0),
    Math.max(normalizedTabs.length - 1, 0)
  );
  const [activeIndex, setActiveIndex] = useState(safeInitialIndex);

  if (!normalizedTabs.length) return null;

  const handleTabClick = (index: number) => {
    setActiveIndex(index);
  };

  const activeContent = normalizedTabs[activeIndex]?.content ?? null;

  return (
    <div className={cn("flex w-full flex-col gap-4", className)}>
      <div role="tablist" className="flex items-center gap-6">
        {normalizedTabs.map((tab, index) => {
          const isActive = index === activeIndex;
          return (
            <button
              key={tab.label}
              type="button"
              role="tab"
              aria-selected={isActive}
              tabIndex={0}
              onClick={() => handleTabClick(index)}
              className={cn(
                "pb-2 text-sm font-medium tracking-wide transition-colors border-b-2",
                "hover:text-base-contrast focus-visible:outline-none focus-visible:text-base-contrast",
                isActive
                  ? "border-[#9c75ff] text-base-contrast"
                  : "border-transparent text-base-contrast-54"
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="w-full" role="tabpanel">
        {activeContent}
      </div>
    </div>
  );
};

export default ToggleTab;
