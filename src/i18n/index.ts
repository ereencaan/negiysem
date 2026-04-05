import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'expo-localization';
import tr from './locales/tr.json';

const deviceLanguage = getLocales()[0]?.languageCode ?? 'tr';

i18n.use(initReactI18next).init({
  resources: {
    tr: { translation: tr },
  },
  lng: deviceLanguage === 'tr' ? 'tr' : 'tr', // TR only for MVP
  fallbackLng: 'tr',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
