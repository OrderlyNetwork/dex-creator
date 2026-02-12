import { createInstance } from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import {
  defaultLng,
  defaultNS,
  i18nCookieKey,
  i18nLocalStorageKey,
  LocaleEnum,
} from "./constant";
import { en } from "./module";
import resourcesToBackend from "i18next-resources-to-backend";
export const resources = {
  [defaultLng]: { [defaultNS]: en },
};

const languageDetector = new LanguageDetector(null, {
  lookupLocalStorage: i18nLocalStorageKey,
  lookupCookie: i18nCookieKey,
  caches: ["localStorage", "cookie"],
});

// https://react.i18next.com/latest/i18nextprovider#when-to-use
const i18n = createInstance({
  // lng: defaultLng,
  fallbackLng: defaultLng,
  // debug: true,
  interpolation: {
    escapeValue: false,
  },
  // resources,
})
  .use(
    resourcesToBackend((lng: string, ns: string) => {
      if (lng === LocaleEnum.en) {
        return Promise.resolve({ default: en });
      }
      return import(`./locales/${lng}.json`);
    })
  )
  .use(languageDetector);

i18n.init();

export default i18n;
