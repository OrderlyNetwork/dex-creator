import React from "react";
import { cn } from "../utils/css";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "error" | "success" | "warning";
  id?: string;
}

export function Card({
  children,
  className,
  variant = "default",
  id,
}: CardProps) {
  const baseClasses = "rounded-xl backdrop-blur-sm p-2 md:p-6";

  const variantClasses = {
    default: "bg-background-light/30 border border-primary-light/30 shadow-lg",
    error: "bg-red-500/10 border border-red-500/20",
    success: "bg-green-500/10 border border-green-500/20",
    warning: "bg-yellow-500/10 border border-yellow-500/20",
  };

  const classes = cn(baseClasses, variantClasses[variant], className);

  return (
    <div id={id} className={classes}>
      {children}
    </div>
  );
}
