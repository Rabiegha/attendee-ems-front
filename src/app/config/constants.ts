export const APP_NAME = 'Event Management System'
export const APP_VERSION = '1.0.0'

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REFRESH: '/auth/refresh',
    ME: '/users/me',
    LOGOUT: '/auth/logout',
    POLICY: '/auth/policy',
    CHANGE_PASSWORD: '/auth/change-password',
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
  USERS: {
    LIST: '/users',
    BY_ID: (id: string) => `/users/${id}`,
    CREATE: '/users',
  },
  ORGANIZATIONS: {
    LIST: '/organizations',
    BY_ID: (id: string) => `/organizations/${id}`,
    ME: '/organizations/me',
    USERS: (orgId: string) => `/organizations/${orgId}/users`,
    CREATE: '/organizations',
  },
  ROLES: {
    LIST: '/roles',
    BY_ID: (id: string) => `/roles/${id}`,
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
