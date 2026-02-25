import { useTranslation } from "~/i18n";
import FormInput from "./FormInput";
import { Card } from "./Card";
import ColorSwatch from "./ColorSwatch";

interface SEOConfigSectionProps {
  seoSiteName: string;
  seoSiteDescription: string;
  seoSiteLanguage: string;
  seoSiteLocale: string;
  seoTwitterHandle: string;
  seoThemeColor: string;
  seoKeywords: string;
  handleInputChange: (
    field: string
  ) => (e: React.ChangeEvent<HTMLInputElement>) => void;
  updateCssColor?: (variableName: string, newColorHex: string) => void;
}

export default function SEOConfigSection({
  seoSiteName,
  seoSiteDescription,
  seoSiteLanguage,
  seoSiteLocale,
  seoTwitterHandle,
  seoThemeColor,
  seoKeywords,
  handleInputChange,
  updateCssColor,
}: SEOConfigSectionProps) {
  const { t } = useTranslation();
  return (
    <div className="space-y-4">
      <Card className="mb-3 p-3 slide-fade-in" variant="default">
        <div className="flex items-start gap-2">
          <div className="i-mdi:information-outline text-primary-light h-4 w-4 mt-0.5 flex-shrink-0"></div>
          <div>
            <p className="text-xs text-primary-light font-medium mb-1">
              {t("seoConfigSection.seoConfiguration")}
            </p>
            <p className="text-xs text-gray-300 mb-2">
              {t("seoConfigSection.seoConfigDesc")}
            </p>
            <ul className="text-xs text-gray-300 space-y-1 list-disc ml-4">
              <li>{t("seoConfigSection.siteNameDesc")}</li>
              <li>{t("seoConfigSection.siteUrlDesc")}</li>
              <li>{t("seoConfigSection.twitterHandleDesc")}</li>
              <li>{t("seoConfigSection.themeColorDesc")}</li>
              <li>{t("seoConfigSection.keywordsDesc")}</li>
            </ul>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput
          label={t("seoConfigSection.siteName")}
          id="seoSiteName"
          value={seoSiteName}
          onChange={handleInputChange("seoSiteName")}
          placeholder={t("seoConfigSection.siteNamePlaceholder")}
          maxLength={100}
          helpText={t("seoConfigSection.siteNameHelp")}
        />

        <FormInput
          label={t("seoConfigSection.siteDescription")}
          id="seoSiteDescription"
          value={seoSiteDescription}
          onChange={handleInputChange("seoSiteDescription")}
          placeholder={t("seoConfigSection.siteDescriptionPlaceholder")}
          maxLength={300}
          helpText={t("seoConfigSection.siteDescriptionHelp")}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput
          label={t("seoConfigSection.siteLanguage")}
          id="seoSiteLanguage"
          value={seoSiteLanguage}
          onChange={handleInputChange("seoSiteLanguage")}
          placeholder={t("seoConfigSection.siteLanguagePlaceholder")}
          helpText={t("seoConfigSection.siteLanguageHelp")}
          validator={value => {
            if (!value || value.trim() === "") return null;
            const regex = /^[a-z]{2}(-[A-Z]{2})?$/;
            if (!regex.test(value)) {
              return t("seoConfigSection.siteLanguageFormat");
            }
            return null;
          }}
        />

        <FormInput
          label={t("seoConfigSection.siteLocale")}
          id="seoSiteLocale"
          value={seoSiteLocale}
          onChange={handleInputChange("seoSiteLocale")}
          placeholder={t("seoConfigSection.siteLocalePlaceholder")}
          helpText={t("seoConfigSection.siteLocaleHelp")}
          validator={value => {
            if (!value || value.trim() === "") return null;
            const regex = /^[a-z]{2}_[A-Z]{2}$/;
            if (!regex.test(value)) {
              return t("seoConfigSection.siteLocaleFormat");
            }
            return null;
          }}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput
          label={t("seoConfigSection.twitterHandle")}
          id="seoTwitterHandle"
          value={seoTwitterHandle}
          onChange={handleInputChange("seoTwitterHandle")}
          // i18n-ignore
          placeholder="@mydex"
          helpText={t("seoConfigSection.twitterHandleHelp")}
          validator={value => {
            if (!value || value.trim() === "") return null;
            const regex = /^@[a-zA-Z0-9_]+$/;
            if (!regex.test(value)) {
              return t("seoConfigSection.twitterHandleFormat");
            }
            return null;
          }}
        />

        <div className="space-y-2">
          <label
            htmlFor="seoThemeColor"
            className="block text-sm font-bold text-gray-300"
          >
            {t("seoConfigSection.themeColor")}
          </label>
          <div className="flex items-center gap-3">
            {updateCssColor ? (
              <div className="flex items-center gap-2">
                <ColorSwatch
                  name="theme-color"
                  displayName="Theme"
                  storedValue={
                    seoThemeColor && /^#[0-9A-Fa-f]{6}$/.test(seoThemeColor)
                      ? seoThemeColor
                          .replace("#", "")
                          .match(/.{2}/g)
                          ?.map(hex => parseInt(hex, 16).toString())
                          .join(" ") || null
                      : null
                  }
                  isValid={/^#[0-9A-Fa-f]{6}$/.test(seoThemeColor)}
                  commaRgb={
                    seoThemeColor && /^#[0-9A-Fa-f]{6}$/.test(seoThemeColor)
                      ? seoThemeColor
                          .replace("#", "")
                          .match(/.{2}/g)
                          ?.map(hex => parseInt(hex, 16).toString())
                          .join(" ") || "0,0,0"
                      : "0,0,0"
                  }
                  textColor="white"
                  needsShadow={true}
                  selectedColors={[]}
                  handleCheckboxChange={() => {}}
                  handleSwatchClick={e => {
                    e.preventDefault();
                    // Create a temporary color input to trigger the color picker
                    const input = document.createElement("input");
                    input.type = "color";
                    input.value = seoThemeColor || "#1a1b23";
                    input.onchange = e => {
                      const target = e.target as HTMLInputElement;
                      const syntheticEvent = {
                        target: { value: target.value },
                      } as React.ChangeEvent<HTMLInputElement>;
                      handleInputChange("seoThemeColor")(syntheticEvent);
                    };
                    input.click();
                  }}
                  onSelectionChange={undefined}
                />
                {seoThemeColor && (
                  <button
                    type="button"
                    onClick={() => {
                      const syntheticEvent = {
                        target: { value: "" },
                      } as React.ChangeEvent<HTMLInputElement>;
                      handleInputChange("seoThemeColor")(syntheticEvent);
                    }}
                    className="px-2 py-1 text-xs text-gray-400 hover:text-gray-300 transition-colors"
                    title={t("seoConfigSection.clearThemeColor")}
                  >
                    {t("seoConfigSection.clear")}
                  </button>
                )}
              </div>
            ) : (
              <input
                type="text"
                id="seoThemeColor"
                value={seoThemeColor}
                onChange={handleInputChange("seoThemeColor")}
                placeholder={t("seoConfigSection.themeColorPlaceholder")}
                className="w-full px-3 py-2 bg-background-dark/50 border border-light/10 rounded-md text-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent"
              />
            )}
          </div>
          <p className="text-xs text-gray-400">
            {t("seoConfigSection.themeColorHelp")}
          </p>
        </div>
      </div>

      <FormInput
        label={t("seoConfigSection.keywords")}
        id="seoKeywords"
        value={seoKeywords}
        onChange={handleInputChange("seoKeywords")}
        placeholder={t("seoConfigSection.keywordsPlaceholder")}
        maxLength={500}
        helpText={t("seoConfigSection.keywordsHelp")}
      />
    </div>
  );
}
