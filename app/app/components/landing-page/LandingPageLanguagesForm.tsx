import { toast } from "react-toastify";
import { Card } from "../Card";
import { AVAILABLE_LANGUAGES } from "../LanguageSupportSection";
import type { LandingPageConfigForm } from "../../types/landingPageConfig";

interface LandingPageLanguagesFormProps {
  formData: LandingPageConfigForm;
  onLanguagesChange: (languages: string[]) => void;
}

export function LandingPageLanguagesForm({
  formData,
  onLanguagesChange,
}: LandingPageLanguagesFormProps) {
  const handleLanguageToggle = (code: string, isSelected: boolean) => {
    const newLanguages = isSelected
      ? formData.languages.filter(c => c !== code)
      : [...formData.languages, code];

    if (newLanguages.length === 0) {
      toast.error("At least one language must be selected");
      return;
    }

    onLanguagesChange(newLanguages);
  };

  return (
    <Card>
      <h2 className="text-lg font-bold mb-4">Supported Languages</h2>
      <div className="space-y-4">
        <div className="mb-3">
          <p className="text-xs text-gray-400 mb-2">
            Select languages for your landing page. At least one language is
            required.
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {AVAILABLE_LANGUAGES.map(language => {
            const isSelected = formData.languages.includes(language.code);

            return (
              <button
                key={language.code}
                type="button"
                onClick={() => handleLanguageToggle(language.code, isSelected)}
                className={`
                  flex items-center gap-2 p-2 rounded-lg border text-sm transition-all cursor-pointer
                  ${
                    isSelected
                      ? "bg-primary/20 border-primary text-primary-light"
                      : "bg-background-dark/50 border-light/10 text-gray-300 hover:border-light/20 hover:bg-background-dark/80"
                  }
                `}
              >
                <span className="text-base">{language.flag}</span>
                <span className="flex-1 text-left truncate">
                  {language.name}
                </span>
                {isSelected && (
                  <div className="i-mdi:check h-4 w-4 text-primary-light flex-shrink-0"></div>
                )}
              </button>
            );
          })}
        </div>
        {formData.languages.length === 0 && (
          <div className="text-center py-4 text-gray-400 text-sm mt-2">
            <div className="i-mdi:information-outline h-5 w-5 mx-auto mb-2"></div>
            No languages selected. At least one language is required.
          </div>
        )}
      </div>
    </Card>
  );
}
