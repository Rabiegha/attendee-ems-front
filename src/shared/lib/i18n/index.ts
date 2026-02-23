import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES } from '@/app/config/constants'

// Import translations
import commonFr from './locales/fr/common.json'
import authFr from './locales/fr/auth.json'
import eventsFr from './locales/fr/events.json'
import attendeesFr from './locales/fr/attendees.json'
import invitationsFr from './locales/fr/invitations.json'
import signupFr from './locales/fr/signup.json'
import usersFr from './locales/fr/users.json'
import rolesFr from './locales/fr/roles.json'
import reportsFr from './locales/fr/reports.json'
import badgesFr from './locales/fr/badges.json'
import emailsFr from './locales/fr/emails.json'
import printingFr from './locales/fr/printing.json'
import downloadsFr from './locales/fr/downloads.json'

import commonEn from './locales/en/common.json'
import authEn from './locales/en/auth.json'
import eventsEn from './locales/en/events.json'
import attendeesEn from './locales/en/attendees.json'
import invitationsEn from './locales/en/invitations.json'
import signupEn from './locales/en/signup.json'
import usersEn from './locales/en/users.json'
import rolesEn from './locales/en/roles.json'
import reportsEn from './locales/en/reports.json'
import badgesEn from './locales/en/badges.json'
import emailsEn from './locales/en/emails.json'
import printingEn from './locales/en/printing.json'
import downloadsEn from './locales/en/downloads.json'

const resources = {
  fr: {
    common: commonFr,
    auth: authFr,
    events: eventsFr,
    attendees: attendeesFr,
    invitations: invitationsFr,
    signup: signupFr,
    users: usersFr,
    roles: rolesFr,
    reports: reportsFr,
    badges: badgesFr,
    emails: emailsFr,
    printing: printingFr,
    downloads: downloadsFr,
  },
  en: {
    common: commonEn,
    auth: authEn,
    events: eventsEn,
    attendees: attendeesEn,
    invitations: invitationsEn,
    signup: signupEn,
    users: usersEn,
    roles: rolesEn,
    reports: reportsEn,
    badges: badgesEn,
    emails: emailsEn,
    printing: printingEn,
    downloads: downloadsEn,
  },
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: DEFAULT_LANGUAGE,
    supportedLngs: [...SUPPORTED_LANGUAGES],

    // Namespace configuration
    defaultNS: 'common',
    ns: ['common', 'auth', 'events', 'attendees', 'invitations', 'signup', 'users', 'roles', 'reports', 'badges', 'emails', 'printing', 'downloads'],

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
