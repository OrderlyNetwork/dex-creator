import { SVGProps } from "react";
import { cn } from "../utils/css";

export const TooltipIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width={16}
    height={16}
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
    className={cn("cursor-pointer", props.className)}
  >
    <path
      d="M8 1.343a6.667 6.667 0 1 0 0 13.333A6.667 6.667 0 0 0 8 1.343m0 3.333A.667.667 0 1 1 8 6.01a.667.667 0 0 1 0-1.334m0 2c.368 0 .666.299.666.667v3.333a.667.667 0 0 1-1.333 0V7.343c0-.368.298-.667.667-.667"
      fill="#fff"
      fillOpacity={0.36}
    />
  </svg>
);
