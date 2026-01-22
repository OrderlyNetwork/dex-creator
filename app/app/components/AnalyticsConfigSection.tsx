import React from "react";

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
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label
          htmlFor={`${idPrefix}analyticsScript`}
          className="text-sm font-medium text-gray-200"
        >
          Analytics Script
        </label>
        <textarea
          id={`${idPrefix}analyticsScript`}
          name="analyticsScript"
          value={analyticsScript}
          onChange={handleInputChange("analyticsScript")}
          placeholder="Paste your analytics script here (including <script> tags)&#10;&#10;Example:&#10;<script async src='https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX'></script>&#10;<script>&#10;  window.dataLayer = window.dataLayer || [];&#10;  function gtag(){dataLayer.push(arguments);}&#10;  gtag('js', new Date());&#10;  gtag('config', 'G-XXXXXXXXXX');&#10;</script>"
          className="w-full px-3 py-2 bg-background-light/30 border border-light/20 rounded-lg text-sm font-mono resize-y min-h-[160px] focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50"
          maxLength={2000}
        />
        <div className="flex items-start gap-2 text-xs text-gray-400">
          <div className="flex-shrink-0 mt-0.5">
            <div className="i-heroicons:information-circle w-4 h-4" />
          </div>
          <div className="flex-1">
            <p className="mb-2">
              Add your analytics tracking script from any provider that uses
              script tags. The script will be securely injected into your DEX.
            </p>
            <p>
              <strong>Note:</strong> Include the complete script tags exactly as
              provided by your analytics service. The script will be placed in
              the DEX's HTML head section.
            </p>
          </div>
        </div>
        {analyticsScript && (
          <p className="text-xs text-gray-500">
            {analyticsScript.length} / 2,000 characters
          </p>
        )}
      </div>
    </div>
  );
};

export default AnalyticsConfigSection;
