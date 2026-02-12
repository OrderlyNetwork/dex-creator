import { FC, ReactNode, useEffect } from "react";
import { I18nextProvider } from "react-i18next";
import { defaultNS } from "./constant";
import i18n from "./i18n";
import { parseI18nLang } from "./utils";

export type LocaleProviderProps = {
  children: ReactNode;
};

export const LocaleProvider: FC<LocaleProviderProps> = props => {
  const { children } = props;

  useEffect(() => {
    // init language when refresh page
    const initLanguage = async () => {
      const lang = parseI18nLang(i18n.language);

      // if browser language is not a valid language, change language
      if (lang !== i18n.language) {
        await i18n.changeLanguage(lang);
      }
    };

    initLanguage();
  }, [i18n.language]);

  return (
    <I18nextProvider i18n={i18n} defaultNS={defaultNS}>
      {children}
    </I18nextProvider>
  );
};
