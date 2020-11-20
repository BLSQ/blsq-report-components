import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import translationEN from "../locales/en.json";
import translationFR from "../locales/fr.json";

const configureI18N = lang => {
  const translation = lang === "fr" ? translationFR : translationEN;
  const resources = {
    en: { translation: { ...translation, ...translationEN } },
    fr: { translation: { ...translation, ...translationFR } }
  };
  i18n.use(initReactI18next).init({
    resources: resources,
    lng: lang,
    interpolation: {
      escapeValue: false, // react already safes from xss
      formatSeparator: ',',
    },
    react: {
        wait: true,
    },
  });

  return i18n;
};

export default configureI18N;
