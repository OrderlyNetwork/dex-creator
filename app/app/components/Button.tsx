import { ButtonHTMLAttributes, AnchorHTMLAttributes } from "react";
import { clsx } from "clsx";
import React from "react";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "danger"
  | "ghost"
  | "success";
export type ButtonSize = "xs" | "sm" | "md" | "lg";

type ButtonAsButton = {
  as?: "button";
} & ButtonHTMLAttributes<HTMLButtonElement>;

type ButtonAsAnchor = {
  as: "a";
} & AnchorHTMLAttributes<HTMLAnchorElement>;

export type ButtonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isLoading?: boolean;
  loadingIndicator?: React.ReactNode;
  loadingText?: string;
  withGlow?: boolean;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  children: React.ReactNode;
} & (ButtonAsButton | ButtonAsAnchor);

export function Button({
  variant = "primary",
  size = "md",
  leftIcon,
  rightIcon,
  isLoading = false,
  loadingIndicator,
  loadingText,
  withGlow = false,
  children,
  as = "button",
  className,
  disabled,
  type = "button",
  ...props
}: ButtonProps) {
  const baseClasses =
    "rounded-full py-2 font-medium transition-all duration-200 cursor-pointer border-none";

  const sizeClasses = {
    xs: "text-xs py-1 px-3",
    sm: "text-sm py-1.5 px-4",
    md: "py-2 px-6",
    lg: "text-lg py-2.5 px-8",
  };

  const variantClasses = {
    primary:
      "bg-gradient-to-r from-primary to-secondary text-white shadow-glow hover:from-primary-light hover:to-secondary-light hover:shadow-glow-hover hover:transform hover:-translate-y-0.5",
    secondary:
      "bg-primary/10 text-white border-2 border-primary/50 hover:border-primary/80 hover:bg-primary/20 shadow-sm hover:shadow",
    danger: "bg-red-500 text-white hover:bg-red-600",
    ghost: "bg-transparent text-white hover:bg-white/10",
    success: "bg-success text-white hover:bg-success-light",
  };

  const glowClass = withGlow
    ? "relative after:absolute after:inset-0 after:rounded-full after:bg-primary/20 after:blur-lg after:transform after:scale-110 after:-z-10"
    : "";
  const disabledClass =
    disabled || isLoading ? "opacity-60 cursor-not-allowed" : "";

  const buttonContent = (
    <>
      {isLoading ? (
        <>
          {loadingIndicator || (
            <span className="mr-2 inline-block">
              <div className="i-svg-spinners:180-ring-with-bg h-4 w-4" />
            </span>
          )}
          {loadingText || children}
        </>
      ) : (
        <>
          {leftIcon && <span className="mr-2">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="ml-2">{rightIcon}</span>}
        </>
      )}
    </>
  );

  const classes = clsx(
    baseClasses,
    sizeClasses[size],
    variantClasses[variant],
    glowClass,
    disabledClass,
    className
  );

  if (as === "a") {
    return (
      <a
        className={classes}
        {...(props as AnchorHTMLAttributes<HTMLAnchorElement>)}
      >
        {buttonContent}
      </a>
    );
  }

  return (
    <button
      className={classes}
      disabled={disabled || isLoading}
      type={type}
      data-variant={variant}
      {...(props as ButtonHTMLAttributes<HTMLButtonElement>)}
    >
      {buttonContent}
    </button>
  );
}
