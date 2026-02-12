import { useState } from "react";
import { defaultLanguages, i18n } from "~/i18n";

export type LanguageSwitcherScriptReturn = ReturnType<
  typeof useLanguageSwitcherScript
>;

export const useLanguageSwitcherScript = () => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedLang, setSelectedLang] = useState(i18n.language);
  const languages = defaultLanguages;

  const onLangChange = async (lang: string, displayName: string) => {
    setLoading(true);
    setSelectedLang(lang);
    // await onLanguageBeforeChanged(lang);
    await i18n.changeLanguage(lang);
    // await onLanguageChanged(lang);
    setLoading(false);
    setOpen(false);
  };

  return {
    open,
    onOpenChange: setOpen,
    languages,
    selectedLang,
    onLangChange,
    loading,
  };
};
