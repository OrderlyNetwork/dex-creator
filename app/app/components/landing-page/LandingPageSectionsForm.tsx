import { toast } from "react-toastify";
import { Card } from "../Card";
import type { LandingPageConfigForm } from "../../types/landingPageConfig";

const SECTIONS = [
  { id: "hero", label: "Hero", icon: "i-mdi:home" },
  { id: "cta", label: "CTA", icon: "i-mdi:cursor-pointer" },
  { id: "about", label: "About", icon: "i-mdi:information" },
  { id: "features", label: "Features", icon: "i-mdi:star" },
  { id: "feeStructure", label: "Fee Structure", icon: "i-mdi:percent" },
  { id: "faq", label: "FAQ", icon: "i-mdi:help-circle" },
  { id: "team", label: "Team", icon: "i-mdi:account-multiple" },
  { id: "contact", label: "Contact", icon: "i-mdi:email" },
  { id: "socials", label: "Socials", icon: "i-mdi:share-variant" },
];

interface LandingPageSectionsFormProps {
  formData: LandingPageConfigForm;
  onInputChange: (field: keyof LandingPageConfigForm, value: unknown) => void;
  sectionsWithConfig: string[];
  onOpenSectionConfig: (sectionId: string) => void;
}

export function LandingPageSectionsForm({
  formData,
  onInputChange,
  sectionsWithConfig,
  onOpenSectionConfig,
}: LandingPageSectionsFormProps) {
  const enabledSections = formData.enabledSections || [];

  const handleSectionToggle = (sectionId: string, isEnabled: boolean) => {
    const newSections = isEnabled
      ? enabledSections.filter(s => s !== sectionId)
      : [...enabledSections, sectionId];

    if (sectionId === "hero" && isEnabled && newSections.length === 0) {
      toast.error("Hero section must always be enabled");
      return;
    }

    onInputChange("enabledSections", newSections);

    if (
      !isEnabled &&
      newSections.includes(sectionId) &&
      sectionsWithConfig.includes(sectionId)
    ) {
      setTimeout(() => onOpenSectionConfig(sectionId), 100);
    }
  };

  return (
    <Card>
      <h2 className="text-lg font-bold mb-4">Page Sections</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Enable Sections
          </label>
          <p className="text-xs text-gray-400 mb-2">
            Select which sections to include on your landing page. The AI will
            generate appropriate content for each enabled section.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {SECTIONS.map(section => {
              const isEnabled = enabledSections.includes(section.id);
              const hasConfig = sectionsWithConfig.includes(section.id);
              const isHeroOnly =
                section.id === "hero" &&
                isEnabled &&
                enabledSections.length === 1;

              return (
                <div
                  key={section.id}
                  className={`
                    relative flex flex-col items-center gap-2 p-3 rounded-lg border text-sm transition-all
                    ${
                      isEnabled
                        ? "bg-primary/20 border-primary text-primary-light"
                        : "bg-background-dark/50 border-light/10 text-gray-300 hover:border-light/20 hover:bg-background-dark/80"
                    }
                  `}
                >
                  <button
                    type="button"
                    onClick={() => handleSectionToggle(section.id, isEnabled)}
                    disabled={isHeroOnly}
                    className={`
                      flex flex-col items-center gap-2 w-full cursor-pointer
                      ${isHeroOnly ? "opacity-50 cursor-not-allowed" : ""}
                    `}
                  >
                    <div className={`${section.icon} h-6 w-6`}></div>
                    <span>{section.label}</span>
                    {isEnabled && (
                      <div className="i-mdi:check h-4 w-4 text-primary-light"></div>
                    )}
                  </button>
                  {isEnabled && hasConfig && (
                    <button
                      type="button"
                      onClick={e => {
                        e.preventDefault();
                        e.stopPropagation();
                        onOpenSectionConfig(section.id);
                      }}
                      className="absolute top-2 right-2 p-1.5 rounded hover:bg-primary/30 text-gray-400 hover:text-primary-light transition-colors z-10"
                      title="Configure section"
                      onMouseDown={e => e.stopPropagation()}
                    >
                      <div className="i-mdi:cog h-4 w-4"></div>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
          {enabledSections.length === 0 && (
            <p className="text-sm text-red-400 mt-2">
              Please select at least one section (Hero is required).
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
