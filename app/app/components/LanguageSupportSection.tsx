import { Card } from "./Card";

export const AVAILABLE_LANGUAGES = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "zh", name: "中文", flag: "🇨🇳" },
  { code: "ja", name: "日本語", flag: "🇯🇵" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "ko", name: "한국어", flag: "🇰🇷" },
  { code: "vi", name: "Tiếng Việt", flag: "🇻🇳" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "ru", name: "Русский", flag: "🇷🇺" },
  { code: "id", name: "Bahasa Indonesia", flag: "🇮🇩" },
  { code: "tr", name: "Türkçe", flag: "🇹🇷" },
  { code: "it", name: "Italiano", flag: "🇮🇹" },
  { code: "pt", name: "Português", flag: "🇵🇹" },
  { code: "uk", name: "Українська", flag: "🇺🇦" },
  { code: "pl", name: "Polski", flag: "🇵🇱" },
  { code: "nl", name: "Nederlands", flag: "🇳🇱" },
];

interface LanguageSupportSectionProps {
  availableLanguages: string[];
  onAvailableLanguagesChange: (languages: string[]) => void;
}

export default function LanguageSupportSection({
  availableLanguages,
  onAvailableLanguagesChange,
}: LanguageSupportSectionProps) {
  const handleLanguageToggle = (languageCode: string) => {
    const isSelected = availableLanguages.includes(languageCode);

    if (isSelected) {
      onAvailableLanguagesChange(
        availableLanguages.filter(code => code !== languageCode)
      );
    } else {
      onAvailableLanguagesChange([...availableLanguages, languageCode]);
    }
  };

  const handleToggleAll = () => {
    const allSelected = selectedCount === AVAILABLE_LANGUAGES.length;

    if (allSelected) {
      onAvailableLanguagesChange([]);
    } else {
      const allLanguageCodes = AVAILABLE_LANGUAGES.map(lang => lang.code);
      onAvailableLanguagesChange(allLanguageCodes);
    }
  };

  const selectedCount = availableLanguages.length;
  const allSelected = selectedCount === AVAILABLE_LANGUAGES.length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h4 className="text-sm font-medium mb-1">Available Languages</h4>
          <p className="text-xs text-gray-400">
            Select the languages you want to support in your DEX interface.
            {selectedCount > 0 && (
              <span className="text-primary-light ml-1">
                ({selectedCount} selected)
              </span>
            )}
          </p>
        </div>
        <button
          type="button"
          onClick={handleToggleAll}
          className="px-3 py-1 text-xs rounded-md transition-all bg-primary/20 text-primary-light hover:bg-primary/30 border border-primary/30"
        >
          {allSelected ? "Unselect All" : "Select All"}
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
        {AVAILABLE_LANGUAGES.map(language => {
          const isSelected = availableLanguages.includes(language.code);

          return (
            <button
              key={language.code}
              type="button"
              onClick={() => handleLanguageToggle(language.code)}
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
              <span className="flex-1 text-left truncate">{language.name}</span>
              {isSelected && (
                <div className="i-mdi:check h-4 w-4 text-primary-light flex-shrink-0"></div>
              )}
            </button>
          );
        })}
      </div>

      {availableLanguages.length === 0 && (
        <div className="text-center py-4 text-gray-400 text-sm">
          <div className="i-mdi:information-outline h-5 w-5 mx-auto mb-2"></div>
          No languages selected. Your DEX will default to English only.
        </div>
      )}

      <Card>
        <h5 className="text-sm font-medium mb-1 flex items-center">
          <div className="i-mdi:information-outline text-info mr-2 h-4 w-4"></div>
          Language Support Information
        </h5>
        <ul className="text-xs text-gray-300 space-y-1">
          <li>
            • If no languages are selected, your DEX will default to English
            only
          </li>
          <li>
            • Users will see a language selector in your DEX interface when
            multiple languages are selected
          </li>
          <li>
            • The interface will automatically adapt to the selected language
          </li>
          <li>• You can add or remove languages at any time</li>
        </ul>
      </Card>
    </div>
  );
}
