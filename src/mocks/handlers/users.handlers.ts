/**
 * MSW Handlers - Users API (Mock partiel)
 * 
 * Mock temporaire pour les endpoints users nécessaires au développement
 * Laisse passer les autres requêtes vers le vrai backend
 */

import { http, HttpResponse } from 'msw'

const API_BASE = 'http://localhost:3000'

export const usersHandlers = [
  // GET /users?roles=PARTNER,HOTESSE (pour sélection dans événements)
  http.get(`${API_BASE}/users`, ({ request }) => {
    const url = new URL(request.url)
    const roles = url.searchParams.get('roles')
    
    // Si c'est la requête pour les partners/hotesses
    if (roles && (roles.includes('PARTNER') || roles.includes('HOTESSE'))) {
      return HttpResponse.json([
        {
          id: 'user-partner-001',
          first_name: 'Sophie',
          last_name: 'Martin',
          email: 'sophie.martin@partner.com',
          role: {
            code: 'PARTNER',
            name: 'Partenaire'
          }
        },
        {
          id: 'user-partner-002',
          first_name: 'Pierre',
          last_name: 'Durand',
          email: 'pierre.durand@partner.com',
          role: {
            code: 'PARTNER',
            name: 'Partenaire'
          }
        },
        {
          id: 'user-hostess-001',
          first_name: 'Marie',
          last_name: 'Lambert',
          email: 'marie.lambert@events.com',
          role: {
            code: 'HOSTESS',
            name: 'Hôtesse'
          }
        },
        {
          id: 'user-hostess-002',
          first_name: 'Julie',
          last_name: 'Rousseau',
          email: 'julie.rousseau@events.com',
          role: {
            code: 'HOSTESS',
            name: 'Hôtesse'
          }
        }
      ])
    }
    
    // Sinon, laisser passer au vrai backend
    return undefined as any
  })
]
