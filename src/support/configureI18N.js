import i18n from "i18next";
import { reactI18nextModule } from "react-i18next";

import translationEN from "../locales/en/translations.js";

const configureI18N = customResources => {
  const resources = { en: { translation: { ...translationEN, ...customResources } } };
  i18n.use(reactI18nextModule).init({
    resources: resources,
    lng: "en",
    interpolation: {
      escapeValue: false // react already safes from xss
    }
  });

  return i18n;
};

export default configureI18N;
