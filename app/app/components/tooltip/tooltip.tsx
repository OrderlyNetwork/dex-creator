import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { cn, tv } from "../../utils/css";

const TooltipProvider = TooltipPrimitive.Provider;

// const Tooltip = TooltipPrimitive.Root;
const TooltipRoot = TooltipPrimitive.Root;

const TooltipTrigger = TooltipPrimitive.Trigger;

// const TooltipArrow = TooltipPrimitive.Arrow;

const TooltipPortal = TooltipPrimitive.Portal;

const tooltipVariants = tv({
  base: [
    "z-50",
    "overflow-hidden",
    "rounded-md",
    "bg-base-8",
    "px-2",
    "py-1",
    "text-xs",
    "text-base-contrast",
    "animate-in",
    "fade-in-0",
    "zoom-in-95",
    "data-[state=closed]:animate-out",
    "data-[state=closed]:fade-out-0",
    "data-[state=closed]:zoom-out-95",
    "data-[side=bottom]:slide-in-from-top-2",
    "data-[side=left]:slide-in-from-right-2",
    "data-[side=right]:slide-in-from-left-2",
    "data-[side=top]:slide-in-from-bottom-2",
    "border",
    "border-line-12",
  ],
});

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => {
  return (
    <TooltipPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={tooltipVariants({
        className,
      })}
      {...props}
    />
  );
});
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

const TooltipArrow = (props: {
  className?: string;
  style?: React.CSSProperties;
}) => {
  const { className, ...arrowProps } = props;
  return (
    <TooltipPrimitive.Arrow
      width={12}
      height={6}
      {...arrowProps}
      className={cn("oui-fill-base-8", className)}
    />
  );
};

export type TooltipProps = Omit<
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Root> &
    React.ComponentPropsWithoutRef<typeof TooltipContent>,
  "content"
> & {
  className?: string;
  content?: React.ReactNode;
  arrow?: TooltipPrimitive.TooltipArrowProps;
};

const Tooltip = React.forwardRef<
  React.ElementRef<typeof TooltipContent>,
  TooltipProps
>((originalProps, ref) => {
  const {
    children,
    content,
    defaultOpen,
    open,
    onOpenChange,
    delayDuration,
    disableHoverableContent,
    arrow,
    ...props
  } = originalProps;
  const { className, ...arrowProps } = arrow || {};
  return (
    <TooltipPrimitive.Root
      defaultOpen={defaultOpen}
      open={open}
      onOpenChange={onOpenChange}
      delayDuration={delayDuration}
      disableHoverableContent={disableHoverableContent}
    >
      <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
      <TooltipPortal>
        <TooltipContent ref={ref} {...props}>
          {content}
          <TooltipArrow {...arrow} />
        </TooltipContent>
      </TooltipPortal>
    </TooltipPrimitive.Root>
  );
});

Tooltip.displayName = "Tooltip";

export {
  Tooltip,
  TooltipRoot,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
  TooltipArrow,
  TooltipPortal,
};
