import { TooltipIcon } from "../../../icons/TooltipIcon";
import { cn } from "../../../utils/css";
import { Tooltip } from "../../../components/tooltip";

interface FormLabelProps {
  label: string;
  tooltip?: string;
  className?: string;
}

export function FormLabel({ label, tooltip, className = "" }: FormLabelProps) {
  if (tooltip) {
    return (
      <div className={cn("flex items-center gap-1 mb-1 md:mb-2", className)}>
        <span className="block text-xs font-semibold text-base-contrast-54">
          {label}
        </span>
        <Tooltip
          delayDuration={300}
          align="center"
          sideOffset={4}
          className="max-w-[276px]"
          content={tooltip}
        >
          <TooltipIcon />
        </Tooltip>
      </div>
    );
  }

  return (
    <label
      className={cn(
        "block text-xs font-semibold text-base-contrast-54 mb-1 md:mb-2",
        className
      )}
    >
      {label}
    </label>
  );
}
