import React from "react";
import { useTranslation, Trans } from "~/i18n";

interface AnalyticsConfigSectionProps {
  analyticsScript: string;
  handleInputChange: (
    field: string
  ) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  idPrefix?: string;
}

const AnalyticsConfigSection: React.FC<AnalyticsConfigSectionProps> = ({
  analyticsScript,
  handleInputChange,
  idPrefix = "",
}) => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label
          htmlFor={`${idPrefix}analyticsScript`}
          className="text-sm font-medium text-gray-200"
        >
          {t("analyticsConfigSection.label")}
        </label>
        <textarea
          id={`${idPrefix}analyticsScript`}
          name="analyticsScript"
          value={analyticsScript}
          onChange={handleInputChange("analyticsScript")}
          placeholder={t("analyticsConfigSection.placeholder")}
          className="w-full px-3 py-2 bg-background-light/30 border border-light/20 rounded-lg text-sm font-mono resize-y min-h-[160px] focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50"
          maxLength={2000}
        />
        <div className="flex items-start gap-2 text-xs text-gray-400">
          <div className="flex-shrink-0 mt-0.5">
            <div className="i-heroicons:information-circle w-4 h-4" />
          </div>
          <div className="flex-1">
            <p className="mb-2">{t("analyticsConfigSection.addScriptDesc")}</p>
            <p>
              <Trans
                i18nKey="analyticsConfigSection.noteDesc"
                components={[<strong key="0" />]}
              />
            </p>
          </div>
        </div>
        {analyticsScript && (
          <p className="text-xs text-gray-500">
            {analyticsScript.length} / 2,000{" "}
            {t("analyticsConfigSection.characters")}
          </p>
        )}
      </div>
    </div>
  );
};

export default AnalyticsConfigSection;
