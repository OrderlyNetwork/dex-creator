import React, { useMemo, useState, useEffect } from "react";

export type WalletIconProps = {
  name: string;
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

export const WalletIcon: React.FC<WalletIconProps> = ({
  name,
  className = "",
  size = "xs",
}) => {
  const [imageError, setImageError] = useState(false);
  const url = useMemo(() => {
    const split = name?.split(" ");
    const formatWalletName = split?.[0]?.toLowerCase();
    return `https://oss.orderly.network/static/wallet_icon/${formatWalletName}.png`;
  }, [name]);

  useEffect(() => {
    setImageError(false);
  }, [url]);

  const sizeClass = sizeMap[size];

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
      alt={name}
      onError={() => setImageError(true)}
    />
  );
};
