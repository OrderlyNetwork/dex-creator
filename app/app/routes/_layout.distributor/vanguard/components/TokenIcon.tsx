import React, { useMemo, useState, useEffect } from "react";

export type TokenIconProps = {
  name?: string;
  symbol?: string;
  className?: string;
  size?: "2xs" | "xs" | "sm" | "md" | "lg";
};

const sizeMap = {
  "2xs": "w-3 h-3",
  xs: "w-3.5 h-3.5",
  sm: "w-4 h-4",
  md: "w-5 h-5",
  lg: "w-6 h-6",
};

export const TokenIcon: React.FC<TokenIconProps> = ({
  name,
  symbol,
  className = "",
  size = "sm",
}) => {
  const [imageError, setImageError] = useState(false);
  const url = useMemo(() => {
    let tokenName = name;
    if (typeof symbol === "string") {
      const arr = symbol?.split("_");
      tokenName = arr[1];
    }
    return `https://oss.orderly.network/static/symbol_logo/${tokenName}.png`;
  }, [name, symbol]);

  useEffect(() => {
    setImageError(false);
  }, [url]);

  const sizeClass = sizeMap[size];
  const displayName = name || symbol || "";

  if (imageError) {
    return (
      <div
        className={`${sizeClass} rounded-full bg-purple-fallback border border-base-contrast-12 flex items-center justify-center ${className}`}
      />
    );
  }

  return (
    <img
      className={`${sizeClass} rounded-full ${className}`}
      src={url}
      alt={displayName}
      onError={() => setImageError(true)}
    />
  );
};
