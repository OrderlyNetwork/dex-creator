import React from "react";
import { Tooltip } from "@orderly.network/ui";

interface TableCellWithTooltipProps {
  content: React.ReactNode;
  tooltip: React.ReactNode;
}

export const TableCellWithTooltip: React.FC<TableCellWithTooltipProps> = ({
  content,
  tooltip,
}) => {
  return (
    <Tooltip
      delayDuration={300}
      align="center"
      sideOffset={4}
      arrow={{
        className: "!fill-[#0f1123]",
      }}
      className="max-w-[276px] px-3 !bg-[#0f1123] border border-primary-light/30 shadow-lg py-2 rounded-lg whitespace-pre-line break-words leading-[17.5px] text-xs text-white"
      content={tooltip}
    >
      <span className="cursor-pointer border-b border-dashed border-base-contrast-54">
        {content}
      </span>
    </Tooltip>
  );
};

export default TableCellWithTooltip;
