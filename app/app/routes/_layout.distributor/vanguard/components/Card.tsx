import React from "react";
import { cn } from "../utils";
import { Tooltip } from "@orderly.network/ui";
import { InfoIcon } from "../icons";

interface CardProps {
  title: string;
  content: React.ReactNode;
  showInfoIcon?: boolean;
  infoTooltip?: string;
  className?: string;
}

const Card: React.FC<CardProps> = ({
  title,
  content,
  showInfoIcon = false,
  infoTooltip,
  className,
}) => {
  return (
    <div
      className={cn(
        "w-full rounded-lg bg-background-light/30 border border-primary-light/30 shadow-lg p-4",
        "flex flex-col gap-2",
        className
      )}
    >
      <div className="flex items-center gap-2 text-sm text-base-contrast-54">
        <span className="leading-tight">{title}</span>
        {showInfoIcon && infoTooltip && (
          <Tooltip
            delayDuration={300}
            align="center"
            sideOffset={4}
            arrow={{
              className: "!fill-[#0f1123]",
            }}
            className="max-w-[276px] px-3 !bg-[#0f1123] border border-primary-light/30 shadow-lg py-2 rounded-lg whitespace-pre-line break-words leading-[17.5px] text-xs text-white"
            content={infoTooltip}
          >
            <span
              className="cursor-pointer text-base-contrast-54 hover:text-base-contrast transition-colors flex items-center"
              aria-label="More information"
              tabIndex={0}
              role="button"
            >
              <InfoIcon className="w-4 h-4" aria-hidden="true" />
            </span>
          </Tooltip>
        )}
      </div>

      <div className="text-base font-medium text-[#9c75ff]">{content}</div>
    </div>
  );
};

export default Card;
