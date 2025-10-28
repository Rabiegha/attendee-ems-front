import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES } from '@/app/config/constants'

// Import translations
import commonFr from './locales/fr/common.json'
import authFr from './locales/fr/auth.json'
import eventsFr from './locales/fr/events.json'
import attendeesFr from './locales/fr/attendees.json'

import commonEn from './locales/en/common.json'
import authEn from './locales/en/auth.json'
import eventsEn from './locales/en/events.json'
import attendeesEn from './locales/en/attendees.json'

const resources = {
  fr: {
    common: commonFr,
    auth: authFr,
    events: eventsFr,
    attendees: attendeesFr,
  },
  en: {
    common: commonEn,
    auth: authEn,
    events: eventsEn,
    attendees: attendeesEn,
  },
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: DEFAULT_LANGUAGE,
    fallbackLng: DEFAULT_LANGUAGE,
    supportedLngs: [...SUPPORTED_LANGUAGES],

    // Namespace configuration
    defaultNS: 'common',
    ns: ['common', 'auth', 'events', 'attendees'],

    // Lazy loading configuration
    load: 'languageOnly',

    interpolation: {
      escapeValue: false, // React already escapes values
    },

    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'language',
    },

    react: {
      useSuspense: true,
    },
  })

export default i18n
