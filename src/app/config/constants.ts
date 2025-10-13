export const APP_NAME = 'Event Management System'
export const APP_VERSION = '1.0.0'

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/v1/auth/login',
    ME: '/v1/users/me',
    LOGOUT: '/v1/auth/logout',
    POLICY: '/v1/auth/policy',
  },
  EVENTS: {
    LIST: '/v1/events',
    BY_ID: (id: string) => `/v1/events/${id}`,
    CREATE: '/v1/events',
    UPDATE: (id: string) => `/v1/events/${id}`,
    DELETE: (id: string) => `/v1/events/${id}`,
  },
  ATTENDEES: {
    LIST: '/v1/attendees',
    BY_ID: (id: string) => `/v1/attendees/${id}`,
    UPDATE_STATUS: (id: string) => `/v1/attendees/${id}/status`,
    EXPORT: '/v1/attendees/export',
  },
  USERS: {
    LIST: '/v1/users',
    BY_ID: (id: string) => `/v1/users/${id}`,
    CREATE: '/v1/users',
  },
  ORGANIZATIONS: {
    ME: '/v1/organizations/me',
  },
} as const

export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  EVENTS: '/events',
  EVENT_DETAILS: (id: string) => `/events/${id}`,
  ATTENDEES: '/attendees',
  USERS: '/users',
  ROLES_PERMISSIONS: '/roles-permissions',
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
