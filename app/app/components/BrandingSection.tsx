import React from "react";
import { useTranslation } from "~/i18n";
import ImagePaste from "./ImagePaste";

export interface BrandingProps {
  primaryLogo: Blob | null;
  secondaryLogo: Blob | null;
  favicon: Blob | null;
  handleImageChange: (field: string) => (blob: Blob | null) => void;
  idPrefix?: string;
}

const BrandingSection: React.FC<BrandingProps> = ({
  primaryLogo,
  secondaryLogo,
  favicon,
  handleImageChange,
  idPrefix = "",
}) => {
  const { t } = useTranslation();
  return (
    <>
      <div className="mb-6">
        <ImagePaste
          id={`${idPrefix}primaryLogo`}
          label={
            <>
              {t("brandingSection.primaryLogo")}{" "}
              <span className="text-gray-400 text-sm font-normal">
                {t("brandingSection.optional")}
              </span>
            </>
          }
          value={primaryLogo || undefined}
          onChange={handleImageChange("primaryLogo")}
          imageType="primaryLogo"
          helpText={t("brandingSection.primaryLogoHelp")}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ImagePaste
          id={`${idPrefix}secondaryLogo`}
          label={
            <>
              {t("brandingSection.secondaryLogo")}{" "}
              <span className="text-gray-400 text-sm font-normal">
                {t("brandingSection.optional")}
              </span>
            </>
          }
          value={secondaryLogo || undefined}
          onChange={handleImageChange("secondaryLogo")}
          imageType="secondaryLogo"
          helpText={t("brandingSection.secondaryLogoHelp")}
        />
        <ImagePaste
          id={`${idPrefix}favicon`}
          label={
            <>
              {t("brandingSection.favicon")}{" "}
              <span className="text-gray-400 text-sm font-normal">
                {t("brandingSection.optional")}
              </span>
            </>
          }
          value={favicon || undefined}
          onChange={handleImageChange("favicon")}
          imageType="favicon"
          helpText={t("brandingSection.faviconHelp")}
        />
      </div>
    </>
  );
};

export default BrandingSection;
