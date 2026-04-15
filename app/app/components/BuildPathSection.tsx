import { useState } from "react";
import { useTranslation } from "~/i18n";

type IntegrationType = "low_code" | "custom";
type OnSelectCallback = (type: IntegrationType) => void;

let globalOnBuildPathSelect: OnSelectCallback | null = null;

export function setBuildPathSelectCallback(cb: OnSelectCallback | null) {
  globalOnBuildPathSelect = cb;
}

interface BuildPathSectionProps {}

export type { IntegrationType };

export default function BuildPathSection(_props: BuildPathSectionProps) {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<IntegrationType | null>(null);

  const handleSelect = (type: IntegrationType) => {
    setSelected(type);
    globalOnBuildPathSelect?.(type);
  };

  return (
    <div className="space-y-3">
      <div
        className={`rounded-xl backdrop-blur-sm border cursor-pointer transition-all duration-200 p-2 md:p-3 ${
          selected === "low_code"
            ? "border-primary bg-primary/5 ring-1 ring-primary/50"
            : "border-light/20 hover:border-light/40 bg-background-light/30"
        }`}
        onClick={() => handleSelect("low_code")}
      >
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0 p-2.5 rounded-full border border-light/10">
            <div className="i-mdi:rocket-launch text-gray-400 w-5 h-5"></div>
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-white mb-0.5">
              {t("dex.buildPath.lowCode.title")}
            </h4>
            <p className="text-gray-400 text-xs leading-relaxed">
              {t("dex.buildPath.lowCode.description")}
            </p>
          </div>
          {selected === "low_code" && (
            <div className="flex-shrink-0 i-mdi:check-circle text-primary w-5 h-5"></div>
          )}
        </div>
      </div>

      <div
        className={`rounded-xl backdrop-blur-sm border cursor-pointer transition-all duration-200 p-2 md:p-3 ${
          selected === "custom"
            ? "border-primary bg-primary/5 ring-1 ring-primary/50"
            : "border-light/20 hover:border-light/40 bg-background-light/30"
        }`}
        onClick={() => handleSelect("custom")}
      >
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0 p-2.5 rounded-full border border-light/10">
            <div className="i-mdi:code-braces-box text-gray-400 w-5 h-5"></div>
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-white mb-0.5">
              {t("dex.buildPath.custom.title")}
            </h4>
            <p className="text-gray-400 text-xs leading-relaxed">
              {t("dex.buildPath.custom.description")}
            </p>
          </div>
          {selected === "custom" && (
            <div className="flex-shrink-0 i-mdi:check-circle text-primary w-5 h-5"></div>
          )}
        </div>
      </div>
    </div>
  );
}
