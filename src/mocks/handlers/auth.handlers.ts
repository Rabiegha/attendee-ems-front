/**
 * MSW Handlers - Auth API (Mock temporaire)
 *
 * Handlers pour les appels d'authentification pendant le développement
 */

import { http, HttpResponse } from 'msw'

const API_BASE = 'http://localhost:3000'

export const authHandlers = [
  // GET /users/me
  http.get(`${API_BASE}/users/me`, () => {
    return HttpResponse.json({
      id: 'user-admin-001',
      email: 'jane.smith@acme.com',
      first_name: 'Jane',
      last_name: 'Smith',
      roles: ['ADMIN'],
      isSuperAdmin: false,
      org_id: '1c510d95-0056-4c33-9c2b-c9a36f3c629e',
      organization: {
        id: '1c510d95-0056-4c33-9c2b-c9a36f3c629e',
        name: 'ACME Corp',
      },
    })
  }),

  // GET /auth/policy
  http.get(`${API_BASE}/auth/policy`, () => {
    return HttpResponse.json({
      rules: [
        { action: 'manage', subject: 'Event' },
        { action: 'manage', subject: 'Attendee' },
        { action: 'read', subject: 'User' },
        { action: 'manage', subject: 'Registration' },
      ],
    })
  }),

  // POST /auth/refresh
  http.post(`${API_BASE}/auth/refresh`, () => {
    return HttpResponse.json({
      access_token: 'mock-refreshed-token',
      expires_in: 3600,
    })
  }),
]
