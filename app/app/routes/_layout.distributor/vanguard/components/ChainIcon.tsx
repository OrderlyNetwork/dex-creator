import React, { useMemo, useState, useEffect } from "react";

export type ChainIconProps = {
  chainId: string | number;
  className?: string;
  size?: "2xs" | "xs" | "sm" | "md" | "lg";
  alt?: string;
};

const sizeMap = {
  "2xs": "w-3 h-3",
  xs: "w-3.5 h-3.5",
  sm: "w-4 h-4",
  md: "w-5 h-5",
  lg: "w-6 h-6",
};

export const ChainIcon: React.FC<ChainIconProps> = ({
  chainId,
  className = "",
  size = "sm",
  alt,
}) => {
  const [imageError, setImageError] = useState(false);
  const url = useMemo(() => {
    return `https://oss.orderly.network/static/network_logo/${chainId}.png`;
  }, [chainId]);

  useEffect(() => {
    setImageError(false);
  }, [url]);

  const sizeClass = sizeMap[size];
  const displayAlt = alt || `Chain ${chainId}`;

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
      alt={displayAlt}
      onError={() => setImageError(true)}
    />
  );
};
