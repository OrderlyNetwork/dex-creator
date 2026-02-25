import React from "react";
import { useTranslation } from "~/i18n";
import FormInput from "./FormInput";

export interface SocialLinksProps {
  telegramLink: string;
  discordLink: string;
  xLink: string;
  handleInputChange: (
    field: string
  ) => (e: React.ChangeEvent<HTMLInputElement>) => void;
  urlValidator: (value: string) => string | null;
  idPrefix?: string;
}

const SocialLinksSection: React.FC<SocialLinksProps> = ({
  telegramLink,
  discordLink,
  xLink,
  handleInputChange,
  urlValidator,
  idPrefix = "",
}) => {
  const { t } = useTranslation();
  return (
    <>
      <FormInput
        id={`${idPrefix}telegramLink`}
        label={
          <>
            {t("socialLinksSection.telegramUrl")}{" "}
            <span className="text-gray-400 text-sm font-normal">
              ({t("socialLinksSection.optional")})
            </span>
          </>
        }
        value={telegramLink}
        onChange={handleInputChange("telegramLink")}
        type="url"
        placeholder="https://t.me/your-group"
        validator={urlValidator}
      />
      <FormInput
        id={`${idPrefix}discordLink`}
        label={
          <>
            {t("socialLinksSection.discordUrl")}{" "}
            <span className="text-gray-400 text-sm font-normal">
              ({t("socialLinksSection.optional")})
            </span>
          </>
        }
        value={discordLink}
        onChange={handleInputChange("discordLink")}
        type="url"
        placeholder="https://discord.gg/your-server"
        validator={urlValidator}
      />
      <FormInput
        id={`${idPrefix}xLink`}
        label={
          <>
            {t("socialLinksSection.xUrl")}{" "}
            <span className="text-gray-400 text-sm font-normal">
              ({t("socialLinksSection.optional")})
            </span>
          </>
        }
        value={xLink}
        onChange={handleInputChange("xLink")}
        type="url"
        placeholder="https://twitter.com/your-account"
        validator={urlValidator}
      />
    </>
  );
};

export default SocialLinksSection;
