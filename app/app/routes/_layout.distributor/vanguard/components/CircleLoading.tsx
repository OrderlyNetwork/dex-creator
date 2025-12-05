import React from "react";
import { cn } from "../utils";

const CircleLoading: React.FC = () => {
  const cls = "w-[6.67px] h-[6.67px] rounded-full";

  return (
    <div className="flex items-center gap-[4px]">
      <div className={cn(cls, "button-loading-circle-1")} />
      <div className={cn(cls, "button-loading-circle-2")} />
      <div className={cn(cls, "button-loading-circle-3")} />
    </div>
  );
};

export default CircleLoading;
