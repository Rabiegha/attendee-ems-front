export const APP_NAME = 'Event Management System'
export const APP_VERSION = '1.0.0'

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    ME: '/auth/me',
    LOGOUT: '/auth/logout',
    POLICY: '/auth/policy',
  },
  EVENTS: {
    LIST: '/events',
    BY_ID: (id: string) => `/events/${id}`,
    CREATE: '/events',
    UPDATE: (id: string) => `/events/${id}`,
    DELETE: (id: string) => `/events/${id}`,
  },
  ATTENDEES: {
    LIST: '/attendees',
    BY_ID: (id: string) => `/attendees/${id}`,
    UPDATE_STATUS: (id: string) => `/attendees/${id}/status`,
    EXPORT: '/attendees/export',
  },
} as const

export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  EVENTS: '/events',
  EVENT_DETAILS: (id: string) => `/events/${id}`,
  ATTENDEES: '/attendees',
  LOGIN: '/login',
  FORBIDDEN: '/403',
} as const

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_PREFERENCES: 'user_preferences',
  LANGUAGE: 'language',
} as const

export const DEFAULT_LANGUAGE = 'fr'
export const SUPPORTED_LANGUAGES = ['fr', 'en'] as const
